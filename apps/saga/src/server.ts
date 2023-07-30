import { ServerBuilder } from '@/builder';
import { startSequelize } from '@/db';
import { startConsumers, stopConsumers } from '@/listeners/listen';
import { getEnvOrFail, log, logServerIsRunning } from 'utils';
import { startRabbitMQ, stopRabbitMQ } from 'rabbit-mq';

void (async () => {
    try {
        const PORT = getEnvOrFail('PORT');
        const server = await ServerBuilder.create().addMiddlewares().addRoutes().build({ withDb: startSequelize });
        server.listen(PORT, () => logServerIsRunning(PORT));
        await startRabbitMQ(getEnvOrFail('RABBIT_URI'));
        await startConsumers();
    } catch (error) {
        log(error);
        process.exitCode = 1;
    }
})();

const terminateProcessListener = async () => {
    await stopConsumers();
    await stopRabbitMQ();
    log('\x1b[31m%s\x1b[0m', `${String.fromCodePoint(0x1f44b)} Server is shutting down. Goodbye!`);
    process.exit(0);
};

process.on('SIGINT', terminateProcessListener);
process.on('SIGTERM', terminateProcessListener);
