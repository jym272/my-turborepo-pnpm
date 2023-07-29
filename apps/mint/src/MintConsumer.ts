import { QueueConsumer } from 'rabbit-mq';
import { SagaStepResponse } from './types';
import { mintImage } from './actions';

const needToRequeueWithDelay = () => {
    return Math.random() >= 0.5;
};

export class MintConsumer extends QueueConsumer {
    public consume() {
        const { channel, queueName, routingKey } = this;
        if (channel === undefined) {
            throw new Error('RabbitMQ channel not initialized.');
        }

        void channel.consume(
            queueName,
            msg => {
                if (!msg) return; // OJO
                try {
                    if (needToRequeueWithDelay()) {
                        console.log('NACKKK');
                        this.nackWithDelay(msg);
                    } else {
                        const parsedMsg = this.parseData<SagaStepResponse>(msg);
                        const { command, sagaId, payload } = parsedMsg;

                        switch (command) {
                            case 'mint_image': //hardocoded -> use enums TODO
                                void mintImage(sagaId, payload);
                                break;

                            default:
                                console.log('DEFAULT!!');
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
