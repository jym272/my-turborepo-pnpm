import { nackWithDelay } from '../nack';
import ConsumeChannel from './Consume';
import { AvailableMicroservices } from '../../@types';

export class SagaConsumeChannel<T extends AvailableMicroservices> extends ConsumeChannel<T> {
    ackMessage(): void {
        this.channel.ack(this.msg, false);
    }
    nackMessage(): void {
        this.channel.nack(this.msg, false, false);
    }

    async nackWithDelayAndRetries(delay?: number, maxRetries?: number) {
        return await nackWithDelay(this.msg, this.queueName, delay, maxRetries);
    }
}
