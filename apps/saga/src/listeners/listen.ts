import { SagaStepResponse } from '@/Saga';
import { continueNextStepSaga } from '@/Saga/DraftSaga/Saga';
import { Channel, ConsumeMessage } from 'amqplib';
import { nackWithDelay } from 'rabbit-mq11111';

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
            console.log('NACKING IMAGE');
            nackWithDelay(msg, 'reply_to_saga');
        } else {
            const parsedMsg = parseData<SagaStepResponse>(msg);
            const { command, microservice } = parsedMsg;
            switch (microservice) {
                case 'image': //hardocoded -> use enums TODO
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
                    break;
                case 'mint': //hardocoded -> use enums TODO
                    switch (command) {
                        case 'mint_image': //hardocoded -> use enums TODO
                            if (parsedMsg.status === 'completed') {
                                console.log('MINTEANDO ANDO');
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
                    break;
                default:
                    console.error('DEFAULT', microservice);
                    break;
            }

            console.log('ACKKK', command);
            channel.ack(msg); // significa que lo estoy por lo menos procesando, luego enviaré la respuesta
        }
    } catch (error) {
        console.log('ERROR');
        channel.nack(msg, false, false); //quizas sea mejor nackearlo con requeue
    }
};
