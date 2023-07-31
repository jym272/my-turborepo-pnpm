import { ImageCommands, SagaStepResponse } from '@/Saga';
import { continueNextStepSaga } from '@/Saga/DraftSaga/Saga';
import { Channel, ConsumeMessage } from 'amqplib';
import { nackWithDelay } from 'rabbit-mq';

const needToRequeueWithDelay = () => {
    return Math.random() >= 0.5;
};

const EXCHANGE = 'reply_exchange'; // what am I consuming? -> replies, commands, notifications etc...

export const imageReplySagaQueue = {
    queueName: 'image_saga_reply', // unique queue name
    exchange: EXCHANGE
};

const parseData = <T>(msg: ConsumeMessage) => {
    return JSON.parse(msg.content.toString()) as T;
};

export const imageCallback = (msg: ConsumeMessage | null, channel: Channel) => {
    if (!msg) return; // OJO

    try {
        if (needToRequeueWithDelay()) {
            // const headers = msg.properties.headers;
            console.log('NACKING IMAGE');
            nackWithDelay(msg, imageReplySagaQueue.queueName);
        } else {
            const parsedMsg = parseData<SagaStepResponse<ImageCommands>>(msg);
            const { command } = parsedMsg;

            switch (command) {
                case 'create_image': //hardocoded -> use enums TODO
                    if (parsedMsg.status === 'completed') {
                        void continueNextStepSaga(parsedMsg);
                    } else {
                        // pensar que hacer aca TODO
                        console.log('ERROR', parsedMsg);
                    }
                    break;
                case 'add_token_to_image':
                    console.log('ADD TOKEN TO IMAGE');
                    break;
                default:
                    console.log('DEFAULT', command);
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
