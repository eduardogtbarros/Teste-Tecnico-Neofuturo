CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    category VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT suppliers_email_format
        CHECK (
            email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
        )
);

CREATE TABLE purchase_requests (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    supplier_id INTEGER,
    requester_name VARCHAR(150) NOT NULL,
    justification TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT purchase_requests_quantity_positive
        CHECK (quantity > 0),

    CONSTRAINT purchase_requests_supplier_fk
        FOREIGN KEY (supplier_id)
        REFERENCES suppliers(id)
);

CREATE TABLE ai_reviews (
    id SERIAL PRIMARY KEY,
    purchase_request_id INTEGER NOT NULL,
    priority VARCHAR(50) NOT NULL,
    summary_text TEXT,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ai_reviews_purchase_request_fk
        FOREIGN KEY (purchase_request_id)
        REFERENCES purchase_requests(id)
);

CREATE INDEX idx_purchase_requests_supplier_id
    ON purchase_requests(supplier_id);

CREATE INDEX idx_ai_reviews_purchase_request_id
    ON ai_reviews(purchase_request_id);