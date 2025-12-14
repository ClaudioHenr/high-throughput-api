import Fastify from 'fastify';
import { healthRoutes } from './modules/health/health.routes';
import { logger } from './shared/logger/logger';
import { itemsRoutes } from './modules/items/items.routes';

export const buildApp = async () => {
  const app = Fastify({
    logger,
  });

  app.register(healthRoutes, { prefix: '/health' });
  app.register(itemsRoutes, { prefix: '/items' });

  return app;
};
