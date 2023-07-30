import { Request, Response } from 'express';
import { HttpStatusCode } from 'axios';

// /api/legend-integrations/ping
export const pingController = () => {
    return (_req: Request, res: Response) => {
        res.status(HttpStatusCode.Ok).send('pong');
    };
};
