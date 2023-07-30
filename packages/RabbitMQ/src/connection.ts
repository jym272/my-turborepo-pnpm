import * as amqp from 'amqplib';
import amqplib from 'amqplib';
import { QueueConsumerProps } from './@types/rabbit-mq';
import { createConsumers } from './Consumer';

let conn: amqp.Connection | null = null;
let consumeChannel: amqp.Channel | null = null;
let amqpURI: string | null = null;

const saveUri = (url: string) => {
    amqpURI = url;
};

export const getUri = () => {
    if (amqpURI === null) {
        throw new Error('RabbitMQ connection not initialized.');
    }
    return amqpURI;
};

export const getRabbitMQConn = () => {
    if (conn === null) {
        throw new Error('RabbitMQ connection not initialized.');
    }
    return conn;
};

export const getConsumeChannel = () => {
    if (consumeChannel === null) {
        throw new Error('RabbitMQ channel not initialized.');
    }
    return consumeChannel;
};

export const startRabbitMQ = async (url: string, consumers: QueueConsumerProps[]) => {
    conn = await amqplib.connect(url);
    consumeChannel = await conn.createChannel();
    await createConsumers(consumers);
    saveUri(url);
};

export const stopRabbitMQ = async () => {
    amqpURI = null;
    if (consumeChannel !== null) {
        await consumeChannel.close();
        consumeChannel = null;
    }
    if (conn !== null) {
        await conn.close();
        conn = null;
    }
};
