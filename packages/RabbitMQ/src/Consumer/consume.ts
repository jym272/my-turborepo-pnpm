import { Channel, ConsumeMessage } from 'amqplib';
import { getConsumeChannel } from '../connection';

export const consume = async (queueName: string, cb: (msg: ConsumeMessage | null, channel: Channel) => void) => {
    const channel = getConsumeChannel();
    await channel.consume(
        queueName,
        msg => {
            cb(msg, channel);
        },
        {
            exclusive: false, // if true, only one consumer can consume from the queue
            noAck: false // we need to ack the messages, manually
        }
    );
};
