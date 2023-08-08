import { QueueConsumerProps } from '../@types/rabbit-mq';
import { getConsumeChannel } from '../Connections';
import { Exchange } from '../@types';
/**
 * Create consumers for specified queues, bind them to exchanges, and set up requeue mechanism.
 *
 * @param {QueueConsumerProps[]} consumers - An array of queue consumer properties to set up consumers for.
 * @throws {Error} If there are issues with establishing the consume channel, creating queues, or binding exchanges.
 *
 * @example
 * const consumers = [
 *     {
 *         queueName: 'my_queue',
 *         exchange: Exchange.Commands
 *     },
 *     // Add more queue consumers here...
 * ];
 * await createConsumers(consumers);
 *
 * // Once consumers are set up, they will start processing messages.
 * @see startGlobalSagaListener
 * @see connectToSagaCommandEmitter
 */
export const createConsumers = async (consumers: QueueConsumerProps[]) => {
    const channel = await getConsumeChannel();

    // Iterate through the list of consumers and set up necessary configurations.
    for await (const consumer of consumers) {
        const { exchange, queueName } = consumer;
        const requeueQueue = `${queueName}_requeue`;
        const routingKey = `${queueName}_routing_key`;

        // Assert exchange and queue for the consumer.
        await channel.assertExchange(exchange, 'direct', { durable: true });
        await channel.assertQueue(queueName, { durable: true });
        await channel.bindQueue(queueName, exchange, routingKey);

        // Set up requeue mechanism by creating a requeue exchange and binding requeue queue to it.
        await channel.assertExchange(Exchange.Requeue, 'direct', { durable: true });
        await channel.assertQueue(requeueQueue, {
            durable: true,
            arguments: { 'x-dead-letter-exchange': exchange }
        });
        await channel.bindQueue(requeueQueue, Exchange.Requeue, routingKey);
        // Set the prefetch count to process only one message at a time to maintain order and control concurrency.
        await channel.prefetch(1); // process only one message at a time
    }
};
