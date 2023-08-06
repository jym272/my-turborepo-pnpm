import { AvailableMicroservices, Status } from '../../@types';
import { sendToQueue } from '../../Broker';
import { nackWithDelay } from '../nack';
import ConsumeChannel from './Consume';
import { REPLY_TO_SAGA_QUEUE } from '../../constants';

export class MicroserviceConsumeChannel<T extends AvailableMicroservices> extends ConsumeChannel<T> {
    ackMessage(payloadForNextStep: Record<string, any>): void {
        this.step.status = Status.Success;
        this.step.payload = payloadForNextStep;

        sendToQueue(REPLY_TO_SAGA_QUEUE, this.step)
            .then(() => {
                this.channel.ack(this.msg, false);
            })
            .catch(err => {
                console.error(err);
            });
    }
    nackMessage(): void {
        this.step.status = Status.Failure;

        sendToQueue(REPLY_TO_SAGA_QUEUE, this.step)
            .then(() => {
                this.channel.nack(this.msg, false, false);
            })
            .catch(err => {
                console.error(err);
            });
    }

    async nackWithDelayAndRetries(delay?: number, maxRetries?: number) {
        await nackWithDelay(this.msg, this.queueName, delay, maxRetries);
    }
}
