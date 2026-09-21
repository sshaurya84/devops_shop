FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/product-service/package.json apps/product-service/package.json
RUN npm ci --workspace=frontend

COPY apps/frontend apps/frontend
RUN npm run build --workspace=frontend

FROM nginx:1.27-alpine
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
  CMD wget --spider -q http://localhost/ || exit 1

