import express, { Request, Response } from 'express';
import { startGlobalSagaListener } from 'rabbit-mq11111';

const app = express();
const port = 3050;

// eslint-disable-next-line no-console
const log = console.log;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    res.send("Hello, I'm -mint-");
});

app.listen(port, async () => {
    const e = await startGlobalSagaListener('amqp://rabbit:1234@localhost:5672');

    e.on('*', (command, data) => {
        const { channel, sagaId, payload } = data;
        console.log({ command, sagaId, payload });
        channel.nackWithDelayAndRetries(5000, 100);
    });

    log(`Server is running on http://localhost:${port}`);
});
