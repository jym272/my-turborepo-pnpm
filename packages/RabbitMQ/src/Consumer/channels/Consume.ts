import { AvailableMicroservices, SagaStep } from '../../@types';
import { Channel, ConsumeMessage } from 'amqplib';

abstract class ConsumeChannel<T extends AvailableMicroservices> {
    protected readonly channel: Channel;
    protected readonly msg: ConsumeMessage;
    protected readonly queueName: string;
    protected readonly step: SagaStep<T>;

    public constructor(channel: Channel, msg: ConsumeMessage, queueName: string, step: SagaStep<T>) {
        this.channel = channel;
        this.msg = msg;
        this.queueName = queueName;
        this.step = step;
    }

    public abstract ackMessage(payloadForNextStep?: Record<string, any>): void;

    public abstract nackMessage(): void;

    public abstract nackWithDelayAndRetries(delay?: number, maxRetries?: number): Promise<void>;
}

export default ConsumeChannel;
