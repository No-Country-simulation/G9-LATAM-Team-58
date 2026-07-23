CREATE TABLE contents (
    id          VARCHAR(100) PRIMARY KEY,
    title       VARCHAR(500) NOT NULL,
    body        CLOB NOT NULL,
    category    VARCHAR(50),
    probability FLOAT,
    keywords    CLOB,
    explanation CLOB,
    embedding   VECTOR(384, FLOAT32),
    cluster_id  INT,
    x           FLOAT,
    y           FLOAT,
    source      VARCHAR(100),
    url         VARCHAR(1000),
    language    VARCHAR(10),
    added_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contents_category ON contents(category);
