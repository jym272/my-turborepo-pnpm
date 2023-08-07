export enum Queue {
    ReplyToSaga = 'reply_to_saga'
}
export enum Exchange {
    Requeue = 'requeue_exchange',
    Commands = 'commands_exchange',
    ReplyToSaga = 'reply_exchange'
}
export interface QueueConsumerProps {
    queueName: string;
    exchange: Exchange;
}
