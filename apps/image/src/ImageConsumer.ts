import { QueueConsumer } from 'rabbit-mq';
import { SagaStepResponse } from './types';
import { createImage } from './actions';

const needToRequeueWithDelay = () => {
    return Math.random() >= 0.5;
};

export class ImageConsumer extends QueueConsumer {
    public consume() {
        const { channel, queueName } = this;
        if (channel === undefined) {
            throw new Error('RabbitMQ channel not initialized.');
        }

        // TODO: no tendría que extender una clase abstracta, solo necesito el método consume!!!
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
                        const { command, sagaId } = parsedMsg;

                        switch (command) {
                            case 'create_image': //hardocoded -> use enums TODO
                                void createImage(sagaId);
                                break;
                            case 'add_token_to_image':
                                console.log('ADD TOKEN TO IMAGE');
                                break;
                            default:
                                console.log('DEFAULT');
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
