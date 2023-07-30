import { Router } from 'express';
import { pingController } from '@/controllers';

export const utils: Router = Router();
utils.get('/ping', pingController());
