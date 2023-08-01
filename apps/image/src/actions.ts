import { SagaStepResponse } from './types';
import {  sendToQueue2 } from 'rabbit-mq11111';

const waitWithMessage = async (msg: string, time: number) => {
    await new Promise(resolve => setTimeout(resolve, time));
    console.log(msg);
};

const replySagaQueue = {
    name: 'image_saga_reply',
    routingKey: 'image_micro'
};

const updateSaga = async (sagaId: string, payload: Record<string, any>) => {
    const sagaResponse: SagaStepResponse = {
        sagaId,
        command: 'create_image', // los comandos terminan siendo pasos de un saga
        status: 'completed',
        payload
    };

    await sendToQueue2(replySagaQueue.name, sagaResponse);
    // const broker = new Broker(replySagaQueue.name);
    // const result = await broker.sendToQueue(sagaResponse);
    console.log('RESULT IMAGE:  Reply sent to saga');
    // broker.cleanUp();

    // Yo como micro no conozco el saga completa, conozco como reaccionar a este paso y
    // reportar status
};

export const createImage = async (sagaId: string) => {
    console.log('CREATE IMAGE');

    await waitWithMessage('Image Created', 2000);
    // tengo que actualizar el estado del SAGA, saga ID
    const random = Math.random();
    await updateSaga(sagaId, { imageId: random });
};
