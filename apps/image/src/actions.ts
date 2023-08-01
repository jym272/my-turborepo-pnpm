import { SagaStepResponse } from './types';
import { sendToQueue } from 'rabbit-mq11111';

const waitWithMessage = async (msg: string, time: number) => {
    await new Promise(resolve => setTimeout(resolve, time));
    console.log(msg);
};

const replySagaQueue = {
    name: 'reply_to_saga',
    routingKey: 'image_micro' // no se usa por ahora
};

const updateSaga = async (sagaId: string, payload: Record<string, any>) => {
    const sagaResponse: SagaStepResponse = {
        microservice: 'image',
        sagaId,
        command: 'create_image', // los comandos terminan siendo pasos de un saga
        status: 'completed',
        payload
    };

    await sendToQueue(replySagaQueue.name, sagaResponse);
    console.log('RESULT IMAGE:  Reply sent to saga');
};

export const createImage = async (sagaId: string) => {
    console.log('CREATE IMAGE');

    await waitWithMessage('Image Created', 2000);
    // tengo que actualizar el estado del SAGA, saga ID
    const random = Math.random();
    await updateSaga(sagaId, { imageId: random });
};

export const updateToken = async (sagaId: string) => {
    console.log('Update Token in image micro');

    await waitWithMessage('Updating Successful', 2000);
    // tengo que actualizar el estado del SAGA, saga ID
    const random = Math.random();
    await updateSaga(sagaId, { imageId: random });
};
// que es lo ultimo que tiene perisitencia en el saga -> es el last step proicessed
// entonces cualquier respuesta que regrese va  aser reliacionada con el
