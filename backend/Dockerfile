FROM node:20-slim AS builder

WORKDIR /app

# Copy package config and root node_modules if they exist (monorepo root)
COPY package*.json ./
RUN npm install --no-audit --no-fund --timeout=300000

# Copy the entire mono-repo
COPY . .

# ARGs to specify which project to build (api-gateway, auth-service, etc.)
ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

RUN npm run build ${SERVICE_NAME}

FROM node:20-slim

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --timeout=300000

# Copy distribution folder and built node_modules
COPY --from=builder /app/dist ./dist

# Point d'entrée pour les projets NestJS (monorepo structure)
CMD node dist/${SERVICE_NAME}/src/main.js
