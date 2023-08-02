import { SagaStepResponse } from './types';
import { sendToQueue } from 'rabbit-mq11111';

const waitWithMessage = async (msg: string, time: number) => {
    await new Promise(resolve => setTimeout(resolve, time));
    console.log(msg);
};

const replySagaQueue = {
    name: 'reply_to_saga'
};

export const createImage = async (sagaId: string) => {
    console.log('CREATE IMAGE HAS BEGUN');
    await waitWithMessage('Image Created', 2000);

    const sagaResponse: SagaStepResponse = {
        microservice: 'image',
        sagaId,
        command: 'create_image',
        status: 'completed',
        payload: { imageId: Math.random() }
    };

    await sendToQueue(replySagaQueue.name, sagaResponse);
    console.log('createImage:  Reply sent to saga');
};

export const updateToken = async (sagaId: string) => {
    console.log('UPDATE TOKEN HAS BEGUN');

    await waitWithMessage('Updating Successful', 2000);
    const sagaResponse: SagaStepResponse = {
        microservice: 'image',
        sagaId,
        command: 'update_token',
        status: 'completed',
        payload: { imageId: Math.random() } // el payload es usado en el paso siguiente
    };
    await sendToQueue(replySagaQueue.name, sagaResponse);
    console.log('updateToken:  Reply sent to saga');
};
