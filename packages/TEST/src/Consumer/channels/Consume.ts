import { AvailableMicroservices, SagaStep } from '../../@types';
import { Channel, ConsumeMessage } from 'amqplib';

/**
 * Abstract class representing a consumer channel for processing messages in a microservices environment.
 *
 * @typeparam T - The type of available microservices.
 */
abstract class ConsumeChannel<T extends AvailableMicroservices> {
    /**
     * The channel to interact with the message broker.
     */
    protected readonly channel: Channel;
    /**
     * The consumed message to be processed.
     */
    protected readonly msg: ConsumeMessage;
    /**
     * The name of the queue from which the message was consumed.
     */
    protected readonly queueName: string;
    /**
     * The saga step associated with the consumed message.
     */
    protected readonly step: SagaStep<T>;

    /**
     * Constructs a new instance of the ConsumeChannel class.
     *
     * @param {Channel} channel - The channel to interact with the message broker.
     * @param {ConsumeMessage} msg - The consumed message to be processed.
     * @param {string} queueName - The name of the queue from which the message was consumed.
     * @param {SagaStep} step - The saga step associated with the consumed message.
     */
    public constructor(channel: Channel, msg: ConsumeMessage, queueName: string, step: SagaStep<T>) {
        this.channel = channel;
        this.msg = msg;
        this.queueName = queueName;
        this.step = step;
    }

    /**
     * Method to acknowledge the message, optionally providing payload for the next step.
     *
     * @param {Record<string, any>} [payloadForNextStep] - Payload for the next step.
     */
    public abstract ackMessage(payloadForNextStep?: Record<string, any>): void;

    /**
     * Method to negatively acknowledge the message.
     * @deprecated Use {@link nackWithDelayAndRetries} instead.
     */
    protected abstract nackMessage(): void;

    /**
     * Method to negatively acknowledge the message with a delay and retries.
     *
     * @param {number} [delay] - The delay before requeueing the message.
     * @param {number} [maxRetries] - The maximum number of nack retries.
     * @returns {Promise<number>} A promise resolving to the count of retries.
     * @see nackWithDelay
     * @see NACKING_DELAY_MS
     * @see MAX_NACK_RETRIES
     */
    public abstract nackWithDelayAndRetries(delay?: number, maxRetries?: number): Promise<number>;
}

export default ConsumeChannel;
