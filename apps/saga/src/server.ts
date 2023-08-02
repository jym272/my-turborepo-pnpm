import { ServerBuilder } from '@/builder';
import { startSequelize } from '@/db';
import { getEnvOrFail, log, logServerIsRunning } from 'utils';
import { consume, startRabbitMQ, stopRabbitMQ } from 'rabbit-mq11111';
import { callback } from '@/Saga';

const replySagaQueue = {
    queueName: 'reply_to_saga',
    exchange: 'reply_exchange'
};

void (async () => {
    try {
        const PORT = getEnvOrFail('PORT');
        const server = await ServerBuilder.create().addMiddlewares().addRoutes().build({ withDb: startSequelize });
        server.listen(PORT, () => logServerIsRunning(PORT));
        await startRabbitMQ(getEnvOrFail('RABBIT_URI'), [replySagaQueue]);
        void consume('reply_to_saga', callback);
    } catch (error) {
        log(error);
        process.exitCode = 1;
    }
})();

const terminateProcessListener: NodeJS.SignalsListener = async signal => {
    await stopRabbitMQ();
    log('\x1b[31m%s\x1b[0m', `${String.fromCodePoint(0x1f44b)} ${signal} Server is shutting down. Goodbye!`);
    process.exit(0);
};

process.on('SIGINT', terminateProcessListener);
process.on('SIGTERM', terminateProcessListener);
