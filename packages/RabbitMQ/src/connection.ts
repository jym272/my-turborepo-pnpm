import * as amqp from 'amqplib';
import amqplib from 'amqplib';

let conn: amqp.Connection | null = null;
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

export const startRabbitMQ = async (url: string) => {
    conn = await amqplib.connect(url);
    saveUri(url);
};

export const stopRabbitMQ = async () => {
    if (conn !== null) {
        await conn.close();
        conn = null;
    }
};

export const getRabbitMQConn = () => {
    if (conn === null) {
        throw new Error('RabbitMQ connection not initialized.');
    }
    return conn;
};
