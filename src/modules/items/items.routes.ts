import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createItemHandler, getItemsCachedHandler, getItemsHandler } from './items.controller';
import { queryNoPool } from '../../config/database.no-pool';
import { db } from '../../config/database';
import { queryWithTimeout } from './items.repository';

export const itemsRoutes = async (app: FastifyInstance) => {
    
    app.get('/', getItemsHandler);

    // TESTES COM E SEM POOL DE CONEXÕES

    app.get('/test/items', async () => {
        const result = await db.query('SELECT 1');
        return { ok: true, result };
    });

    app.get('/test/items-no-pool', async () => {
        const result = await queryNoPool('SELECT 1');
        return { ok: true, result };
    });

    //////////////  

    // TESTE REDIS CACHE
    app.get('/test/items-cached', getItemsCachedHandler);
    
    app.post('/test/items', createItemHandler);
    //////////////

    // Simular lentidão
    app.get('/test/slow-items', async (request: FastifyRequest, reply: FastifyReply) => {
        const delayParam = request.query as { delay?: string };
        const delay = delayParam.delay ? Number(delayParam.delay) : 3000;

        await new Promise((resolve) => setTimeout(resolve, delay));
        
        return { ok: true, message: `This was a slow response with ${delay}ms delay` };
    });

    
    app.get('/db-slow', async (_, reply) => {
        try {
            await queryWithTimeout('SELECT pg_sleep(5)', [], 2000);
            return { ok: true };
        } catch (err) {
            reply.code(504).send({ error: 'DB timeout' });
        }
    });


};
