import { Request, Response, Router } from 'express';
import { HttpStatusCode } from 'axios';
import { MicroserviceCommand, SagaManager } from '@/Saga';

export const saga: Router = Router();
// TODO: is a know saga commands, maybe a name -or a e enuma or another data structure- is better
const commands: MicroserviceCommand[] = [
    {
        command: 'create_image',
        micro: 'image'
    },
    {
        command: 'mint_image',
        micro: 'mint'
    },
    {
        command: 'update_token',
        micro: 'image'
    }
];

saga.get('/saga', async (_req: Request, res: Response) => {
    await SagaManager.process(commands);
    res.status(HttpStatusCode.Ok).json({ message: 'ok' });
});
