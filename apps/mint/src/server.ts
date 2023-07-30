import express, { Request, Response } from 'express';
import { startRabbitMQ } from 'rabbit-mq';
import { MintConsumer } from './MintConsumer';

const app = express();
const port = 3022;

// eslint-disable-next-line no-console
const log = console.log;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    res.send("Hello, I'm -mint-");
});

const mintQueue = {
    name: 'mint_saga_commands',
    exchange: 'commands_exchange'
};

app.listen(port, async () => {
    await startRabbitMQ('amqp://rabbit:1234@localhost:5672');
    const consumer = new MintConsumer(mintQueue);
    await consumer.connect();
    consumer.consume();

    log(`Server is running on http://localhost:${port}`);
});
