import { Channel, ConsumeMessage } from 'amqplib';
import { getConsumeChannel } from '../connection';
import { CommandMap, SagaStepResponse } from '../@types/saga/response';
import { AvailableMicroservices } from '../@types/saga/microservices';
import mitt, { Emitter } from 'mitt';
import { nackWithDelay } from './nack';

const parseStepResponse = <U>(msg: ConsumeMessage) => {
    return JSON.parse(msg.content.toString()) as U;
};
class ConsumeChannel {
    private readonly channel: Channel;
    private readonly msg: ConsumeMessage;
    private readonly queueName: string;

    constructor(channel: Channel, msg: ConsumeMessage, queueName: string) {
        this.channel = channel;
        this.msg = msg;
        this.queueName = queueName;
    }

    ackMessage(allUpTo?: boolean): void {
        this.channel.ack(this.msg, allUpTo);
    }
    nackMessage(allUpTo?: boolean, requeue?: boolean): void {
        this.channel.nack(this.msg, allUpTo, requeue);
    }

    nackWithDelayAndRetries(delay?: number, maxRetries?: number): void {
        nackWithDelay(this.msg, this.queueName, delay, maxRetries);
    }
}

// Define a type for the events emitted by the consumer
export type ConsumerEvents<T extends AvailableMicroservices> = {
    [key in CommandMap[T]]: { sagaId: number; payload: Record<string, any>; channel: ConsumeChannel };
};

export const callback = <T extends AvailableMicroservices>(
    msg: ConsumeMessage | null,
    channel: Channel,
    e: Emitter<ConsumerEvents<T>>,
    queueName: string
) => {
    if (!msg) {
        console.error('NO MSG AVAILABLE');
        return;
    }
    let stepResponse: SagaStepResponse<T>;
    try {
        stepResponse = parseStepResponse(msg);
        console.log('PARSED MSG', stepResponse);
    } catch (error) {
        console.error('ERROR PARSING MSG', error);
        channel.nack(msg, false, false);
        return;
    }
    const responseChannel = new ConsumeChannel(channel, msg, queueName);
    const { command, sagaId, payload } = stepResponse;
    e.emit(command, { sagaId, payload, channel: responseChannel });
};

// Create a function that returns the appropriate emitter type for a specific microservice
const createEmitter = <T extends AvailableMicroservices>(): Emitter<ConsumerEvents<T>> => {
    return mitt<ConsumerEvents<T>>();
};

// TODO: queename also typed!, creo que el nombr de la queue lo tengo que guardar en al ugno alo
export const consumeWithParsing = async <T extends AvailableMicroservices>(queueName: string) => {
    // TODO: un solo canal para este consumer!!
    const channel = getConsumeChannel();

    const e = createEmitter<T>(); // Retrieve the emitter instance

    await channel.consume(
        queueName,
        msg => {
            callback<T>(msg, channel, e, queueName);
        },
        {
            exclusive: false, // if true, only one consumer can consume from the queue
            noAck: false // we need to ack the messages, manually
        }
    );
    return e;
};

// Usage:
// const emitter = mitt<ConsumerEvents<AvailableMicroservices.Mint>>();
//
// emitter.on(MintCommands.MintImage, data => {
//     // Handle the 'mintImage' event
//     console.log('Received mintImage command:', data);
//     // Perform actions based on the data (sagaId and payload) received in the event
// });
