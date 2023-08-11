import { AvailableMicroservices, Queue, Status } from '../../@types';
import { sendToQueue } from '../../Broker';
import { nackWithDelay } from '../nack';
import ConsumeChannel from './Consume';
/**
 * Represents a consume channel for a specific microservice.
 * Extends the abstract ConsumeChannel class.
 *
 * @typeparam T - The type of available microservices.
 */
export class MicroserviceConsumeChannel<T extends AvailableMicroservices> extends ConsumeChannel<T> {
    ackMessage(payloadForNextStep: Record<string, any>): void {
        this.step.status = Status.Success;
        this.step.payload = payloadForNextStep;

        sendToQueue(Queue.ReplyToSaga, this.step)
            .then(() => {
                this.channel.ack(this.msg, false);
            })
            .catch(err => {
                console.error(err);
            });
    }
    nackMessage(): void {
        this.step.status = Status.Failure;

        sendToQueue(Queue.ReplyToSaga, this.step)
            .then(() => {
                this.channel.nack(this.msg, false, false);
            })
            .catch(err => {
                console.error(err);
            });
    }

    async nackWithDelayAndRetries(delay?: number, maxRetries?: number) {
        console.log('MicroserviceConsumeChannel nackWithDelayAndRetries');
        return await nackWithDelay(this.msg, this.queueName, delay, maxRetries);
    }
}
