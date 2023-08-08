/**
 * Represents the names of specific message queues in the RabbitMQ context.
 */
export enum Queue {
    /**
     * Queue used for sending replies in response to saga events.
     */
    ReplyToSaga = 'reply_to_saga'
}
/**
 * Represents the names of exchanges, which act as message routing hubs in the RabbitMQ context.
 */
export enum Exchange {
    /**
     * Exchange dedicated to requeueing messages that require further processing.
     */
    Requeue = 'requeue_exchange',
    /**
     * Exchange for sending command messages to various consumers.
     */
    Commands = 'commands_exchange',
    /**
     * Exchange used for replying to saga events from consumers.
     */
    ReplyToSaga = 'reply_exchange'
}
/**
 * Properties defining a queue consumer within the RabbitMQ context.
 */
export interface QueueConsumerProps {
    /**
     * The name of the queue that messages will be consumed from.
     */
    queueName: string;
    /**
     * The associated exchange for the queue, used for routing messages.
     */
    exchange: Exchange;
}
