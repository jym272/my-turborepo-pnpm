import express, { Request, Response } from 'express';
import { startRabbitMQ, consume } from 'rabbit-mq11111';
import { callback } from './MintConsumer';

const app = express();
const port = 3022;

// eslint-disable-next-line no-console
const log = console.log;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    res.send("Hello, I'm -mint-");
});

export const mintQueue = {
    queueName: 'mint_saga_commands',
    exchange: 'commands_exchange'
};

app.listen(port, async () => {
    await startRabbitMQ('amqp://rabbit:1234@localhost:5672', [mintQueue]);
    void consume(mintQueue.queueName, callback);
    log(`Server is running on http://localhost:${port}`);
});
