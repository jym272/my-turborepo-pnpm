import * as amqp from 'amqplib';
import { QueueProps } from '../@types/rabbit-mq';

/**
 * This is a test of comment in a class definition
 */
abstract class ConsumerWithRequeue {
    protected static requeueExchange = 'requeue_exchange';
    protected channel: amqp.Channel | undefined;
    protected queueName: string;
    protected routingKey: string;
    protected exchange: string;

    protected constructor(props: QueueProps) {
        this.queueName = props.name;
        this.routingKey = props.routingKey;
        this.exchange = props.exchange;
    }

    abstract consume(): void;
    abstract connect(): void;
    abstract close(): void;
}
export default ConsumerWithRequeue;
