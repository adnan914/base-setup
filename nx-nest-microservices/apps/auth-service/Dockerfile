FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN corepack enable && yarn install

FROM deps AS build
COPY . .
RUN yarn prisma:generate && yarn nx build auth-service

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/auth-service ./dist/apps/auth-service
COPY --from=build /app/proto ./proto
COPY --from=build /app/libs/database/prisma ./libs/database/prisma
EXPOSE 3001 50051
CMD ["node", "dist/apps/auth-service/main.js"]
