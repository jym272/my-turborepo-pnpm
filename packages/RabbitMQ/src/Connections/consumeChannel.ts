import * as amqp from 'amqplib';
import { getRabbitMQConn } from './rabbitConn';

let consumeChannel: amqp.Channel | null = null;

export const getConsumeChannel = async () => {
    if (consumeChannel === null) {
        consumeChannel = await (await getRabbitMQConn()).createChannel();
    }
    return consumeChannel;
};

export const closeConsumeChannel = async () => {
    if (consumeChannel !== null) {
        await consumeChannel.close();
        consumeChannel = null;
    }
};
