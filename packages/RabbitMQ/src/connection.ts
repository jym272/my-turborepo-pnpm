import * as amqp from 'amqplib';
import amqplib from 'amqplib';
import { QueueConsumerProps } from './@types/rabbit-mq';
import { consumeWithParsing, createConsumers } from './Consumer';
import { AvailableMicroservices } from './@types';

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

// TODO: no exportarlo asi, lo puednen romper al rpoigema !"
export const getConsumeChannel = () => {
    if (consumeChannel === null) {
        throw new Error('RabbitMQ channel not initialized.');
    }
    return consumeChannel;
};
// const mintQueue = {
//     queueName: 'mint_saga_commands',
//     exchange: 'commands_exchange'
// };
export const startRabbitMQ = async (url: string, consumers: QueueConsumerProps[]) => {
    conn = await amqplib.connect(url);
    consumeChannel = await conn.createChannel();
    await createConsumers(consumers);
    saveUri(url);
};

export const startRabbitMQ2 = async <T extends AvailableMicroservices>(url: string, micro: T) => {
    conn = await amqplib.connect(url);
    consumeChannel = await conn.createChannel();
    const queue = {
        queueName: `${micro}_saga_commands`,
        exchange: 'commands_exchange'
    };
    await createConsumers([queue]);
    saveUri(url);
    return await consumeWithParsing<T>(queue.queueName);
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
