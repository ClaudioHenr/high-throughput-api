import Fastify from 'fastify';
import { healthRoutes } from './modules/health/health.routes';
import { logger } from './shared/logger/logger';

export const buildApp = async () => {
  const app = Fastify({
    logger,
  });

  app.register(healthRoutes, { prefix: '/health' });

  return app;
};
