CREATE TABLE items (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_created_at ON items(created_at);

-- Popular com dados simulados
INSERT INTO items (name, category, price)
SELECT
    'Item ' || g,
    CASE
        WHEN g % 3 = 0 THEN 'electronics'
        WHEN g % 3 = 1 THEN 'books'
        ELSE 'clothing'
    END,
    (random() * 100)::numeric(10,2)
FROM generate_series(1, 500000) g;
