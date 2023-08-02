import { Request, Response, Router } from 'express';
import { HttpStatusCode } from 'axios';
import { SagaProcess } from '@/Saga/DraftSaga/Saga';
import { SagaProcessRefactor } from '@/Saga/RefactorSaga';
import { SagaProcessLinkedList } from '@/Saga/RefactorSaga2';

export const saga: Router = Router();

saga.get('/saga', async (_req: Request, res: Response) => {
    // await SagaProcess();
    // await SagaProcessRefactor();
    await SagaProcessLinkedList();
    res.status(HttpStatusCode.Ok).json({ message: 'ok' });
});
