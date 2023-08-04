import { Channel, ConsumeMessage } from 'amqplib';
import { getConsumeChannel } from '../connection';
import { CommandMap, SagaStepResponse } from '../@types/saga/response';
import { AvailableMicroservices } from '../@types/saga/microservices';
import mitt, { Emitter } from 'mitt';

const parseStepResponse = <U>(msg: ConsumeMessage) => {
    return JSON.parse(msg.content.toString()) as U;
};

// Define a type for the events emitted by the consumer
export type ConsumerEvents<T extends AvailableMicroservices> = {
    [key in CommandMap[T]]: { sagaId: number; payload: Record<string, any> } | undefined;
};
export const callback = <T extends AvailableMicroservices>(
    msg: ConsumeMessage | null,
    channel: Channel,
    e: Emitter<ConsumerEvents<T>>
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
    const { command, sagaId, payload } = stepResponse;
    e.emit(command, { sagaId, payload });
};

// Create a function that returns the appropriate emitter type for a specific microservice
const createEmitter = <T extends AvailableMicroservices>(): Emitter<ConsumerEvents<T>> => {
    return mitt<ConsumerEvents<T>>();
};
// // Define a global variable to store the emitter instance
// let e: Emitter<ConsumerEvents<AvailableMicroservices>> | null = null;
//
// // Export a getter function to retrieve the emitter instance
// export const getEmitter = <T extends AvailableMicroservices>(): Emitter<ConsumerEvents<T>> => {
//     if (!e) {
//         e = createEmitter<AvailableMicroservices>(); // Create an emitter specific to the microservice
//     }
//     return e as unknown as Emitter<ConsumerEvents<T>>;
// };

// TODO: queename also typed!
export const consumeWithParsing = async <T extends AvailableMicroservices>(queueName: string) => {
    const channel = getConsumeChannel();

    const e = createEmitter<T>(); // Retrieve the emitter instance

    await channel.consume(
        queueName,
        msg => {
            callback<T>(msg, channel, e);
        },
        {
            exclusive: false, // if true, only one consumer can consume from the queue
            noAck: false // we need to ack the messages, manually
        }
    );
};

// Usage:
// const emitter = mitt<ConsumerEvents<AvailableMicroservices.Mint>>();
//
// emitter.on(MintCommands.MintImage, data => {
//     // Handle the 'mintImage' event
//     console.log('Received mintImage command:', data);
//     // Perform actions based on the data (sagaId and payload) received in the event
// });
