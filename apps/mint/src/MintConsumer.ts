import { SagaStepResponse } from './types';
import { mintImage } from './actions';
import { Channel, ConsumeMessage } from 'amqplib';
import { nackWithDelay } from 'rabbit-mq11111';
import { mintQueue } from './server';

const needToRequeueWithDelay = () => {
    return Math.random() >= 0.5;
};

const parseData = <T>(msg: ConsumeMessage) => {
    return JSON.parse(msg.content.toString()) as T;
};
//Refactoriza: añadir un emmit, also el contrato lo fijo, yo, no tiene sentido que lo haga el consumer

export const callback = (msg: ConsumeMessage | null, channel: Channel) => {
    if (!msg) return; // OJO
    try {
        if (needToRequeueWithDelay()) {
            console.log('NACKKK');
            nackWithDelay(msg, mintQueue.queueName);
        } else {
            const parsedMsg = parseData<SagaStepResponse>(msg);
            const { command, sagaId, payload } = parsedMsg;

            switch (command) {
                case 'mint_image':
                    void mintImage(sagaId, payload);
                    break;

                default:
                    console.log('DEFAULT!!');
                    return channel.nack(msg, false, false);
            }
            console.log('ACKKK', command);
            channel.ack(msg); // significa que lo estoy por lo menos procesando, luego enviaré la respuesta
        }
    } catch (error) {
        console.log('ERROR');
        channel.nack(msg, false, false);
    }
};
