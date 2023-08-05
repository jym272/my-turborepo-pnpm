import { SagaStepResponse } from './types';
import { sendToQueue } from 'rabbit-mq11111';

const waitWithMessage = async (msg: string, time: number) => {
    await new Promise(resolve => setTimeout(resolve, time));
    console.log(msg);
};

const replySagaQueue = {
    name: 'reply_to_saga'
};
// TODO: adentro del obkjecto del emmit!!!!
const updateSaga = async (sagaId: string, payload: Record<string, any>) => {
    const sagaResponse: SagaStepResponse = {
        microservice: 'mint',
        sagaId,
        command: 'mint_image',
        status: 'completed',
        payload
    };
    await sendToQueue(replySagaQueue.name, sagaResponse);
    console.log('RESULT MINT:  Reply sent to saga');
};

export const mintImage = async (sagaId: string, payload: Record<string, any>) => {
    const imageId = payload.imageId as string;
    console.log(`MINT IMAGE ${imageId}`);

    await waitWithMessage('IMAGE MINTED', 2000);
    const tokenId = Math.random();
    await updateSaga(sagaId, { tokenId });
};
