import { Channel, ConsumeMessage } from 'amqplib';
import { CommandMap, SagaStep, Status } from '../@types/saga/response';
import { AvailableMicroservices } from '../@types/saga/microservices';
import mitt, { Emitter } from 'mitt';
import { nackWithDelay } from './nack';
import { sendToQueue } from '../Broker';
import { getConsumeChannel } from '../Connections';


// REPLY TO SAGA ESTA HARDOCEADO!!!, usar otra clases para el global saga listener
class ConsumeChannel<T extends AvailableMicroservices> {
    private readonly channel: Channel;
    private readonly msg: ConsumeMessage;
    private readonly queueName: string;
    private readonly step: SagaStep<T>;

    constructor(channel: Channel, msg: ConsumeMessage, queueName: string, step: SagaStep<T>) {
        this.channel = channel;
        this.msg = msg;
        this.queueName = queueName;
        this.step = step;
    }

    // It means success
    ackMessage(payloadForNextStep: Record<string, any>): void {
        this.step.status = Status.Success;
        this.step.payload = payloadForNextStep;
        //TODO: modificar y tipar esta funcion, crear una nueva exclusiva para enviar a QUEUE
        sendToQueue('reply_to_saga', this.step)
            .then(() => {
                this.channel.ack(this.msg, false);
            })
            .catch(err => {
                console.error(err);
            });
    }
    // It means fails
    nackMessage(): void {
        this.step.status = Status.Failure;
        //TODO: modificar y tipar esta funcion, crear una nueva exclusiva para enviar a QUEUE
        sendToQueue('reply_to_saga', this.step)
            .then(() => {
                this.channel.nack(this.msg, false, false);
            })
            .catch(err => {
                console.error(err);
            });
    }

    // TODO: describe delay and maxRetries when writting docs
    async nackWithDelayAndRetries(delay?: number, maxRetries?: number) {
        await nackWithDelay(this.msg, this.queueName, delay, maxRetries);
    }
    /* replyToSaga(payloadForNextStep: Record<string, any>, status: Status): void {

        // TODO: creo que necesita un nuevo channel!

        // TODO: testear con sendToQueue
        void sendToQueue('reply_to_saga', sagaNextStepResponse);
        // this.channel.sendToQueue('reply_to_saga', Buffer.from(JSON.stringify(sagaNextStepResponse)), {
        //     persistent: true
        // });
    }*/
}

export type ConsumerEvents<T extends AvailableMicroservices> = {
    [key in CommandMap[T]]: { sagaId: number; payload: Record<string, any>; channel: ConsumeChannel<T> };
};

const callback = <T extends AvailableMicroservices>(
    msg: ConsumeMessage | null,
    channel: Channel,
    e: Emitter<ConsumerEvents<T>>,
    queueName: string
) => {
    if (!msg) {
        console.error('NO MSG AVAILABLE');
        return;
    }
    let currentStep: SagaStep<T>;
    try {
        currentStep = JSON.parse(msg.content.toString()) as SagaStep<T>;
    } catch (error) {
        console.error('ERROR PARSING MSG', error);
        channel.nack(msg, false, false);
        return;
    }
    const { command, sagaId, payload } = currentStep;
    const responseChannel = new ConsumeChannel<T>(channel, msg, queueName, currentStep);

    e.emit(command, { sagaId, payload, channel: responseChannel });
};

// Create a function that returns the appropriate emitter type for a specific microservice
const createEmitter = <T extends AvailableMicroservices>(): Emitter<ConsumerEvents<T>> => {
    return mitt<ConsumerEvents<T>>();
};

export const consumeWithParsing = async <T extends AvailableMicroservices>(queueName: string) => {
    // TODO: un solo canal para este consumer!!
    const channel = await getConsumeChannel();

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
