import { FastifyRequest, FastifyReply } from 'fastify';
import { createItemService, getItems } from './items.service';
import { redis } from '../../config/redis';

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

const CACHE_KEY = 'items:all';
const CACHE_TTL_SECONDS = 30;

export const getItemsCachedHandler = async (
    request: FastifyRequest<{ Querystring: ItemsQuery }>,
    reply: FastifyReply
) => {
    const cached = await redis.get(CACHE_KEY);
    
    if (cached) {
        console.log('Cache hit for items');
        return reply.send({
            source: 'cache',
            item: JSON.parse(cached),
        });
    }

    const item = await getItems({ 
        page: 1, 
        limit: 100 
    });

    await redis.setex(
        CACHE_KEY,
        CACHE_TTL_SECONDS,
        JSON.stringify(item)
    );

    return reply.send({
        source: 'database',
        data: item,
    });
};

interface CreateItemRequest {
    Body: {
        name: string;
        category: string;
        price: string;
    };
}

export const createItemHandler = async (
    request: FastifyRequest<CreateItemRequest>,
    reply: FastifyReply
) => {
    const body = request.body;

    const item = await createItemService(body);

    // 🔥 Invalidação de cache
    await redis.del(CACHE_KEY);

    return reply.code(201).send({
        message: 'Item created',
        item,
    });
};
