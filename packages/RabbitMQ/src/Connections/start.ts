import { AvailableMicroservices, ConsumerEvents, ConsumerSagaEvents, Exchange, Queue } from '../@types';
import { getRabbitMQConn, saveUri } from './rabbitConn';
import { getConsumeChannel } from './consumeChannel';
import { consume, createConsumers, microserviceConsumeCallback, sagaConsumeCallback } from '../Consumer';
import { getQueueConsumer } from '../utils';

const prepare = async (url: string) => {
    saveUri(url);
    await getRabbitMQConn();
    await getConsumeChannel();
};
/**
 * Starts the global saga listener to handle incoming saga events from all microservices.
 *
 * @param {string} url - The URL of the RabbitMQ server to establish a connection.
 * @returns {Promise<Emitter<ConsumerSagaEvents<AvailableMicroservices>>>} A promise that resolves to an emitter
 * for handling the saga events emitted by the microservices.
 * @throws {Error} If the RabbitMQ URI is not initialized or there is an issue with the connection.
 *
 * @example
 * // Establish a connection and start the global saga listener
 * const url = 'amqp://localhost';
 * const sagaEmitter = await startGlobalSagaListener(url);
 *
 * // Listen for saga events from all microservices
 *
 * sagaEmitter.on(MintCommands.MintImage, ({ channel, step }) => {
 *   // Handle the 'MintImage' saga event / command
 * });
 * // All commands av
 * sagaEmitter.on('mint_image', (event) => {
 *   // Handle the 'mint_image' saga event
 * });
 *
 * // When not needed anymore, you can close the RabbitMQ connection
 * // await stopRabbitMQ();
 */
export const startGlobalSagaListener = async (url: string) => {
    await prepare(url);
    const queue = {
        queueName: Queue.ReplyToSaga,
        exchange: Exchange.ReplyToSaga
    };
    await createConsumers([queue]);
    return await consume<ConsumerSagaEvents<AvailableMicroservices>>(queue.queueName, sagaConsumeCallback);
};

export const connectToSagaCommandEmitter = async <T extends AvailableMicroservices>(url: string, microservice: T) => {
    await prepare(url);
    const q = getQueueConsumer(microservice);
    await createConsumers([q]);
    return await consume<ConsumerEvents<T>>(q.queueName, microserviceConsumeCallback);
};
