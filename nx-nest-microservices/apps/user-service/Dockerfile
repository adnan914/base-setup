FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN corepack enable && yarn install

FROM deps AS build
COPY . .
RUN yarn prisma:generate && yarn nx build user-service

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/user-service ./dist/apps/user-service
COPY --from=build /app/proto ./proto
COPY --from=build /app/libs/database/prisma ./libs/database/prisma
EXPOSE 3002 50052
CMD ["node", "dist/apps/user-service/main.js"]
