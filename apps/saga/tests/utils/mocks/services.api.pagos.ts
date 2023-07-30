import { log } from '@/utils';

/*
 * Se intentará Happy path para todos los mocks, los test de pagosApi en su correspondiente micro.
 */
export const mockServicesApiPagos = {
    pagosApi: {
        putNftOnSale: jest.fn((cookie: string, tokenId: string, price: number, adminp: number, minterp: number) => {
            log('putNftOnSale', { cookie, tokenId, price, adminp, minterp });
            return Promise.resolve();
        }),
        removeNftFromSale: jest.fn((cookie: string, tokenId: string) => {
            log('removeNftFromSale', { cookie, tokenId });
            return Promise.resolve();
        }),
        getBalance: jest.fn((cookie: string) => {
            log('getBalance', { cookie });
            return Promise.resolve({ data: { data: { amount: 100 } } });
            // Usar en los test: mockServicesApiPagos.pagosApi.getBalance.mockResolvedValueOnce({ data: { data: { amount: 1000 } } });
        }),
        buyNft: jest.fn((cookie: string, tokenId: string) => {
            log('buyNft', { cookie, tokenId });
            return Promise.resolve();
        }),
        mint: jest.fn((cookie: string, ids: string[]) => {
            log('mint', { cookie, ids });
            return Promise.resolve({ data: { data: [{ tokenId: 'tokenId' }] } });
        }),
        // useCoins: async (cookie: string, amount: number, product: string, generationId: string) => {
        //         return await backend.post<PurchaseResponse>('blockchain/makeapurchase', { amount: amount, description: product, idproduct: generationId }, { headers: { Cookie: cookie } });
        //     },
        useCoins: jest.fn((cookie: string, amount: number, product: string, generationId: string) => {
            log('useCoins', { cookie, amount, product, generationId });
            return Promise.resolve();
        })
    }
};
