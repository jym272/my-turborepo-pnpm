import * as amqp from 'amqplib';

abstract class DirectMessageDelivery {
    protected channel: amqp.Channel | undefined;
    protected connection: amqp.Connection | undefined;
    protected queueName: string;

    protected constructor(queueName: string) {
        this.queueName = queueName;
    }
    abstract sendToQueue<T extends Record<string, any>>(payload: T): Promise<boolean>;
    abstract cleanUp(): void;
}

export default DirectMessageDelivery;
