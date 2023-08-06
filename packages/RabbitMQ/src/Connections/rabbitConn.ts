import * as amqp from 'amqplib';
import amqplib from 'amqplib';

let conn: amqp.Connection | null = null;
let url: string | null = null;

export const saveUri = (uri: string) => {
    url = uri;
};

const getUri = () => {
    if (url === null) {
        throw new Error('RabbitMQ URI not initialized.');
    }
    return url;
};

export const getRabbitMQConn = async () => {
    if (conn === null) {
        conn = await amqplib.connect(getUri());
    }
    return conn;
};

export const closeRabbitMQConn = async () => {
    if (conn !== null) {
        await conn.close();
        conn = null;
    }
};
