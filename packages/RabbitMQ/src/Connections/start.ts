import { AvailableMicroservices, ConsumerEvents, ConsumerSagaEvents, Exchange, Queue } from '../@types';
import { getRabbitMQConn, saveUri } from './rabbitConn';
import { getConsumeChannel } from './consumeChannel';
import { consume, createConsumers, microserviceConsumeCallback, sagaConsumeCallback } from '../Consumer';
import { getQueueConsumer } from '../utils';
import { Emitter } from 'mitt';
/**
 * Prepare the library for consuming messages by saving the RabbitMQ URI, establishing a connection,
 * and getting the consume channel.
 *
 * @param {string} url - The RabbitMQ URL to establish a connection.
 * @throws {Error} If there is an issue with saving the URI, establishing a connection, or getting the consume channel.
 * @see saveUri
 * @see getRabbitMQConn
 * @see getConsumeChannel
 */
const prepare = async (url: string) => {
    saveUri(url);
    await getRabbitMQConn();
    await getConsumeChannel();
};
/**
 * Start a global saga listener to handle incoming saga events/commands from all microservices.
 *
 * @param {string} url - The URL of the RabbitMQ server to establish a connection.
 * @returns {Promise<Emitter>} Emitter<ConsumerSagaEvents<T>> - A promise that resolves to an emitter
 * for handling the saga events emitted by the specified microservice.
 * @throws {Error} If the RabbitMQ URI is not initialized or there is an issue with the connection.
 *
 * @template T
 * @example
 * const url = 'amqp://localhost';
 * const sagaEmitter = await startGlobalSagaListener<AvailableMicroservices>(url);
 * // Also valid and equivalent to the above
 * const sagaEmitter = await startGlobalSagaListener(url);
 *
 * // Listen to a single microservice saga event
 * sagaEmitter.on(MintCommands.MintImage, async ({ channel, step }) => {
 *      // ... do something, ack or nack the message
 * });
 *
 * // Listen to all microservice saga events, take notice that the event already listen above it needs to be ignored here.
 * sagaEmitter.on('*', async (command, { step, channel }) => {
 *     if (command === MintCommands.MintImage) {
 *         // Ignore the event already listened above
 *         return;
 *     }
 *     // ... do something ack or nack if there are commands that are not handled
 * });
 *
 * // When not needed anymore, you can close the RabbitMQ connection
 * await stopRabbitMQ();
 * @see stopRabbitMQ
 * @see connectToSagaCommandEmitter
 */
export const startGlobalSagaListener = async <T extends AvailableMicroservices>(
    url: string
): Promise<Emitter<ConsumerSagaEvents<T>>> => {
    await prepare(url);
    const queue = {
        queueName: Queue.ReplyToSaga,
        exchange: Exchange.ReplyToSaga
    };
    await createConsumers([queue]);
    return await consume<ConsumerSagaEvents<T>>(queue.queueName, sagaConsumeCallback);
};
/**
 * Connects to a specific microservice's saga command emitter to handle incoming saga events/commands.
 *
 * @param {string} url - The URL of the RabbitMQ server to establish a connection.
 * @param {T} microservice - The microservice for which to connect to the saga command emitter.
 * @returns {Promise<Emitter>} Emitter<ConsumerEvents<T>> - A promise that resolves to an emitter for handling the saga events/commands
 * emitted by the specified microservice.
 * @throws {Error} If the RabbitMQ URI is not initialized or there is an issue with the connection.
 *
 * @template T
 *
 * @example
 * // Establish a connection and connect to the 'image' microservice's saga command emitter
 * const url = 'amqp://localhost';
 * const e = await connectToSagaCommandEmitter(url, AvailableMicroservices.Image);
 *
 * // Listen for 'image' microservice saga events/commands
 * e.on(ImageCommands.CreateImage, async ({ channel, sagaId, payload }) => {
 *   // Handle the 'create_image' saga event/command for the 'image' microservice, ack or nack the message
 * });
 *
 * // Listen to all commands/events emitted by the 'image' microservice or use a global pattern, take notice that the events already listen above it needs to be ignored here.
 * e.on('*', async (command, { channel, sagaId, payload }) => {
 *    if (command === ImageCommands.CreateImage) {
 *    // Ignore the event already listened above
 *    return;
 *    }
 *    // ... do something ack or nack if there are commands that are not handled
 * });
 *
 * // When not needed anymore, you can close the RabbitMQ connection
 * await stopRabbitMQ();
 * @see stopRabbitMQ
 * @see startGlobalSagaListener
 */
export const connectToSagaCommandEmitter = async <T extends AvailableMicroservices>(
    url: string,
    microservice: T
): Promise<Emitter<ConsumerEvents<T>>> => {
    await prepare(url);
    const q = getQueueConsumer(microservice);
    await createConsumers([q]);
    return await consume<ConsumerEvents<T>>(q.queueName, microserviceConsumeCallback);
};
