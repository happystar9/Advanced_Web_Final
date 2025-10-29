FROM node:18-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++ || true

COPY package.json package-lock.json pnpm-lock.yaml ./

COPY . .

RUN npm install --silent
RUN npm run build

FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
