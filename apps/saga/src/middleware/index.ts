import express from 'express';
import { errorHandler } from '@middleware/error';
import { notFoundHandler } from '@middleware/notFound';
import { bodyParserMiddleware } from '@middleware/bodyParser';
import { corsMiddleware } from '@middleware/cors';

const finalMiddlewares = [errorHandler, notFoundHandler];

const middlewares = [corsMiddleware, bodyParserMiddleware];
export type Middlewares = typeof middlewares;

export const addMiddlewares = (server: express.Express, discreteMiddlewares: Middlewares = []) => {
    const middlewaresToAdd = discreteMiddlewares.length > 0 ? discreteMiddlewares : middlewares;
    for (const middleware of middlewaresToAdd) {
        server.use(middleware);
    }
};

export const addFinalMiddlewares = (server: express.Express) => {
    for (const middleware of finalMiddlewares) {
        server.use(middleware);
    }
};
