import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import client from '@prometheus-io/client';
import { databaseReady, pool } from './db.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const metrics = new client.Registry();

client.collectDefaultMetrics({
  prefix: 'product_service_',
  register: metrics
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'product_service_http_request_duration_seconds',
  help: 'Duration of HTTP requests handled by product-service in seconds.',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [metrics]
});

app.use(cors());
app.use(express.json());
app.use((request, response, next) => {
  const endTimer = httpRequestDurationSeconds.startTimer({ method: request.method });

  response.on('finish', () => {
    // Route templates keep Prometheus label cardinality bounded. Never use a
    // raw URL path here because IDs and query strings would create a time
    // series for every request.
    endTimer({
      route: request.route?.path || 'unmatched',
      status_code: String(response.statusCode)
    });
  });

  next();
});

const sampleProducts = [
  { id: 1, name: 'Cloud Runner', description: 'Lightweight everyday trainers.', price: 89.99 },
  { id: 2, name: 'Canvas Backpack', description: 'A durable bag for work and travel.', price: 64.99 },
  { id: 3, name: 'Steel Water Bottle', description: 'Insulated, reusable, and leak-proof.', price: 24.99 }
];

app.get('/health', async (_request, response) => {
  response.json({ service: 'product-service', status: 'ok', database: await databaseReady() ? 'connected' : 'not-configured' });
});

// This endpoint is only exposed through the ClusterIP service. It is not
// routed by the public ingress; Prometheus discovers and scrapes it in-cluster.
app.get('/metrics', async (_request, response) => {
  response.set('Content-Type', metrics.contentType);
  response.end(await metrics.metrics());
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
