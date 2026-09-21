CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
);

INSERT INTO products (name, description, price)
VALUES
  ('Cloud Runner', 'Lightweight everyday trainers.', 89.99),
  ('Canvas Backpack', 'A durable bag for work and travel.', 64.99),
  ('Steel Water Bottle', 'Insulated, reusable, and leak-proof.', 24.99)
ON CONFLICT DO NOTHING;

