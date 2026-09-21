FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

# Keep the workspace manifests separate so dependency installation is cached.
COPY package.json package-lock.json ./
COPY apps/product-service/package.json apps/product-service/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci --omit=dev --workspace=product-service

COPY apps/product-service/src apps/product-service/src

WORKDIR /app/apps/product-service
EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD node -e "fetch('http://localhost:3001/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "start"]

