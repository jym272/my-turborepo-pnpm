import express, { Request, Response } from 'express';
import { startRabbitMQ } from 'rabbit-mq';

const app = express();
const port = 3022;

// eslint-disable-next-line no-console
const log = console.log;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    res.send("Hello, I'm a happy mocker!");
});

app.get('/ping', (_req: Request, res: Response) => {
    res.send('pong');
});

// return await backend.get<LegendRoom[]>(`/internal/room/getBySetName?setName=${setName}`);
app.get('/internal/room/getBySetName', (req: Request, res: Response) => {
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

/*
const mintQueue = {
    name: 'mint_saga_commands',
    exchange: 'commands_exchange'
};
*/

app.listen(port, async () => {
    const RABBIT_URI = 'amqp://rabbit:1234@localhost:5672';
    await startRabbitMQ(RABBIT_URI);
    // console.log("MQ", mq)
    /*    await mq.startRabbitMQ(RABBIT_URI);
    const consumer = new MintConsumer(mintQueue);
    await  consumer.connect()
    await  consumer.consume()*/

    log(`Server is running on http://localhost:${port}`);
});
