import { SagaStepResponse } from './types';
import { Broker } from 'rabbit-mq';

const waitWithMessage = async (msg: string, time: number) => {
    await new Promise(resolve => setTimeout(resolve, time));
    console.log(msg);
};

const replySagaQueue = {
    name: 'mint_saga_reply',
    routingKey: 'mint_micro'
};

const updateSaga = async (sagaId: string, payload: Record<string, any>) => {
    const sagaResponse: SagaStepResponse = {
        sagaId,
        command: 'mint_image', // los comandos terminan siendo pasos de un saga
        status: 'completed',
        payload
    };
    const broker = new Broker(replySagaQueue.name);
    const result = await broker.sendToQueue(sagaResponse);
    console.log('RESULT', result ? 'Reply sent to saga' : 'error Replying to saga'); // it can be 0 or 1
    // broker.cleanUp();

    // Yo como micro no conozco el saga completa, conozco como reaccionar a este paso y
    // reportar status
};

export const mintImage = async (sagaId: string, payload: Record<string, any>) => {
    const imageId = payload.imageId as string;
    console.log(`MINT IMAGE ${imageId}`);

    await waitWithMessage('IMAGE MINTED', 2000);
    // tengo que actualizar el estado del SAGA, saga ID
    const tokenId = Math.random();
    await updateSaga(sagaId, { tokenId });
};
