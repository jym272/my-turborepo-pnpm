import { Sequelize } from 'sequelize';
import { createNamespace } from 'cls-hooked';
import { initDefinitions } from '@db/definitions';
import { getEnvOrFail } from 'utils';

const namespace = createNamespace('transaction-namespace');
Sequelize.useCLS(namespace);

let sequelizeInstance: Sequelize | null = null;

export const getSequelizeClient = () => {
    if (sequelizeInstance) {
        return sequelizeInstance;
    }
    const config = {
        user: getEnvOrFail('POSTGRES_USER'),
        password: getEnvOrFail('POSTGRES_PASSWORD'),
        database: getEnvOrFail('POSTGRES_DB'),
        host: getEnvOrFail('POSTGRES_HOST'),
        port: getEnvOrFail('POSTGRES_PORT')
    };
    sequelizeInstance = new Sequelize(config.database, config.user, config.password, {
        host: config.host,
        dialect: 'postgres',
        // logging: activateLogging() ? log : false,
        logging: false,
        port: Number(config.port),
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
    return sequelizeInstance;
};

const createSequelize = () => getSequelizeClient();

const initializeSequelize = async (sequelize: Sequelize) => {
    await sequelize.authenticate();
    initDefinitions(sequelize);
    await sequelize.sync();
    return sequelize;
};

export const startSequelize = async () => {
    return initializeSequelize(createSequelize());
};
