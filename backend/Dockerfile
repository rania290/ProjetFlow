FROM node:20-slim AS builder

WORKDIR /app

# Copy package config
COPY package*.json ./
RUN npm install --no-audit --no-fund --timeout=300000

# Copy backend directory
COPY . ./

# ARGs to specify which project to build
ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

# Build using nest build directly
RUN npx nest build ${SERVICE_NAME}

FROM node:20-slim

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

WORKDIR /app

# Copy package files and node_modules from builder
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --timeout=300000

# Copy dist folder
COPY --from=builder /app/dist ./dist

# Run the service
CMD node dist/${SERVICE_NAME}/src/main.js