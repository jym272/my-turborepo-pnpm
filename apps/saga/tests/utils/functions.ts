export const cookieErrorMessage = (api: string): string => {
    const msg = `'cookie not found in ${api} mock'`;
    console.error(msg);
    return msg;
};

export const createPartialDone = (count: number, done: () => void) => {
    let i = 0;
    return () => {
        if (++i === count) {
            done();
        }
    };
};
