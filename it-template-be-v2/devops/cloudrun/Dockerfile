# Base image for all stages
FROM node:24-alpine AS base

# Install OpenSSL (required by Prisma)
RUN apk add --no-cache openssl 

# Update npm to the latest version
# RUN npm install -g npm@latest # node:24 doesnt need this one

# Stage for handling dependencies
FROM base AS dependencies
WORKDIR /app

# Install build tools for native modules
RUN apk add --no-cache python3 make g++ libc6-compat

# Copy package files and install dependencies
COPY --chown=node:node package*.json ./
RUN npm i --legacy-peer-deps --verbose

# Use non-root user for security
USER node

# Stage for building the application
FROM base AS build
WORKDIR /app

# Set environment for production build
ENV NODE_ENV=production

# Copy package.json and node_modules from dependencies stage
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules

# Copy remaining application files and build the project
COPY --chown=node:node . .

# terima dari build-arg
ARG DATABASE_URL

# jadikan environment variable
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate
RUN npm run build

# Use non-root user
USER node

# Final deploy stage
FROM base AS deploy
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy necessary files from the build stage
COPY --chown=node:node --from=build /app/package*.json  ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/prisma ./prisma
COPY --chown=node:node --from=build /app/dist/ ./dist/
COPY --chown=node:node --from=build /app/templates ./templates

# Expose the default port for Cloud Run
EXPOSE 8080

# CMD [ "npm", "run", "start:migrate:prod" ]
CMD [ "npm", "run", "start:prod" ]