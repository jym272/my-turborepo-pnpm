import { MintCommands, SagaStepResponse } from '@/Saga';
import { Channel, ConsumeMessage } from 'amqplib';
import { nackWithDelay } from 'rabbit-mq';

const needToRequeueWithDelay = () => {
    return Math.random() >= 0.5;
};

const EXCHANGE = 'reply_exchange'; // what am I consuming? -> replies, commands, notifications etc...

export const mintReplySagaQueue = {
    queueName: 'mint_saga_reply',
    exchange: EXCHANGE
};

const parseData = <T>(msg: ConsumeMessage) => {
    return JSON.parse(msg.content.toString()) as T;
};

export const mintCallback = (msg: ConsumeMessage | null, channel: Channel) => {
    if (!msg) return; // OJO

    try {
        if (needToRequeueWithDelay()) {
            console.log('NACKING');
            nackWithDelay(msg, mintReplySagaQueue.queueName);
        } else {
            const parsedMsg = parseData<SagaStepResponse<MintCommands>>(msg);
            const { command } = parsedMsg;

            switch (command) {
                case 'mint_image': //hardocoded -> use enums TODO
                    if (parsedMsg.status === 'completed') {
                        console.log('MINTEANDO ANDO');
                        // void continueNextStepSaga(parsedMsg);
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
