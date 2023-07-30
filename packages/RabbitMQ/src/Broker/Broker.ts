import * as amqp from 'amqplib';
import DirectMessageDelivery from './DirectMessageDelivery';
import { getUri } from '../connection';

export class Broker extends DirectMessageDelivery {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(queueName: string) {
        super(queueName);
    }

    private async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(getUri());
            this.channel = await this.connection.createChannel();
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
        }
    }
    public async sendToQueue<T extends Record<string, any>>(payload: T) {
        await this.connect();
        const { channel } = this;
        if (channel === undefined) {
            throw new Error('RabbitMQ channel not initialized.');
        }
        return channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(payload)), {
            persistent: true
        });
    }
    // DON'T FORGET TO CLOSE THE CHANNEL AND CONNECTION
    public cleanUp() {
        const { channel, connection } = this;
        if (channel) {
            void channel.close();
        }
        if (connection) {
            void connection.close();
        }
    }
}
