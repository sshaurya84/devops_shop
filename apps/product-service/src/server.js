import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { databaseReady, pool } from './db.js';

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

const sampleProducts = [
  { id: 1, name: 'Cloud Runner', description: 'Lightweight everyday trainers.', price: 89.99 },
  { id: 2, name: 'Canvas Backpack', description: 'A durable bag for work and travel.', price: 64.99 },
  { id: 3, name: 'Steel Water Bottle', description: 'Insulated, reusable, and leak-proof.', price: 24.99 }
];

app.get('/health', async (_request, response) => {
  response.json({ service: 'product-service', status: 'ok', database: await databaseReady() ? 'connected' : 'not-configured' });
});

app.get('/api/products', async (_request, response, next) => {
  try {
    if (await databaseReady()) {
      const result = await pool.query('SELECT id, name, description, price FROM products ORDER BY id');
      return response.json(result.rows);
    }

    return response.json(sampleProducts);
  } catch (error) {
    return next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'The product service could not complete that request.' });
});

app.listen(port, () => {
  console.log(`Product service listening on http://localhost:${port}`);
});

