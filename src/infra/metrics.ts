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

export const register = client.register;
