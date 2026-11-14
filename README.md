# throttle-api

A small NestJS API with per-client rate limiting. Two endpoints, `/foo` and `/bar`, both require a client id in the `Authorization` header.

I documented my technical decisions in DECISIONS.md.

## Requirements

- Node.js 24 or newer
- Docker (only needed for the Redis store and for the e2e tests)

## Run

```bash
npm install
npm run start:dev
```

The app listens on `http://localhost:3000` (set `PORT` to change it). By default, request counters are kept in memory.

### Choose where the counters live

| Store    | Counters are kept in                  | Use it when                                                         |
| -------- | ------------------------------------- | ------------------------------------------------------------------- |
| `memory` | the app's own memory                  | you run a single instance, locally or in tests                      |
| `redis`  | Redis, shared and surviving a restart | you run more than one instance, or want limits to survive a restart |

The in-memory counters belong to one process. They are lost when the app restarts, and **if you run several instances each one counts on its own, so a client's real limit becomes the limit multiplied by the number of instances**. Use the Redis store for anything with more than one instance.

### Use Redis for the counters

```bash
docker compose up -d redis
RATE_LIMIT_STORE=redis npm run start:dev
```

| Variable           | Values                   | Default                  |
| ------------------ | ------------------------ | ------------------------ |
| `RATE_LIMIT_STORE` | `memory` or `redis`      | `memory`                 |
| `REDIS_URL`        | any Redis connection URL | `redis://localhost:6379` |

You can also put these in a `.env` file in the project root.

### OR, YOU COULD... run everything in Docker

(you need Docker though)

```bash
docker compose up --build
```

I could say that "it works on my machine" but that wouldn't be enough, so hopefully putting this in Docker makes it work on your machine, too.
This starts Redis and the app together in Docker, and the app uses the Redis store. It listens on `http://localhost:3000` (set `APP_PORT` to use another port on your machine, for example `APP_PORT=3001 docker compose up --build`). Stop it with `docker compose down`.

The container does not read your `.env`: compose sets `RATE_LIMIT_STORE=redis` and `REDIS_URL=redis://redis:6379` for it.

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
| `503`                                    | the Redis store is not responding           |

The two endpoints use different algorithms:

- `/foo` uses a fixed window: each client gets its limit per clock-aligned window (for example 5 requests between `10:15:00` and `10:15:59`), and the count resets at the start of the next window.
- `/bar` uses a sliding window counter: it counts each client's requests per window like `/foo`, but also adds the previous window's count, weighted by how much of that window still overlaps the last 60 seconds. This removes the burst that a fixed window allows right at a window boundary.

## Test

```bash
npm test                  # unit tests
docker compose up -d redis  # the e2e tests need Redis
npm run test:e2e          # e2e tests
npm run test:all:watch    # unit and e2e tests together, in watch mode
```

## Other commands

```bash
npm run build             # compile to dist/
npm run start:prod        # run the compiled app
npm run lint
```
