import { Request, Response, Router } from 'express';
import { HttpStatusCode } from 'axios';
import { SagaManager } from '@/Saga';

export const saga: Router = Router();

saga.get('/saga', async (_req: Request, res: Response) => {
    await SagaManager.processLinkedList();
    res.status(HttpStatusCode.Ok).json({ message: 'ok' });
});
