# throttle-api

A small NestJS API with per-client rate limiting. Two endpoints, `/foo` and `/bar`, both require a client id in the `Authorization` header.

## Requirements

- Node.js 24 or newer
- Docker (only needed for the Redis store and for the e2e tests)

## Run

```bash
npm install
npm run start:dev
```

The app listens on `http://localhost:3000` (set `PORT` to change it). By default, request counters are kept in memory.

### Use Redis for the counters

```bash
docker compose up -d
RATE_LIMIT_STORE=redis npm run start:dev
```

| Variable           | Values                   | Default                  |
| ------------------ | ------------------------ | ------------------------ |
| `RATE_LIMIT_STORE` | `memory` or `redis`      | `memory`                 |
| `REDIS_URL`        | any Redis connection URL | `redis://localhost:6379` |

You can also put these in a `.env` file in the project root.

## Try it

Send the client id as a bearer token:

```bash
curl -H "Authorization: Bearer authorized_client" http://localhost:3000/foo
```

| Client              | Limit                  |
| ------------------- | ---------------------- |
| `authorized_client` | 5 requests per minute  |
| `premium_client`    | 20 requests per minute |

| Response                                 | When                                        |
| ---------------------------------------- | ------------------------------------------- |
| `200 { "success": true }`                | the client is within its limit              |
| `401`                                    | the header is missing or the client unknown |
| `429 { "error": "rate limit exceeded" }` | the client is over its limit                |

Clients and limits are defined in `src/auth/client-registry.ts`.

`/foo` uses a fixed window counter. Rate limiting for `/bar` is not implemented yet: it only checks the client id.

## Test

```bash
npm test                  # unit tests
docker compose up -d      # the e2e tests need Redis
npm run test:e2e          # e2e tests
npm run test:all:watch    # unit and e2e tests together, in watch mode
```

## Other commands

```bash
npm run build             # compile to dist/
npm run start:prod        # run the compiled app
npm run lint
```
