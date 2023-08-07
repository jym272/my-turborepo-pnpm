import { AvailableMicroservices, ConsumerSagaEvents, SagaStep } from '../../@types';
import { Channel, ConsumeMessage } from 'amqplib';
import { Emitter } from 'mitt';
import { SagaConsumeChannel } from '../channels/Saga';

export const sagaConsumeCallback = <T extends AvailableMicroservices>(
    msg: ConsumeMessage | null,
    channel: Channel,
    e: Emitter<ConsumerSagaEvents<T>>,
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
    const responseChannel = new SagaConsumeChannel<T>(channel, msg, queueName, currentStep);

    e.emit(currentStep.command, { step: currentStep, channel: responseChannel });
};
