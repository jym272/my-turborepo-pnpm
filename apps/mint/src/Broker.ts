import * as amqp from 'amqplib';
import { SagaStepResponse } from './types';

const RABBIT_URI = 'amqp://rabbit:1234@localhost:5672';

const EXCHANGE = 'reply_exchange';

export class Broker {
    private connection: amqp.Connection | undefined;
    private channel: amqp.Channel | undefined;

    constructor(private readonly queueName: string, private readonly routingKey: string) {
        this.queueName = queueName;
        this.routingKey = routingKey;
    }

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(RABBIT_URI);
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(EXCHANGE, 'direct', { durable: true });
            await this.channel.assertQueue(this.queueName, { durable: true });
            await this.channel.bindQueue(this.queueName, EXCHANGE, this.routingKey);
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
        }
    }
    sendReply(response: SagaStepResponse) {
        const { channel } = this;
        if (channel === undefined) {
            throw new Error('RabbitMQ channel not initialized.');
        }
        return channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(response)), {
            persistent: true
        });
    }
    cleanUp() {
        const { channel, connection } = this;
        if (channel) {
            void channel.close();
        }
        if (connection) {
            void connection.close();
        }
    }
}
