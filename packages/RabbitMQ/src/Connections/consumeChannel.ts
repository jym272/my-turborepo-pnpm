import { getRabbitMQConn } from './rabbitConn';
import { Channel } from 'amqplib';

let consumeChannel: Channel | null = null;
/**
 * Get the consume channel for consuming messages from RabbitMQ.
 *
 * @returns {Promise<Channel>} A promise that resolves to the consume channel.
 * @throws {Error} If there is an issue with creating the consume channel or the RabbitMQ connection.
 */
export const getConsumeChannel = async (): Promise<Channel> => {
    if (consumeChannel === null) {
        consumeChannel = await (await getRabbitMQConn()).createChannel();
    }
    return consumeChannel;
};
/**
 * Close the consume channel used for consuming messages from RabbitMQ.
 *
 * @returns {Promise<void>} A promise that resolves when the consume channel is successfully closed.
 * @throws {Error} If there is an issue with closing the consume channel.
 */
export const closeConsumeChannel = async (): Promise<void> => {
    if (consumeChannel !== null) {
        await consumeChannel.close();
        consumeChannel = null;
    }
};
