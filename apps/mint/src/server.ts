import express, { Request, Response } from 'express'; // TODO: añadir tipose de esta manera
import { startRabbitMQ2 } from 'rabbit-mq11111';
import { AvailableMicroservices, MintCommands } from 'rabbit-mq11111/dist/@types';
import { mintImage } from './actions';

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

const needToRequeueWithDelay = () => {
    return Math.random() >= 0.3;
};

app.listen(port, async () => {
    const emitter = await startRabbitMQ2('amqp://rabbit:1234@localhost:5672', AvailableMicroservices.Mint);

    emitter.on(MintCommands.MintImage, async ({ channel, sagaId, payload }) => {
        // Handle the 'createImage' event
        if (needToRequeueWithDelay()) {
            console.log('NACKKK');
            channel.nackWithDelayAndRetries();
        } else {
            await mintImage(`${sagaId}`, payload);
            channel.ackMessage();
        }
    });
    log(`Server is running on http://localhost:${port}`);
});
