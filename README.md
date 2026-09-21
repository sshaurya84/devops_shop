# DevOps Shop

This repository is the application used in the end-to-end DevOps course.

## Lesson 1: run the application locally

1. Install dependencies from the repository root:

   ```powershell
   npm install
   ```

2. In one terminal, start the Node.js product service:

   ```powershell
   npm run dev:api
   ```

3. In a second terminal, start the React development server:

   ```powershell
   npm run dev:web
   ```

4. Open the URL printed by Vite (normally `http://localhost:5173`). Verify `http://localhost:3001/health` in a browser too.

The API returns three sample products until PostgreSQL is configured. Its database connection is already controlled by `DATABASE_URL`; `apps/product-service/db/init.sql` is the schema and seed data that later runs automatically in Docker Compose.

## Lesson 2: run the complete stack with Docker Compose

Ensure Docker Desktop is running, then build images and start every service:

```powershell
docker compose up --build
```

Open `http://localhost:8080`. The browser reaches only the frontend container;
Nginx forwards `/api` requests across Docker's private network to the product
service. PostgreSQL initializes its schema and seed data from
`apps/product-service/db/init.sql` on its first startup.

Useful commands:

```powershell
docker compose ps                 # inspect service health and published ports
docker compose logs -f            # follow logs from all services
docker compose down               # stop containers; preserve database data
docker compose down --volumes     # stop containers and intentionally erase local database data
```

## Architecture today

```text
Development: Browser → Vite (5173) → Product API (3001)
Compose:     Browser → Nginx frontend (8080) → Product API → PostgreSQL
```
