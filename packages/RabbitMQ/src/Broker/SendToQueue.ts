import * as amqp from 'amqplib';
import { getRabbitMQConn } from '../Connections';

let sendChannel: amqp.Channel | null = null;

const getSendChannel = async () => {
    if (sendChannel === null) {
        sendChannel = await (await getRabbitMQConn()).createChannel();
    }
    return sendChannel;
};

export const sendToQueue = async <T extends Record<string, any>>(queueName: string, payload: T) => {
    const channel = await getSendChannel();
    await channel.assertQueue(queueName, { durable: true });

    // NB: `sentToQueue` and `publish` both return a boolean
    // indicating whether it's OK to send again straight away, or
    // (when `false`) that you should wait for the event `'drain'`
    // to fire before writing again. We're just doing the one write,
    // so we'll ignore it.
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), {
        persistent: true
    });
};

export const closeSendChannel = async () => {
    if (sendChannel !== null) {
        await sendChannel.close();
        sendChannel = null;
    }
};
