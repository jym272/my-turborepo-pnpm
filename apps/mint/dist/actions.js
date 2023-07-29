"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "mintImage", {
    enumerable: true,
    get: function() {
        return mintImage;
    }
});
const _Broker = require("./Broker");
const waitWithMessage = async (msg, time)=>{
    await new Promise((resolve)=>setTimeout(resolve, time));
    console.log(msg);
};
const replySagaQueue = {
    name: 'mint_saga_reply',
    routingKey: 'mint_micro'
};
const updateSaga = async (sagaId, payload)=>{
    const sagaResponse = {
        sagaId,
        command: 'mint_image',
        status: 'completed',
        payload
    };
    const broker = new _Broker.Broker(replySagaQueue.name, replySagaQueue.routingKey);
    await broker.connect();
    const result = broker.sendReply(sagaResponse);
    console.log('RESULT', result ? 'Reply sent to saga' : 'error Replying to saga'); // it can be 0 or 1
// Yo como micro no conozco el saga completa, conozco como reaccionar a este paso y
// reportar status
};
const mintImage = async (sagaId, payload)=>{
    const imageId = payload.imageId;
    console.log(`MINT IMAGE ${imageId}`);
    await waitWithMessage('IMAGE MINTED', 2000);
    // tengo que actualizar el estado del SAGA, saga ID
    const tokenId = Math.random();
    await updateSaga(sagaId, {
        tokenId
    });
};
