import { Channel, ConsumeMessage } from 'amqplib';
import { getChannel } from '../connection';
import { REQUEUE_EXCHANGE, NACKING_DELAY_MS } from '../constants';


export const nackWithDelay = (msg: ConsumeMessage, queueName: string, delay = NACKING_DELAY_MS) => {
    const channel = getChannel();
    channel.nack(msg, false, false); // nack without requeueing immediately
    channel.publish(REQUEUE_EXCHANGE, `${queueName}_routing_key`, msg.content, { expiration: delay }); // requeue with delay
};

export const consume = async (queueName: string, cb: (msg: ConsumeMessage | null, channel: Channel) => void) => {
    const channel = getChannel();
    await channel.consume(
        queueName,
        msg => {
            cb(msg, channel);
        },
        {
            exclusive: true, // only one consumer per queue
            noAck: false // we need to ack the messages, manually
        }
    );
};
