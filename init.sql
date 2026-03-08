CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL
);

INSERT INTO tasks (title, description, status) VALUES
('Test Task 1', 'Description 1', 'pending'),
('Test Task 2', 'Description 2', 'done');