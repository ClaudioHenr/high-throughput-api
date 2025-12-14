import { FastifyRequest, FastifyReply } from 'fastify';
import { getItems } from './items.service';

interface ItemsQuery {
    category?: string;
    page?: number;
    limit?: number;
}

export const getItemsHandler = async (
    request: FastifyRequest<{ Querystring: ItemsQuery }>,
    reply: FastifyReply
) => {
    const {
        category,
        page = 1,
        limit = 20,
    } = request.query;

    const items = await getItems({
        category,
        page,
        limit,
    });

    return reply.send(items);
};
