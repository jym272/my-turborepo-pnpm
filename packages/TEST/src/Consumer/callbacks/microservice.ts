import { AvailableMicroservices, ConsumerEvents, SagaStep } from '../../@types';
import { Channel, ConsumeMessage } from 'amqplib';
import { Emitter } from 'mitt';
import { MicroserviceConsumeChannel } from '../channels';
/**
 * Callback function for consuming microservice events/commands.
 *
 * @typeparam T - The type of available microservices.
 *
 * @param {ConsumeMessage | null} msg - The consumed message.
 * @param {Channel} channel - The channel used for consuming messages.
 * @param {Emitter<ConsumerEvents<T>>} e - The emitter to emit events.
 * @param {string} queueName - The name of the queue from which the message was consumed.
 */
export const microserviceConsumeCallback = <T extends AvailableMicroservices>(
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
    const responseChannel = new MicroserviceConsumeChannel<T>(channel, msg, queueName, currentStep);

    e.emit(command, { sagaId, payload, channel: responseChannel });
};
