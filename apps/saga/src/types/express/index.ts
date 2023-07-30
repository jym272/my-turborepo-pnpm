export {};

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            myData?: {
                userId?: string;
                cookieAuth?: string;
                email?: string;
                //[key: string]: any;
            };
        }
    }
}
