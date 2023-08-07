import { QueueConsumerProps } from '../@types/rabbit-mq';
import { getConsumeChannel } from '../Connections';
import { Exchange } from '../@types';

export const createConsumers = async (consumers: QueueConsumerProps[]) => {
    const channel = await getConsumeChannel();
    for await (const consumer of consumers) {
        const { exchange, queueName } = consumer;
        const requeueQueue = `${queueName}_requeue`;
        const routingKey = `${queueName}_routing_key`;

        await channel.assertExchange(exchange, 'direct', { durable: true });
        await channel.assertQueue(queueName, { durable: true });
        await channel.bindQueue(queueName, exchange, routingKey);

        await channel.assertExchange(Exchange.Requeue, 'direct', { durable: true });
        await channel.assertQueue(requeueQueue, {
            durable: true,
            arguments: { 'x-dead-letter-exchange': exchange }
        });
        await channel.bindQueue(requeueQueue, Exchange.Requeue, routingKey);
        await channel.prefetch(1); // process only one message at a time
    }
};
