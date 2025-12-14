import { FastifyInstance } from 'fastify';
import { getItemsHandler } from './items.controller';

export const itemsRoutes = async (app: FastifyInstance) => {
    app.get('/', getItemsHandler);
};
