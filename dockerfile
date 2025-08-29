# Base image for Node
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Dev stage (hot reload handled by docker-compose)
FROM base AS dev
RUN npm install

# Build stage for production
FROM base AS build-stage
RUN npm install
COPY . .
RUN npm run build --prod

# Production Nginx image
FROM nginx:alpine AS production-stage
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage /app/dist/transport-facility /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
