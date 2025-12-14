import { Pool } from 'pg';

export const db = new Pool({
    host: process.env.DB_HOST || 'postgres',
    port: 5432,
    user: process.env.DB_USER || 'app',
    password: process.env.DB_PASSWORD || 'app',
    database: process.env.DB_NAME || 'high_throughput',
    max: 20,              // pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
