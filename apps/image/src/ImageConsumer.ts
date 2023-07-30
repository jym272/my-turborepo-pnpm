import { SagaStepResponse } from './types';
import { createImage } from './actions';
import { Channel, ConsumeMessage } from 'amqplib';
import { nackWithDelay } from 'rabbit-mq';
import { imageQueue } from './server';

const needToRequeueWithDelay = () => {
    return Math.random() >= 0.5;
};

const parseData = <T>(msg: ConsumeMessage) => {
    return JSON.parse(msg.content.toString()) as T;
};

export const callback = (msg: ConsumeMessage | null, channel: Channel) => {
    if (!msg) return; // OJO
    try {
        if (needToRequeueWithDelay()) {
            console.log('NACKKK');
            nackWithDelay(msg, imageQueue.queueName);
        } else {
            const parsedMsg = parseData<SagaStepResponse>(msg);
            const { command, sagaId } = parsedMsg;

            switch (command) {
                case 'create_image': //hardocoded -> use enums TODO
                    void createImage(sagaId);
                    break;
                case 'add_token_to_image':
                    console.log('ADD TOKEN TO IMAGE');
                    break;
                default:
                    console.log('DEFAULT');
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
