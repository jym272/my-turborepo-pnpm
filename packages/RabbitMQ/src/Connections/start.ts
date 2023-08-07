import { AvailableMicroservices, ConsumerEvents, ConsumerSagaEvents, Exchange, Queue } from '../@types';
import { getRabbitMQConn, saveUri } from './rabbitConn';
import { getConsumeChannel } from './consumeChannel';
import { consume, createConsumers, microserviceConsumeCallback, sagaConsumeCallback } from '../Consumer';
import { getQueueConsumer } from '../utils';

const prepare = async (url: string) => {
    saveUri(url);
    await getRabbitMQConn();
    await getConsumeChannel();
};

export const startGlobalSagaListener = async (url: string) => {
    await prepare(url);
    const queue = {
        queueName: Queue.ReplyToSaga,
        exchange: Exchange.ReplyToSaga
    };
    await createConsumers([queue]);
    return await consume<ConsumerSagaEvents<AvailableMicroservices>>(queue.queueName, sagaConsumeCallback);
};

export const connectToSagaCommandEmitter = async <T extends AvailableMicroservices>(url: string, microservice: T) => {
    await prepare(url);
    const q = getQueueConsumer(microservice);
    await createConsumers([q]);
    return await consume<ConsumerEvents<T>>(q.queueName, microserviceConsumeCallback);
};
