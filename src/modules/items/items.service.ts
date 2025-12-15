import { findItemById, findItems } from './items.repository';

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
