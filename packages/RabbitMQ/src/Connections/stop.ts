import { closeConsumeChannel } from './consumeChannel';
import { closeRabbitMQConn } from './rabbitConn';
import { closeSendChannel } from '../Broker';

export const stopRabbitMQ = async () => {
    await closeConsumeChannel();
    await closeSendChannel();
    await closeRabbitMQConn();
};
