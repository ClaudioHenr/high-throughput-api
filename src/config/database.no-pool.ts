import { Client } from 'pg';

export const queryNoPool = async (query: string, values?: any[]) => {
    const client = new Client({
        host: process.env.DB_HOST || 'postgres',
        user: process.env.DB_USER || 'app',
        password: process.env.DB_PASSWORD || 'app',
        database: process.env.DB_NAME || 'high_throughput',
    });

    await client.connect();

    try {
        return await client.query(query, values);
    } finally {
        await client.end();
    }
};