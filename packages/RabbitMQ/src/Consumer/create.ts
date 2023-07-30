import { QueueConsumerProps } from '../@types/rabbit-mq';
import { getConsumeChannel } from '../connection';
import { REQUEUE_EXCHANGE } from '../constants';

export const createConsumers = async (consumers: QueueConsumerProps[]) => {
    const channel = getConsumeChannel();
    for await (const consumer of consumers) {
        const { exchange, queueName } = consumer;
        const requeueQueue = `${queueName}_requeue`;
        const routingKey = `${queueName}_routing_key`;

        await channel.assertExchange(exchange, 'direct', { durable: true });
        await channel.assertQueue(queueName, { durable: true });
        await channel.bindQueue(queueName, exchange, routingKey);

        await channel.assertExchange(REQUEUE_EXCHANGE, 'direct', { durable: true });
        await channel.assertQueue(requeueQueue, {
            durable: true,
            arguments: { 'x-dead-letter-exchange': exchange }
        });
        await channel.bindQueue(requeueQueue, REQUEUE_EXCHANGE, routingKey);
        await channel.prefetch(1); // process only one message at a time
    }
};
