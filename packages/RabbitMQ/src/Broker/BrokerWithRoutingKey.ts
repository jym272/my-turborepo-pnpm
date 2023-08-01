import * as amqp from 'amqplib';
import { getRabbitMQConn } from '../connection';

let sendChannel: amqp.Channel | null = null;

const getSendChannel = async () => {
    if (sendChannel === null) {
        sendChannel = await getRabbitMQConn().createChannel();
    }
    return sendChannel;
};

const EXCHANGE_NAME = 'DIRECT_EXCHANGE';

export const sendToQueueWithRoutingKey = async <T extends Record<string, any>>(
    queueName: string,
    routingKey: string,
    payload: T
) => {
    // let connection;
    try {
        const channel = await getSendChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
        await channel.assertQueue(queueName, { durable: true });
        await channel.bindQueue(queueName, EXCHANGE_NAME, routingKey);
        // NB: `sentToQueue` and `publish` both return a boolean
        // indicating whether it's OK to send again straight away, or
        // (when `false`) that you should wait for the event `'drain'`
        // to fire before writing again. We're just doing the one write,
        // so we'll ignore it.
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), {
            persistent: true
        });
        // await channel.close();
    } catch (err) {
        console.warn(err);
    }
    /*finally {
        if (connection) await connection.close();
    }*/
};
