"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _express = /*#__PURE__*/ _interop_require_default(require("express"));
const _rabbitmq = require("rabbit-mq");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const app = (0, _express.default)();
const port = 3022;
// eslint-disable-next-line no-console
const log = console.log;
app.use(_express.default.json());
app.get('/', (req, res)=>{
    res.send("Hello, I'm a happy mocker!");
});
app.get('/ping', (req, res)=>{
    res.send('pong');
});
// return await backend.get<LegendRoom[]>(`/internal/room/getBySetName?setName=${setName}`);
app.get('/internal/room/getBySetName', (req, res)=>{
    const { setName } = req.query;
    log('setName: ', setName);
    const returnDataRoom = [
        {
            Id: '1'
        }
    ];
    res.send(returnDataRoom);
});
// Start the server
const mintQueue = {
    name: 'mint_saga_commands',
    exchange: 'commands_exchange'
};
app.listen(port, async ()=>{
    const RABBIT_URI = 'amqp://rabbit:1234@localhost:5672';
    await (0, _rabbitmq.startRabbitMQ)(RABBIT_URI);
    // console.log("MQ", mq)
    /*    await mq.startRabbitMQ(RABBIT_URI);
    const consumer = new MintConsumer(mintQueue);
    await  consumer.connect()
    await  consumer.consume()*/ log(`Server is running on http://localhost:${port}`);
});
