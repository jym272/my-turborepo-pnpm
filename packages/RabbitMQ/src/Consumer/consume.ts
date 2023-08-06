import { Channel, ConsumeMessage } from 'amqplib';
import { AvailableMicroservices } from '../@types/saga/microservices';
import { Emitter } from 'mitt';
import { getConsumeChannel } from '../Connections';
import { ConsumerEvents } from '../@types';
import { createEmitter } from './create';

export const consume = async <T extends AvailableMicroservices>(
    queueName: string,
    cb: (msg: ConsumeMessage | null, channel: Channel, e: Emitter<ConsumerEvents<T>>, queueName: string) => void
) => {
    const channel = await getConsumeChannel();

    const e = createEmitter<T>();

    await channel.consume(
        queueName,
        msg => {
            cb(msg, channel, e, queueName);
        },
        {
            exclusive: false, // if true, only one consumer can consume from the queue
            noAck: false // we need to ack the messages, manually
        }
    );
    return e;
};
