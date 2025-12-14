import { FastifyInstance } from 'fastify';
import { getItemsHandler } from './items.controller';
import { queryNoPool } from '../../config/database.no-pool';
import { db } from '../../config/database';

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
};
