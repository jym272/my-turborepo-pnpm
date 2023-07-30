export interface QueueConsumerProps {
    queueName: string;
    exchange: string;
}

export interface QueueProps extends QueueConsumerProps {
    routingKey: string;
}
