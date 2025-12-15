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
