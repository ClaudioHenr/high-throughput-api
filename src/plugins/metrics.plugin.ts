import fp from 'fastify-plugin';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { httpRequestDuration, httpRequestsTotal } from '../infra/metrics';

export const metricsPlugin = fp(async (app: FastifyInstance) => {
    console.log('Metrics plugin registrado');

    app.decorateRequest('startTime');

    app.addHook('onRequest', async (request) => {
        console.log('ON REQUEST acionado');
        request.startTime = process.hrtime();
    });

    app.addHook('onResponse', 
        async (request: FastifyRequest, reply: FastifyReply) => {
        console.log('ON RESPONSE acionado');

        if (!request.startTime) return;

        const diff = process.hrtime(request.startTime);
        const durationInSeconds = diff[0] + diff[1] / 1e9;

        const route = request.routeOptions?.url ?? 'unknown';

        httpRequestDuration.observe(
            {
                method: request.method,
                route,
                status_code: reply.statusCode,
            },
            durationInSeconds
        );

        httpRequestsTotal.inc({
            method: request.method,
            route,
            status_code: reply.statusCode,
        });
    });
});
