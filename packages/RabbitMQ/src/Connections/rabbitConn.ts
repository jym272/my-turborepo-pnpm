import * as amqp from 'amqplib';
import amqplib, { Connection } from 'amqplib';

let conn: amqp.Connection | null = null;
let url: string | null = null;
/**
 * Save the RabbitMQ URI for establishing a connection.
 *
 * @param {string} uri - The RabbitMQ URI to save.
 */
export const saveUri = (uri: string) => {
    url = uri;
};
/**
 * Get the saved RabbitMQ URI.
 *
 * @returns {string} The saved RabbitMQ URI.
 * @throws {Error} If the RabbitMQ URI is not initialized.
 */
const getUri = (): string => {
    if (url === null) {
        throw new Error('RabbitMQ URI not initialized.');
    }
    return url;
};
/**
 * Get the RabbitMQ connection or establish a new connection if not already connected.
 *
 * @returns {Promise<Connection>} A promise that resolves to the RabbitMQ connection.
 */
export const getRabbitMQConn = async (): Promise<Connection> => {
    if (conn === null) {
        conn = await amqplib.connect(getUri());
    }
    return conn;
};
/**
 * Close the RabbitMQ connection if it is open.
 *
 * @returns {Promise<void>} A promise that resolves when the connection is successfully closed.
 */
export const closeRabbitMQConn = async (): Promise<void> => {
    if (conn !== null) {
        await conn.close();
        conn = null;
    }
};
