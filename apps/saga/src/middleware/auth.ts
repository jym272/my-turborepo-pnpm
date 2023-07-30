import axios, { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@custom-types/error';
import { getEnvOrFail } from 'utils';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.cookie)
        throw new HttpException(HttpStatusCode.Unauthorized, 'session cookie not found', 'Not Authorized');

    const AUTH_URL = getEnvOrFail('AUTH_URL');
    const cookie = req.headers.cookie;
    const cookieHeader = { Cookie: cookie };
    const response = await axios.get<{ id: string; email: string }>(`${AUTH_URL}/current-user`, {
        headers: cookieHeader
    });

    if (!response.data.id) {
        throw new HttpException(HttpStatusCode.Unauthorized, 'session cookie not authorized', 'Not Authorized');
    }

    req.myData = {
        userId: response.data.id,
        cookieAuth: cookie,
        email: response.data.email
    };
    next();
};
