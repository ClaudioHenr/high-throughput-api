import { FastifyRequest, FastifyReply } from 'fastify';
import { createItemService, getItems } from './items.service';
import { redis } from '../../config/redis';
import { cacheHitsTotal, cacheMissesTotal } from '../../infra/metrics';

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
        limit = 100,
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
const CACHE_ENABLED = process.env.CACHE_ENABLED === 'true';

export const getItemsCachedHandler = async (
    request: FastifyRequest<{ Querystring: ItemsQuery }>,
    reply: FastifyReply
) => {
    if (CACHE_ENABLED) {
        const cached = await redis.get(CACHE_KEY)
        console.log('CACHE KEY is ', CACHE_KEY);
        if (cached) {
            console.log('Cache hit for items');

            console.log('Counting cache hit metric for redis');
            cacheHitsTotal.inc({
                cache: 'redis',
            });

            return reply.send({
                source: 'cache',
                item: JSON.parse(cached),
            });
        }
    };

    console.log('Cache miss for items');
    cacheMissesTotal.inc({
        cache: 'redis',
    });
    
    const item = await getItems({ 
        page: 1, 
        limit: 100 
    });

    if (CACHE_ENABLED) {
        await redis.setex(
            CACHE_KEY,
            CACHE_TTL_SECONDS,
            JSON.stringify(item)
        );
    }

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
