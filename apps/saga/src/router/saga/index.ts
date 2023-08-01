import { Request, Response, Router } from 'express';
import { HttpStatusCode } from 'axios';
import { SagaProcess } from '@/Saga/DraftSaga/Saga';
import { SagaProcessRefactor } from '@/Saga/RefactorSaga';

export const saga: Router = Router();

saga.get('/saga', async (_req: Request, res: Response) => {
    await SagaProcess();
    // await SagaProcessRefactor();
    res.status(HttpStatusCode.Ok).json({ message: 'ok' });
});
