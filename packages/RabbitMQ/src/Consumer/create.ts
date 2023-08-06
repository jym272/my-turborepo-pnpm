import { QueueConsumerProps } from '../@types/rabbit-mq';
import { REQUEUE_EXCHANGE } from '../constants';
import { getConsumeChannel } from '../Connections';
import { AvailableMicroservices, ConsumerEvents } from '../@types';
import mitt, { Emitter } from 'mitt';

export const createConsumers = async (consumers: QueueConsumerProps[]) => {
    const channel = await getConsumeChannel();
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

export const createEmitter = <T extends AvailableMicroservices>(): Emitter<ConsumerEvents<T>> => {
    return mitt<ConsumerEvents<T>>();
};
