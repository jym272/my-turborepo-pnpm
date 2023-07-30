import express, { Router } from 'express';
import { saga } from '@router/saga';
import { utils } from '@router/utils';

const routes = [utils, saga];

export const addRoutes = (server: express.Express, discreteRoutes: Router[] = []) => {
    const routesToAdd = discreteRoutes.length > 0 ? discreteRoutes : routes;
    for (const route of routesToAdd) {
        server.use('/api/legend-transactional', route);
    }
};
