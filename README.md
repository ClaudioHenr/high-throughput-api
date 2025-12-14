# High Throughput API

API projetada para suportar **alto volume de requisições simultâneas**, com foco em:
- Baixa latência
- Alta taxa de throughput
- Cache distribuído
- Resiliência
- Observabilidade

Este projeto não é um CRUD genérico. Ele simula um **cenário real de sistemas de grande escala**, como APIs de catálogo, leitura de dados financeiros, ou endpoints públicos consumidos por milhões de usuários.

---

## Objetivo do Projeto

Demonstrar, na prática, como projetar e operar uma API capaz de:
- Atender milhares de requisições por segundo
- Manter latência previsível (p95 / p99)
- Proteger o sistema contra sobrecarga
- Utilizar cache de forma eficiente
- Ser observável em produção

---

## Decisões Técnicas

### Por que Node.js?

Node.js foi escolhido por ser altamente eficiente para sistemas **I/O-bound**, comuns em APIs de leitura massiva.

Características que justificam a escolha:
- Arquitetura non-blocking
- Baixo overhead por requisição
- Excelente escalabilidade horizontal
- Amplamente utilizado em empresas de grande escala

Frameworks como Java e Python são excelentes em outros contextos, mas para este tipo específico de API, Node.js entrega **melhor custo-benefício de performance**.

#### Comparação com JAVA

| Critério               | Node.js                   | Java                 |
| ---------------------- | ------------------------- | -------------------- |
| Modelo de concorrência | Event Loop (non-blocking) | Threads              |
| Overhead por request   | Muito baixo               | Maior                |
| Tempo de bootstrap     | Muito rápido              | Mais lento           |
| Consumo de memória     | Menor                     | Maior                |
| Ideal para             | APIs I/O-bound            | Processamento pesado |
| Latência p95/p99       | Excelente                 | Boa                  |

#### Comparação com Python

| Critério              | Node.js        | Python         |
| --------------------- | -------------- | -------------- |
| Concorrência          | Nativa (async) | Limitada (GIL) |
| Throughput            | Alto           | Médio          |
| Latência              | Baixa          | Maior          |
| Uso em APIs de escala | Muito comum    | Raro           |
| Melhor uso            | APIs, gateways | Workers, ML    |


---

### Por que Fastify?

Fastify é um dos frameworks HTTP mais rápidos do ecossistema Node.js.

Benefícios:
- Alta performance
- Baixo consumo de memória
- Schema validation nativa
- Suporte a plugins e extensibilidade

---

### Por que Redis?

Redis é utilizado como cache distribuído para:
- Reduzir carga no banco de dados
- Diminuir latência
- Proteger o sistema em cenários de pico

---

## Arquitetura (Visão Geral)

Client
  ↓
Fastify API
  ↓
Cache (Redis)
  ↓
PostgreSQL

Observabilidade:
- OpenTelemetry
- Prometheus
- Grafana

Resiliência:
- Rate limiting
- Circuit breaker
- Timeout


## Fluxo da Requisição

1. Request chega

2. Rate limiter valida

3. Cache é consultado

4. Se HIT → resposta imediata

5. Se MISS → banco

6. Resposta é cacheada

7. Métricas são coletadas

## Estrutura de pastas

```
high-throughput-api/
├── src/
│   ├── config/
│   │   ├── env.ts                # Variáveis de ambiente tipadas
│   │   ├── redis.ts              # Conexão Redis
│   │   ├── database.ts           # Conexão PostgreSQL
│   │   └── observability.ts      # OpenTelemetry setup
│   │
│   ├── modules/
│   │   ├── items/
│   │   │   ├── items.controller.ts   # Handlers HTTP
│   │   │   ├── items.service.ts      # Regras de leitura
│   │   │   ├── items.repository.ts   # Acesso ao banco
│   │   │   ├── items.routes.ts       # Rotas Fastify
│   │   │   ├── items.schema.ts       # Validação / OpenAPI
│   │   │   └── items.types.ts        # Tipos do domínio
│   │   │
│   │   └── health/
│   │       └── health.routes.ts      # Healthcheck
│   │
│   ├── shared/
│   │   ├── cache/
│   │   │   └── redis-cache.ts        # Estratégia de cache
│   │   │
│   │   ├── rate-limit/
│   │   │   └── rate-limit.ts
│   │   │
│   │   ├── resilience/
│   │   │   └── circuit-breaker.ts
│   │   │
│   │   ├── metrics/
│   │   │   └── metrics.ts            # Prometheus metrics
│   │   │
│   │   ├── logger/
│   │   │   └── logger.ts             # Pino logger
│   │   │
│   │   └── errors/
│   │       └── app-error.ts
│   │
│   ├── app.ts                        # Configuração do Fastify
│   └── server.ts                     # Bootstrap da aplicação
│
├── test/
│   ├── integration/
│   │   └── items.test.ts
│   │
│   └── load/
│       └── k6-script.js              # Teste de carga
│
├── docker/
│   ├── postgres/
│   │   └── init.sql
│   │
│   └── redis/
│       └── redis.conf
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── tsconfig.json
├── package.json
├── README.md
```

## Otimizações da API
Listarei e explicar resumidamente (por preguiça) cada otimização da API que pretendo usar neste projeto

- Caching
- Connection Pool
- Avoid N+1 Problem
- Pagination and Filtering
- JSON Serializers Efficient
- Payload Compression
- Asynchronous Logging
- Load Balancing
- Long-running Requests
- Rate Limiting

### Connection Pool (Pool de Conexões)

O Connection Pool é um conjunto de conexões já abertas e reutilizáveis, que são compartilhadas entre várias requisições

Em vez de:

`Request → abrir conexão → query → fechar conexão`

Uso:

`Request → pegar conexão do pool → query → devolver conexão ao pool`


```
  ┌────────────┐
  │  Requests  │
  └─────┬──────┘
        │
  ┌─────▼────────────────────┐
  │     Pool de Conexões     │
  │ ┌────┐ ┌────┐ ┌────┐     │
  │ │ C1 │ │ C2 │ │ C3 │ ... │  ← conexões abertas
  │ └────┘ └────┘ └────┘     │
  └─────┬────────────────────┘
        │
  ┌─────▼─────┐
  │ PostgreSQL│
  └───────────┘
```

**Quando o app roda o pool de conexões é criado vazio**

