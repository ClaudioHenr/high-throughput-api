# High Throughput API

Descrição: Projeto de API para suporte de alto volume de requisições e medição e comparação de resultados após uso e não uso de otimizações já conhecidas

API projetada para suportar **alto volume de requisições simultâneas**, com foco em:
- Baixa latência
- Alta taxa de throughput
- Cache distribuído
- Resiliência
- Observabilidade

Este projeto não é um CRUD genérico. Ele simula um **cenário real de sistemas de grande escala**, como APIs de catálogo, leitura de dados financeiros, ou endpoints públicos consumidos por milhões de usuários.

Vou disponibilizar na documentação as métricas e comparações do uso de cada otimização e também quando não são utilizadas

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

## Comandos úteis do projeto

```
npm run dev

npm run build

npm run start

docker-compose up --build

docker-compose down

./scripts/k6-run.sh

./scripts/k6-run.sh test/load/k6-no-pool.js


```


## Rotas da aplicação

/items/

/items/items-no-pool

### Rotas de testes

/items/test/items

/items/test/items-no-pool


## Comparações métricas

### COM e SEM Connection Pool

Considerando a query:

`SELECT 1`

Pois o objetivo é apenas testar o diferença entre o uso ou não de Pool, ou seja, apenas um query simples resolve


Tabela de comparação
| Métrica     | Com Pool    | Sem Pool      |
| ----------- | ----------- | ------------- |
| p95 latency | **5.89 ms** | **162.12 ms** |
| Avg latency | **6.68 ms** | **84.82 ms**  |
| Req/s       | **49.5**    | **45.7**      |

- 50 VUs
- 30s de duração
- Threholds
  - http_req_failed: ['rate<0.01'],
  - http_req_duration: ['p(95)<300'],

A tabela indica que 95% das requisições levaram igual ou menos tempo de execução que 5.89ms com o Pool, enquanto sem Pool 95% levaram igual ou menos tempo que 162.12ms

**O que é uma grande diferença em termos de respostas por requisição**

