import { Request, Response, Router } from 'express';
import { HttpStatusCode } from 'axios';
import { SagaProcess } from '@/Saga/DraftSaga/Saga';

export const saga = Router();

saga.get('/saga', async (req: Request, res: Response) => {
    await SagaProcess();
    res.status(HttpStatusCode.Ok).json({ message: 'ok' });
});
