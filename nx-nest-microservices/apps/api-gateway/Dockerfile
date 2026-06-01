FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN corepack enable && yarn install

FROM deps AS build
COPY . .
RUN yarn prisma:generate && yarn nx build api-gateway

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/api-gateway ./dist/apps/api-gateway
COPY --from=build /app/proto ./proto
EXPOSE 3000
CMD ["node", "dist/apps/api-gateway/main.js"]
