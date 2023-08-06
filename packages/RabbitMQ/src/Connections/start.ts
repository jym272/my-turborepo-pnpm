import { AvailableMicroservices } from '../@types';
import { getRabbitMQConn, saveUri } from './rabbitConn';
import { getConsumeChannel } from './consumeChannel';
import { consumeWithParsing, createConsumers } from '../Consumer';

const prepare = async (url: string) => {
    saveUri(url);
    await getRabbitMQConn();
    await getConsumeChannel();
};

export const startGlobalSagaListener = async (url: string) => {
    await prepare(url);
    const queue = {
        queueName: 'reply_to_saga',
        exchange: 'reply_exchange'
    };
    await createConsumers([queue]);
    return await consumeWithParsing(queue.queueName);
};

export const connectToSagaCommandEmitter = async <T extends AvailableMicroservices>(url: string, micro: T) => {
    await prepare(url);
    const queue = {
        queueName: `${micro}_saga_commands`,
        exchange: 'commands_exchange'
    };
    await createConsumers([queue]);
    return await consumeWithParsing<T>(queue.queueName);
};
