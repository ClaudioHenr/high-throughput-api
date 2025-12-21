import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { healthRoutes } from './modules/health/health.routes';
import { logger } from './shared/logger/logger';
import { itemsRoutes } from './modules/items/items.routes';

export const buildApp = async () => {
  const app = Fastify({
    logger,
  });

  await app.register(rateLimit, {
    max: 100, // máximo de requisições
    timeWindow: '1 minute', // janela de tempo
    allowList: ['127.0.0.1'], // opcional
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
  });

  app.register(healthRoutes, { prefix: '/health' });
  app.register(itemsRoutes, { prefix: '/items' });

  return app;
};
