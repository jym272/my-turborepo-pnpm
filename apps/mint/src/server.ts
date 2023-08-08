import express, { Request, Response } from 'express';
import { connectToSagaCommandEmitter, MintCommands, AvailableMicroservices } from 'rabbit-mq11111';

const app = express();
const port = 3022;

// eslint-disable-next-line no-console
const log = console.log;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    res.send("Hello, I'm -mint-");
});

const needToRequeueWithDelay = () => {
    return Math.random() >= 0.6;
};
const waitWithMessage = async (msg: string, time: number) => {
    await new Promise(resolve => setTimeout(resolve, time));
    console.log(msg);
};
app.listen(port, async () => {
    const emitter = await connectToSagaCommandEmitter('amqp://rabbit:1234@localhost:5672', AvailableMicroservices.Mint);

    emitter.on(MintCommands.MintImage, async ({ channel, sagaId, payload }) => {
        if (needToRequeueWithDelay()) {
            console.log(`NACK - Requeue ${MintCommands.MintImage} with delay`);
            await channel.nackWithDelayAndRetries(1000, 30);
        } else {
            console.log(`${MintCommands.MintImage}`, { payload, sagaId });
            await waitWithMessage('La imagen se ha minteado', 100);
            channel.ackMessage({ tokenId: Math.random() });
        }
    });
    log(`Server is running on http://localhost:${port}`);
});
