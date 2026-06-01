ARG APP_NAME=api-gateway

# -------------------------------
# Builder
# -------------------------------
FROM node:22-alpine AS builder

ARG APP_NAME
ENV APP_NAME=${APP_NAME}
ENV NX_DAEMON=false
ENV NX_WORKSPACE_DATA_DIRECTORY=/tmp/nx-workspace-data

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn config set registry https://registry.npmjs.org/
RUN yarn install --network-timeout 600000 --frozen-lockfile

COPY . .

RUN yarn build:full


# -------------------------------
# Production
# -------------------------------
FROM node:22-alpine AS prod

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

WORKDIR /app

# copy dependencies
COPY --from=builder /app/node_modules ./node_modules

# copy build output
COPY --from=builder /app/dist ./dist

# copy configs
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/nx.json ./nx.json
COPY --from=builder /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/scripts ./scripts

RUN chmod +x ./scripts/start-services.sh

CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main.js"]
