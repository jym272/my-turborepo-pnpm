import express, { Request, Response } from 'express';
import { AvailableMicroservices, ImageCommands, connectToSagaCommandEmitter } from 'rabbit-mq11111';

const app = express();
const port = 3020;

// eslint-disable-next-line no-console
const log = console.log;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    console.log('sou uo');
    res.send("Hello, I'm -image-");
});

const waitWithMessage = async (msg: string, time: number) => {
    await new Promise(resolve => setTimeout(resolve, time));
    console.log(msg);
};

const needToRequeueWithDelay = () => {
    return Math.random() >= 0.6;
};

app.listen(port, async () => {
    // RECORDAR CONSUMIR TODOS LOS MENSAJES DE LA COLA de IMAGE COMMANDS
    const emitter = await connectToSagaCommandEmitter(
        'amqp://rabbit:1234@localhost:5672',
        AvailableMicroservices.Image
    );

    emitter.on(ImageCommands.CreateImage, async ({ channel, sagaId, payload }) => {
        if (needToRequeueWithDelay()) {
            const count = await channel.nackWithDelayAndRetries(1000, 30);
            console.log(`NACK - Requeue ${ImageCommands.CreateImage} with delay and retries`, count);
        } else {
            console.log(`${ImageCommands.CreateImage}`, { payload, sagaId });
            await waitWithMessage('La imagen se ha creado', 100);
            channel.ackMessage({ imageId: Math.random() });
        }
    });
    emitter.on(ImageCommands.UpdateToken, async ({ channel, sagaId, payload }) => {
        if (needToRequeueWithDelay()) {
            const count = await channel.nackWithDelayAndRetries(1000, 3);
            console.log(`NACK - Requeue ${ImageCommands.UpdateToken} with delay and retries`, count);
        } else {
            console.log(`${ImageCommands.UpdateToken}`, { payload, sagaId });
            await waitWithMessage('La imagen se ha actualizado', 100);
            channel.ackMessage({ imageidUpdated: Math.random() });
        }
    });

    log(`Server is running on http://localhost:${port}`);
});
