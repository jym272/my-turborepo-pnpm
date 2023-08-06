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

export const mintQueue = {
    queueName: 'mint_saga_commands',
    exchange: 'commands_exchange'
};

/*const needToRequeueWithDelay = () => {
    return Math.random() >= 0.3;
};*/
const waitWithMessage = async (msg: string, time: number) => {
    await new Promise(resolve => setTimeout(resolve, time));
    console.log(msg);
};
app.listen(port, async () => {
    const emitter = await connectToSagaCommandEmitter('amqp://rabbit:1234@localhost:5672', AvailableMicroservices.Mint);

    emitter.on(MintCommands.MintImage, async ({ channel, sagaId, payload }) => {
        // Handle the 'createImage' event
        // if (needToRequeueWithDelay()) {
        //     console.log('NACKKK');
        //     channel.nackWithDelayAndRetries();
        // } else {
        console.log(`${MintCommands.MintImage}`, { payload, sagaId });

        await waitWithMessage('IMAGE MINTED', 1000);
        channel.ackMessage({ tokenId: Math.random() });
        // }
    });
    log(`Server is running on http://localhost:${port}`);
});
