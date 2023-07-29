"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MintConsumer", {
    enumerable: true,
    get: function() {
        return MintConsumer;
    }
});
const _rabbitmq = require("rabbit-mq");
const _actions = require("./actions");
const needToRequeueWithDelay = ()=>{
    return Math.random() >= 0.5;
};
class MintConsumer extends _rabbitmq.QueueConsumer {
    consume() {
        const { channel, queueName, routingKey } = this;
        if (channel === undefined) {
            throw new Error('RabbitMQ channel not initialized.');
        }
        void channel.consume(queueName, (msg)=>{
            if (!msg) return; // OJO
            try {
                if (needToRequeueWithDelay()) {
                    console.log('NACKKK');
                    this.nackWithDelay(msg);
                } else {
                    const parsedMsg = this.parseData(msg);
                    const { command, sagaId, payload } = parsedMsg;
                    switch(command){
                        case 'mint_image':
                            void (0, _actions.mintImage)(sagaId, payload);
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
        }, {
            exclusive: true,
            noAck: false // we need to ack the messages, manually
        });
    }
}
