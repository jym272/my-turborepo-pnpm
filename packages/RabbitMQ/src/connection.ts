import * as amqp from 'amqplib';
import amqplib from 'amqplib';
import { QueueConsumerProps } from './@types/rabbit-mq';
import { createConsumers } from './Consumer';

let conn: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;
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

export const getChannel = () => {
    if (channel === null) {
        throw new Error('RabbitMQ channel not initialized.');
    }
    return channel;
};

export const startRabbitMQ = async (url: string, consumers: QueueConsumerProps[]) => {
    conn = await amqplib.connect(url);
    channel = await conn.createChannel();
    await createConsumers(consumers);
    saveUri(url);
};

export const stopRabbitMQ = async () => {
    if (conn !== null) {
        await conn.close();
        conn = null;
    }
};
