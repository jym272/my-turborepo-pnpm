import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@custom-types/error';
import { HttpStatusCode } from 'axios';
import { log } from 'utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: HttpException, req: Request, res: Response, next: NextFunction) => {
    const status = err.statusCode ?? err.status ?? HttpStatusCode.InternalServerError;
    const message = err.message || 'Something went wrong';
    log('\x1b[31m%s\x1b[0m', err);
    res.status(status).json({ ...err, message });
};
