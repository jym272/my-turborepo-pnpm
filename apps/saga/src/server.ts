import express, { Request, Response } from 'express';
import { AvailableMicroservices, MintCommands, startGlobalSagaListener, stopRabbitMQ } from 'rabbit-mq11111';

const app = express();
const port = 3050;

// eslint-disable-next-line no-console
const log = console.log;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    res.send("Hello, I'm -mint-");
});

// const needToRequeueWithDelay = () => {
//     return Math.random() >= 0.6;
// };

app.listen(port, async () => {
    const e = await startGlobalSagaListener<AvailableMicroservices>('amqp://rabbit:1234@localhost:5672');

    // Tengo que escuchar todos los eventos que se emiten de otra manera quedará en
    // el mesanje quedará unacked en la cola de rabbit
    // Solución cerrar el canal y abrirlo de nuevo.
    e.on(MintCommands.MintImage, async ({ channel, step }) => {
        console.log(`NACKKKKK - Requeue ${MintCommands.MintImage} with delay`);
        await channel.nackWithDelayAndRetries(100, 100);
    });
    e.on('*', async (command, { step, channel }) => {
        if (command === MintCommands.MintImage) {
            console.log('IGNORADO', command);
            return;
        }
        console.log('A VOS NO TE CONSUO', command);
        await channel.nackWithDelayAndRetries(100, 100);
    });
    log(`Server is running on http://localhost:${port}`);
});

const terminateProcessListener: NodeJS.SignalsListener = async signal => {
    await stopRabbitMQ();
    console.warn('\x1b[31m%s\x1b[0m', `${String.fromCodePoint(0x1f44b)} ${signal} Server is shutting down. Goodbye!`);
    process.exit(0);
};

process.on('SIGINT', terminateProcessListener);
process.on('SIGTERM', terminateProcessListener);
