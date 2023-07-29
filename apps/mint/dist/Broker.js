"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Broker", {
    enumerable: true,
    get: function() {
        return Broker;
    }
});
const _amqplib = /*#__PURE__*/ _interop_require_wildcard(require("amqplib"));
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const RABBIT_URI = 'amqp://rabbit:1234@localhost:5672';
const EXCHANGE = 'reply_exchange';
class Broker {
    async connect() {
        try {
            this.connection = await _amqplib.connect(RABBIT_URI);
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(EXCHANGE, 'direct', {
                durable: true
            });
            await this.channel.assertQueue(this.queueName, {
                durable: true
            });
            await this.channel.bindQueue(this.queueName, EXCHANGE, this.routingKey);
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
        }
    }
    sendReply(response) {
        const { channel } = this;
        if (channel === undefined) {
            throw new Error('RabbitMQ channel not initialized.');
        }
        return channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(response)), {
            persistent: true
        });
    }
    cleanUp() {
        const { channel, connection } = this;
        if (channel) {
            void channel.close();
        }
        if (connection) {
            void connection.close();
        }
    }
    constructor(queueName, routingKey){
        _define_property(this, "queueName", void 0);
        _define_property(this, "routingKey", void 0);
        _define_property(this, "connection", void 0);
        _define_property(this, "channel", void 0);
        this.queueName = queueName;
        this.routingKey = routingKey;
        this.queueName = queueName;
        this.routingKey = routingKey;
    }
}
