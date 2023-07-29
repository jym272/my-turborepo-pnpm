import { ConsumeMessage } from 'amqplib';
import * as amqp from 'amqplib';
import ConsumerWithRequeue from './ConsumerWithRequeue';
import { getRabbitMQConn } from '../connection';

export abstract class QueueConsumer extends ConsumerWithRequeue {
    constructor({ name, exchange }: { name: string; exchange: string }) {
        super({
            name: name,
            routingKey: `${name}_routing_key`,
            exchange
        });
    }

    public async connect() {
        this.channel = await getRabbitMQConn().createChannel();
        const { channel, exchange, queueName, routingKey } = this;
        const requeueQueue = `${queueName}_requeue`;

        await channel.assertExchange(exchange, 'direct', { durable: true });
        await channel.assertQueue(queueName, { durable: true });
        await channel.bindQueue(queueName, exchange, routingKey);

        await channel.assertExchange(ConsumerWithRequeue.requeueExchange, 'direct', { durable: true });
        await channel.assertQueue(requeueQueue, {
            durable: true,
            arguments: { 'x-dead-letter-exchange': exchange }
        });
        await channel.bindQueue(requeueQueue, ConsumerWithRequeue.requeueExchange, routingKey);
        await channel.prefetch(1); // process only one message at a time
        console.log('RabbitMQ connection established!');
    }
    protected nackWithDelay(msg: amqp.Message, delay = 2000) {
        if (this.channel === undefined) throw new Error('RabbitMQ channel not initialized.');
        console.log('NACKKK');
        this.channel.nack(msg, false, false); // nack without requeueing immediately
        this.channel.publish(QueueConsumer.requeueExchange, this.routingKey, msg.content, { expiration: delay }); // requeue with delay
    }

    protected parseData<T>(msg: ConsumeMessage) {
        return JSON.parse(msg.content.toString()) as T;
    }

    public async close() {
        if (this.channel !== undefined) {
            return this.channel.close();
        }
    }
}
