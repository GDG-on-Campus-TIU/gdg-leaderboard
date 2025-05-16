FROM oven/bun:1 AS base

WORKDIR /usr/app

COPY package.json bun.lock ./

RUN apt-get update -y && apt-get install -y openssl

RUN bun install --frozen-lockfile

COPY . ./

RUN bunx prisma@latest generate

ENV NODE_ENV=production
ENV PORT=${PORT}
ENV API_VER="/api/v1"
ENV GCP_PROJECT_ID=${GCP_PROJECT_ID}
ENV APP_PASSWORD=${APP_PASSWORD}
ENV JWT_SECRET=${JWT_SECRET}
ENV DATABASE_URL=${DATABASE_URL}
ENV ROOT_EMAIL=${ROOT_EMAIL}
ENV ROOT_PASSWORD=${ROOT_PASSWORD}

VOLUME [ "/usr/app/" ]

EXPOSE 8998/tcp
ENTRYPOINT [ "bun", "run", "start" ]
