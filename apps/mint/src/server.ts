import express, { Request, Response } from 'express'; // TODO: añadir tipose de esta manera
import { startRabbitMQ, consumeWithParsing, ConsumerEvents } from 'rabbit-mq11111';
import mitt from 'mitt';
import { AvailableMicroservices, MintCommands } from 'rabbit-mq11111/dist/@types';

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
    // void consume(mintQueue.queueName, callback);
    void consumeWithParsing<AvailableMicroservices.Mint>(mintQueue.queueName);
    const emitter = mitt<ConsumerEvents<AvailableMicroservices.Mint>>();

    emitter.on(MintCommands.MintImage, data => {
        // Handle the 'createImage' event
        console.log('Received MINTING COMMAND ORDER:', data);
        // Perform actions based on the data (sagaId and payload) received in the event
    });
    log(`Server is running on http://localhost:${port}`);
});
