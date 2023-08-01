import { SagaStepResponse } from './types';
import { sendToQueue } from 'rabbit-mq11111';

const waitWithMessage = async (msg: string, time: number) => {
    await new Promise(resolve => setTimeout(resolve, time));
    console.log(msg);
};

const replySagaQueue = {
    name: 'reply_to_saga',
    routingKey: 'mint_micro' // no se usa por ahora
};

const updateSaga = async (sagaId: string, payload: Record<string, any>) => {
    const sagaResponse: SagaStepResponse = {
        microservice: 'mint',
        sagaId,
        command: 'mint_image', // los comandos terminan siendo pasos de un saga
        status: 'completed',
        payload
    };
    await sendToQueue(replySagaQueue.name, sagaResponse);
    // const broker = new Broker(replySagaQueue.name);
    // const result = await broker.sendToQueue(sagaResponse);
    console.log('RESULT MINT:  Reply sent to saga');
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
