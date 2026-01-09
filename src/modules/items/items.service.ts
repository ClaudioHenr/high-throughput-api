import { CircuitBreaker } from '../../models/CircuitBreaker';
import { findItemById, findItems, createItem } from './items.repository';

interface GetItemsInput {
    category?: string;
    page: number;
    limit: number;
}

export interface Item {
    id: number;
    name: string;
}

export const getItems = async ({
    category,
    page,
    limit,
}: GetItemsInput) => {
    const offset = (page - 1) * limit;

    return findItems({
        category,
        limit,
        offset,
    });
};

export interface CreateItemDTO {
    name: string;
    category: string;
    price: string;
}

export const createItemService = async (item: CreateItemDTO) => {
    const itemCreate = await createItem(item);
    return itemCreate;
}

const redisCircuit = new CircuitBreaker('redis', 3, 30000)

export async function getFromRedis() {
    if (!redisCircuit.canExecute()) {
        throw new Error('CIRCUIT_OPEN')
    }

    try {
        return { ok: true }
    } catch (err) {
        redisCircuit.onFailure()
        throw err
    }
}

const dbCircuit = new CircuitBreaker('db', 3, 30000)

export async function getFromDb() {
    if (!dbCircuit.canExecute()) {
        throw new Error('CIRCUIT_OPEN')
    }

    try {
        // simula timeout
        await new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DB timeout')), 100)
        )
    } catch (err) {
        dbCircuit.onFailure()
        throw err
    }
}

