import express, { Request, Response } from 'express';
import { consume, startRabbitMQ } from 'rabbit-mq11111';
import { callback } from './ImageConsumer';

const app = express();
const port = 3020;

// eslint-disable-next-line no-console
const log = console.log;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    res.send("Hello, I'm -image-");
});

export const imageQueue = {
    queueName: 'image_saga_commands',
    exchange: 'commands_exchange'
};

app.listen(port, async () => {
    await startRabbitMQ('amqp://rabbit:1234@localhost:5672', [imageQueue]);
    void consume(imageQueue.queueName, callback);
    log(`Server is running on http://localhost:${port}`);
});
