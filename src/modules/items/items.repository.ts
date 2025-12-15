import { db } from '../../config/database';

export interface FindItemsParams {
    category?: string;
    limit: number;
    offset: number;
}

export const findItems = async ({
    category,
    limit,
    offset,
}: FindItemsParams) => {
    const values: any[] = [];
    let where = '';

    if (category) {
        values.push(category);
        where = `WHERE category = $${values.length}`;
    }

    values.push(limit, offset);

    const query = `
        SELECT id, name, category, price
        FROM items
        ${where}
        ORDER BY created_at DESC
        LIMIT $${values.length - 1}
        OFFSET $${values.length}
    `;

    const { rows } = await db.query(query, values);
    return rows;
};

export const findItemById = async (id: string) => {
    const query = `
        SELECT id, name, category, price
        FROM items
        WHERE id = $1
    `;

    const { rows } = await db.query(query, [id]);
    return rows[0];
};


export const createItem = async (item: any) => {
    const { name, category, price } = item;

    const { rows } = await db.query(
        'INSERT INTO items (name, category, price) VALUES ($1, $2, $3) RETURNING id, name',
        [name, category, price]
    );
    
    return rows[0];
}