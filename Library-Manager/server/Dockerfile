FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache --virtual .gyp python3 make g++ || true

COPY package.json package-lock.json* ./
RUN npm install --production --silent || true

COPY . .

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001
CMD ["node", "index.js"]