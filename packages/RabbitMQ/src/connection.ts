import * as amqp from 'amqplib';
import amqplib from 'amqplib';

let conn: amqp.Connection | null = null;
export const startRabbitMQ = async (uri: string) => {
    conn = await amqplib.connect(uri);
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
