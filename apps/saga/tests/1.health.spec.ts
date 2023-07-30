import axios, { HttpStatusCode } from 'axios';
import * as http from 'http';
import { ServerBuilder } from '@/builder';
import { AddressInfo } from 'net';
import { utils } from '@router/utils';

describe('/api/legend-transactional/ping endpoint GET', () => {
    let httpServer: http.Server;
    let port: number;

    beforeEach(done => {
        void ServerBuilder.create()
            .addMiddlewares()
            .addRoutes([utils])
            .build()
            .then(server => {
                httpServer = server.listen(() => {
                    port = (httpServer.address() as AddressInfo).port;
                    done();
                });
            });
    });
    afterEach(() => {
        httpServer.close();
    });

    it('returns a pong', async () => {
        const response = await axios.get(`http://localhost:${port}/api/legend-transactional/ping`);
        expect(response.status).toBe(HttpStatusCode.Ok);
        expect(response.data).toEqual('pong');
    });
});
