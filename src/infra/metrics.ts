import client from 'prom-client';

// Coleta métricas padrão do Node.js (CPU, memória, event loop etc)
client.collectDefaultMetrics({
    prefix: 'api_',
});

// Histograma de latência HTTP
export const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duração das requisições HTTP',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2],
});

// Contador de requisições
export const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total de requisições HTTP',
    labelNames: ['method', 'route', 'status_code'],
});

export const cacheHitsTotal = new client.Counter({
    name: 'cache_hits_total',
    help: 'Total de cache hits',
    labelNames: ['cache'],
});

export const cacheMissesTotal = new client.Counter({
    name: 'cache_misses_total',
    help: 'Total de cache misses',
    labelNames: ['cache'],
});

export const rateLimitedRequestsTotal = new client.Counter({
    name: 'rate_limited_requests_total',
    help: 'Total de requisições bloqueadas por rate limiting',
    labelNames: ['route'],
});

export const register = client.register;
