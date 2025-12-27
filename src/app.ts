import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { healthRoutes } from './modules/health/health.routes';
import { logger } from './shared/logger/logger';
import { itemsRoutes } from './modules/items/items.routes';
import { metricsPlugin } from './plugins/metrics.plugin';
import { metricsRoute } from './routes/metrics.routes';

export const buildApp = async () => {
  const app = Fastify({
    logger,
    requestTimeout: 2000
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

  // Metricas
  app.register(metricsPlugin);

  app.register(healthRoutes, { prefix: '/health' });
  app.register(itemsRoutes, { prefix: '/items' });

  app.register(metricsRoute);

  console.log(app.printRoutes());

  return app;
};
