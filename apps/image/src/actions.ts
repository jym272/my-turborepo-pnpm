import { SagaStepResponse } from './types';
import { Broker } from 'rabbit-mq';

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
    const broker = new Broker(replySagaQueue.name);
    const result = await broker.sendToQueue(sagaResponse);
    console.log('RESULT', result ? 'reply sent to saga' : 'error Replying to saga'); // it can be 0 or 1

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
