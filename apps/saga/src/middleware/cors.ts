import cors from 'cors';
import { getEnvOrFail } from 'utils';
export const corsMiddleware = cors({
    origin: getEnvOrFail('CORS_LIST').split(','),
    credentials: true
});
