import { Channel, ConsumeMessage } from 'amqplib';
import mitt, { Emitter, EventType } from 'mitt';
import { getConsumeChannel } from '../Connections';

export const consume = async <E extends Record<EventType, unknown>>(
    queueName: string,
    cb: (msg: ConsumeMessage | null, channel: Channel, e: Emitter<E>, queueName: string) => void
) => {
    const channel = await getConsumeChannel();
    const e = mitt<E>();

    await channel.consume(
        queueName,
        msg => {
            cb(msg, channel, e, queueName);
        },
        {
            exclusive: false,
            noAck: false
        }
    );
    return e;
};
