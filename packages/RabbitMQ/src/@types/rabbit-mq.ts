export interface QueueConsumerProps {
    name: string;
    exchange: string;
}

export interface QueueProps extends QueueConsumerProps {
    routingKey: string;
}
