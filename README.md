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

./scripts/k6-run.sh test/load/k6-cache-vs-db.js



```


## Rotas da aplicação

/items/

/items/items-no-pool

### Rotas de testes

/items/test/items

/items/test/items-no-pool

/items/test/items-cached

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

Agora com:

- 100 VUs
- Adicão de métrica p99

| Métrica | Com pool | Sem pool    |
| ------- | -------- | ----------- |
| avg     | ~6 ms    | **111 ms**  |
| p95     | ~8 ms    | **206 ms**  |
| p99     | ~112 ms  | **554 ms**  |
| max     | ~155 ms  | **~570 ms** |

Principais métricas de interesse:

- http_req_duration: Tempo que cada requisição leva para ser completada. O objetivo aqui é manter esse valor baixo, especialmente no p95 (95% das requisições).
- http_reqs: Número de requisições por segundo. Indicativo de throughput.
- http_req_failed: Percentual de falhas. Idealmente, 0%.
- iteration_duration: Tempo médio de execução de uma iteração. Quanto menor, melhor.


### COM e SEM Cache (Redis)

Vou testar 3 cenários

| Cenário | Fonte dos dados        |
| ------- | ---------------------- |
| A       | PostgreSQL (sem cache) |
| B       | Redis (cache HIT)      |
| C       | Cache MISS controlado  |

A comparação será entre endpoint direto no banco com pool e endpoint usando cache redis

| Endpoint                   | Descrição           |
| -------------------------- | ------------------- |
| `/items/test/items`        | Banco direto (pool) |
| `/items/test/items-cached` | Cache Redis         |


🔹 Teste 1 — 50 VUs
| Métrica            | Sem cache (DB) | Com cache (Redis) |
| ------------------ | -------------- | ----------------- |
| Requisições totais | 1500           | 1500              |
| Req/s              | ~49.5          | ~49.5             |
| Avg latency        | 7.97ms         | 7.99ms            |
| p90                | 5.10ms         | 4.17ms            |
| **p95**            | **6.71ms**     | **7.00ms**        |
| **p99**            | **171.56ms**   | **188.03ms**      |
| Max                | 192ms          | 205ms             |
| Erros              | 0%             | 0%                |
| Threshold p95      | ✅              | ✅                 |
| Threshold p99      | ✅              | ✅                 |

🔹 Teste 2 — 200 VUs
| Métrica            | Sem cache (DB) | Com cache (Redis) |
| ------------------ | -------------- | ----------------- |
| Requisições totais | 1500           | 1500              |
| Req/s              | ~49.5          | ~49.5             |
| Avg latency        | 7.97ms         | 7.99ms            |
| p90                | 5.10ms         | 4.17ms            |
| **p95**            | **6.71ms**     | **7.00ms**        |
| **p99**            | **171.56ms**   | **188.03ms**      |
| Max                | 192ms          | 205ms             |
| Erros              | 0%             | 0%                |
| Threshold p95      | ✅              | ✅                 |
| Threshold p99      | ✅              | ✅                 |


🔹 Teste 3 — 1000 VUs
| Métrica            | Sem cache (DB) | Com cache (Redis) |
| ------------------ | -------------- | ----------------- |
| Requisições totais | ~29.2k         | ~29.7k            |
| Req/s              | ~942           | ~961              |
| Avg latency        | **37.63ms**    | **22.45ms** ⬇️    |
| p90                | 7.36ms         | 5.23ms            |
| **p95**            | **12.1ms** ❌   | **8.41ms** ✅      |
| **p99**            | **1.5s** ❌     | **617ms** ❌       |
| Max                | 2.32s          | 1.41s             |
| Erros              | 0%             | 0%                |
| Threshold p95      | ❌              | ✅                 |
| Threshold p99      | ❌              | ❌                 |


🔹 Comparação Geral

| VUs  | Cache | Avg         | p95        | p99      | Max   | Req/s | Threshold |
| ---- | ----- | ----------- | ---------- | -------- | ----- | ----- | --------- |
| 50   | ❌     | 7.97ms      | 6.71ms     | 171ms    | 192ms | ~49   | ✅         |
| 50   | ✅     | 7.99ms      | 7.00ms     | 188ms    | 205ms | ~49   | ✅         |
| 200  | ❌     | 9.23ms      | 7.66ms     | 216ms    | 298ms | ~197  | ✅         |
| 200  | ✅     | 10.43ms     | **4.75ms** | 289ms    | 349ms | ~197  | ✅         |
| 1000 | ❌     | **37.63ms** | **12.1ms** | **1.5s** | 2.32s | ~942  | ❌         |
| 1000 | ✅     | **22.45ms** | **8.41ms** | 617ms    | 1.41s | ~961  | ❌         |

#### Cache também pode virar gargalo

Redis:
- single-thread
- responde rápido, mas fila sob carga extrema
- precisa:
  - sharding
  - replicas
  - pipeline

ou local cache (LRU in-memory)


### Rate Limiting — Testes de Carga

Código de teste no terminal
```
for i in {1..120}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/items
done
```

#### Testes

| Teste | Objetivo |
|----|--------|
| burst | Validar bloqueio sob explosão |
| cooldown | Verificar recuperação após janela |
| isolation | Garantir isolamento entre clientes |
| performance-impact | Medir impacto em latência |

#### Execução

```bash
./scripts/k6-run.sh ./test/load/rate-limiting/burst.test.js
./scripts/k6-run.sh ./test/load/rate-limiting/cooldown.test.js
./scripts/k6-run.sh ./test/load/rate-limiting/isolation.test.js
./scripts/k6-run.sh ./test/load/rate-limiting/performance-impact.test.js
```

Após implementado testado o burst usando k6 para validar o comportamento do rate limiting sob rajada rápida de requisições de um único cliente. O sistema respondeu corretamente com HTTP 200 e 429, sem erros 5xx, mantendo baixa latência e estabilidade.

Teste de Burst

| Métrica          | Resultado       |
| ---------------- | --------------- |
| VUs              | 1               |
| Iterações        | 50              |
| Duração total    | ~0.1s           |
| Status esperados | 200             |
| p95 latência     | 2.55ms          |
| Erros            | 0%              |
| Throughput       | ~416 req/s      |
| Comportamento    | ✅ Aceitou burst |

- O rate limiter não bloqueia rajadas curtas
- Latência mínima
- Sem impacto perceptível

Teste de Cooldown

| Métrica                  | Resultado |
| ------------------------ | --------- |
| VUs                      | 1         |
| Iterações                | 15        |
| Intervalo entre requests | ~5s       |
| Status esperados         | 200       |
| p95 latência             | 3.75ms    |
| Erros                    | 0%        |
| Tempo de recuperação     | ~1 janela |


- O rate limiter libera corretamente após o tempo
- Não ocorre bloqueio permanente
- Estado limpo entre janelas

Teste de Isolamento entre usuários

| Métrica               | Resultado |
| --------------------- | --------- |
| VUs                   | 20        |
| Iterações             | 100       |
| p95 latência          | 102.89ms  |
| Erros                 | 0%        |
| Status válidos        | 200 / 429 |
| Interferência cruzada | ❌ Nenhuma |

- Rate limit aplicado por chave (IP/cliente)

Teste de Performance

| Métrica                      | Resultado    |
| ---------------------------- | ------------ |
| VUs                          | 100          |
| Duração                      | 30s          |
| Total de requests            | 132.753      |
| Throughput                   | ~4.422 req/s |
| p95 latência                 | 33.33ms      |
| p99 latência                 | ~176ms       |
| Requisições bloqueadas (429) | ~99.9%       |
| Colapso do sistema           | ❌ Não        |

- O rate limiter rejeita rápido
- Sistema permanece estável
- Latência não explode
- Banco/cache protegidos

Resumo

| Cenário           | Protege o sistema | Impacto de latência | Comportamento esperado |
| ----------------- | ----------------- | ------------------- | ---------------------- |
| Burst curto       | ✅                 | Nenhum              | Aceita                 |
| Cooldown          | ✅                 | Nenhum              | Recupera               |
| Isolamento        | ✅                 | Baixo               | Usuários isolados      |
| Saturação extrema | ✅                 | Controlado          | Bloqueia massivamente  |

