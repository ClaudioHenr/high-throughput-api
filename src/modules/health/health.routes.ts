import { FastifyInstance } from 'fastify';

export const healthRoutes = async (app: FastifyInstance) => {
    app.get('/', async () => {
        return {
            status: 'UP',
            timestamp: new Date().toISOString(),
        };
    });
};
