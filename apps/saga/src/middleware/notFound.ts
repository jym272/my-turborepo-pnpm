import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const message = 'Resource not found';
    res.status(HttpStatusCode.NotFound).send(message);
};
