import { MintCommands, SagaStepResponse } from '@/Saga';
import { QueueConsumer } from 'rabbit-mq';

const needToRequeueWithDelay = () => {
    return Math.random() >= 0.5;
};

export class MintConsumer extends QueueConsumer {
    public consume() {
        const { channel, queueName } = this;
        if (channel === undefined) {
            throw new Error('RabbitMQ channel not initialized.');
        }
        void channel.consume(
            queueName,
            msg => {
                if (!msg) return; // OJO
                try {
                    if (needToRequeueWithDelay()) {
                        this.nackWithDelay(msg);
                    } else {
                        const parsedMsg = this.parseData<SagaStepResponse<MintCommands>>(msg);
                        const { command } = parsedMsg;

                        switch (command) {
                            case 'mint_image': //hardocoded -> use enums TODO
                                if (parsedMsg.status === 'completed') {
                                    console.log('MINTEANDO ANDO');
                                    // void continueNextStepSaga(parsedMsg);
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
                        console.log('ACKKK', command);
                        channel.ack(msg); // significa que lo estoy por lo menos procesando, luego enviaré la respuesta
                    }
                } catch (error) {
                    console.log('ERROR');
                    channel.nack(msg, false, false);
                }
            },
            {
                exclusive: true, // only one consumer per queue
                noAck: false // we need to ack the messages, manually
            }
        );
    }
}
