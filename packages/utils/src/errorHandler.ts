import { HttpStatusCode } from 'axios';
import { activateLogging, log } from './logs';

interface ErrorWithStatus extends Error {
    statusCode: HttpStatusCode;
}

type ServerSideError = Error | undefined;

export const throwError = (
    clientMessage: string,
    statusCode: HttpStatusCode = 400,
    serverSideError: ServerSideError = undefined
) => {
    if (activateLogging()) log(serverSideError ?? `Error: ${clientMessage}`);
    const newError = new Error(clientMessage) as ErrorWithStatus;
    newError.statusCode = statusCode;
    throw newError;
};

export const parseSequelizeError = (err: unknown, serverMessage: string): ServerSideError => {
    let error = new Error(serverMessage);
    if (err instanceof Error) {
        err.message = `${err.message} ${serverMessage}`;
        error = err;
    }
    return error;
};
