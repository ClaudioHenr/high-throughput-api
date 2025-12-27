import { FastifyInstance } from 'fastify';
import { register } from '../infra/metrics';

export async function metricsRoute(app: FastifyInstance) {
    app.get('/metrics', async (_req, reply) => {
        console.log("ROTA METRICS")
        reply.header('Content-Type', register.contentType);
        return register.metrics();
    });
}
