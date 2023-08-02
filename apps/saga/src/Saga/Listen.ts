import { ImageCommands, MintCommands, SagaManager, SagaStepResponse } from '@/Saga';
import { Channel, ConsumeMessage } from 'amqplib';
// import { nackWithDelay } from 'rabbit-mq11111';

// const needToRequeueWithDelay = () => {
//     return Math.random() >= 0.9;
// };
// if (needToRequeueWithDelay()) {
//             console.log('NACKING');
//             nackWithDelay(msg, 'reply_to_saga');
//         } else {

const parseData = <T>(msg: ConsumeMessage) => {
    return JSON.parse(msg.content.toString()) as T;
};
// TODO: el único estado que puedo procesar es completo.
export const callback = (msg: ConsumeMessage | null, channel: Channel) => {
    if (!msg) return;
    let parsedMsg: SagaStepResponse;
    try {
        parsedMsg = parseData<SagaStepResponse>(msg);
    } catch (error) {
        console.log('Parsing Message Failed');
        channel.nack(msg, false, false);
        return;
    }

    const { microservice } = parsedMsg;

    let itCanBeHandled = false;

    switch (microservice) {
        case 'image': {
            const command = parsedMsg.command as ImageCommands;
            switch (command) {
                case 'create_image':
                case 'update_token':
                    itCanBeHandled = true;
                    break;
            }
            break;
        }
        case 'mint': {
            const command = parsedMsg.command as MintCommands;
            switch (command) {
                case 'mint_image':
                    itCanBeHandled = true;
                    break;
            }
            break;
        }
    }
    if (itCanBeHandled) {
        if (parsedMsg.status === 'completed') {
            void SagaManager.continue(parsedMsg);
            channel.ack(msg);
        } else {
            // TODO: manejar otro estado
            console.log('ERROR', parsedMsg);
            channel.nack(msg, false, false);
        }
        return;
    }
    return channel.nack(msg, false, false);
};
