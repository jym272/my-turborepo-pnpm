import express, { Request, Response } from 'express';
import { ImageConsumer } from './ImageConsumer';
import { startRabbitMQ } from 'rabbit-mq';

const app = express();
const port = 3020;

// eslint-disable-next-line no-console
const log = console.log;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    res.send("Hello, I'm -image-");
});

const imageQueue = {
    name: 'image_saga_commands',
    exchange: 'commands_exchange'
};

app.listen(port, async () => {
    await startRabbitMQ('amqp://rabbit:1234@localhost:5672');
    const consumer = new ImageConsumer(imageQueue);
    await consumer.connect();
    consumer.consume();
    log(`Server is running on http://localhost:${port}`);
});
