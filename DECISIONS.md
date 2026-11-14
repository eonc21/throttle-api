General Decisions

- I decided to go with TypeScript. NestJS is a good choice because of its layered architecture, since I will need to extend the code and architect it for long term, then this offers a good structure. Also widely maintained and used, big community.
- I added a Claude.md file to make sure Claude follows coding and testing conventions I impose on my own self, if I use it.
- I added a GitHub pipeline to make sure the code actually runs when pushed. Testing stages are separate for future-proofing, mostly parallelisation reasons, otherwise pipeline might take really long if everything is sequential.

Authorization

- I am using a Guard, which is a component created specifically for authorization in NestJS

Clients and rate limits

- I decided to keep the clients and their limits hardcoded in one place (client-registry.ts). The assignment only needs 2 clients with different limits, and this keeps the app easy to run, no extra setup.
- I tried moving them to a .env file, but it needs more code and one more setup step for little value here, so I dropped it. They are still validated when the app starts, so a wrong value fails fast.
- In production I would not keep them in the code, since the client id is the credential. This would be configured inside a secrets manager normally.

Rate limiting

- I did not use @nestjs/throttler.
- /foo uses a fixed window and /bar a sliding window counter, so they use different algorithms. I first chose token bucket for /bar but switched, because a counter based algorithm lets both use the same store.
- The rate limit guard runs after the auth guard, so a wrong client gets 401 and never uses any limit.
- Counter keys include the endpoint and the algorithm, so endpoints never share counters.
- The assignment shows { succes: true }, I used success since I think it is a typo.

Storage

- Counters can live in memory or in Redis, chosen with the RATE_LIMIT_STORE variable. Both follow the same interface, so the algorithms don't care which one is used.
- Redis runs locally with docker compose, with persistence on. I used ioredis and a small Lua script, so the increment and the expiry happen together.
- If Redis is down, requests get a 503 and are not let through. I prefer rejecting to letting clients go over their limit.
- The in memory store only works for one instance. This is written in the readme.

Testing

- The same set of tests runs against both stores, so they behave the same.
- Rate limit tests use a fake clock, so they are fast and do not depend on real time.
- E2E tests use the whole app module, so a missing registration is caught.

Docker

- I containerized the app so it runs the same on any OS that has Docker
