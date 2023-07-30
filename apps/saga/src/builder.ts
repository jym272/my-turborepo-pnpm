import express, { Router } from 'express';
import 'express-async-errors';
import { addRoutes } from '@/router';
import { addMiddlewares, addFinalMiddlewares, Middlewares } from '@/middleware';

export class ServerBuilder {
    private readonly server: express.Express;

    private constructor() {
        this.server = express();
    }

    public static create(): ServerBuilder {
        return new ServerBuilder();
    }

    public addMiddlewares(discreteMiddlewares: Middlewares = []): this {
        addMiddlewares(this.server, discreteMiddlewares);
        return this;
    }

    /*
     * @param discreteRoutes: Router[] = []
     * @returns ServerBuilder
     * @description
     * This method is used to add discrete routes to the server.
     * The routes are added to the server in the order they are passed.
     * If no routes are passed, the server will have all routes.
     */
    public addRoutes(discreteRoutes: Router[] = []): this {
        addRoutes(this.server, discreteRoutes);
        return this;
    }

    private addFinalMiddlewares(): this {
        addFinalMiddlewares(this.server);
        return this;
    }

    public async build<T = void>(
        { withDb }: { withDb: () => Promise<T> } = {
            withDb: () => Promise.resolve({} as T)
        }
    ): Promise<express.Express> {
        await withDb();
        this.addFinalMiddlewares();
        return this.server;
    }
}
