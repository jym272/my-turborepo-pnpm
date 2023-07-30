import { Router } from 'express';
import { pingController } from '@/controllers';

export const utils = Router();
utils.get('/ping', pingController());
