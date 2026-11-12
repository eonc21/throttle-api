# CLAUDE.md

Guidance for working in this repository. Also read [AGENTS.md](AGENTS.md) (NestJS first-party packages, validation, ESM rules, NestJS Observe).

## Project

`throttle-api` is a NestJS 12 HTTP API (Express platform), written in TypeScript, ESM only. It is currently the Nest starter skeleton: one `AppModule` with `AppController` (`GET /` returns `"Hello World!"`) and `AppService`. Rate limiting is the intended domain; check `@nestjs/throttler` before writing anything custom.

## Commands

| Task | Command |
| --- | --- |
| Install | `npm install` |
| Dev (watch) | `npm run start:dev` |
| Build | `npm run build` |
| Run built app | `npm run start:prod` |
| Unit/integration tests | `npm test` (`npm run test:watch` while iterating) |
| Single test file | `npx vitest run src/path/file.spec.ts` |
| E2E tests | `npm run test:e2e` |
| Coverage | `npm run test:cov` |
| Lint | `npm run lint` (oxlint, type-aware) |
| Format | `npm run format` (prettier: single quotes, trailing commas) |

The app listens on `process.env.PORT ?? 3000`.

## Layout

- `src/main.ts`: bootstrap (top-level `await`).
- `src/app.module.ts`: root module; register new feature modules here.
- `src/*.controller.ts`, `src/*.service.ts`: HTTP layer and business logic.
- `src/*.spec.ts`: unit and integration tests, colocated with the code (`vitest.config.ts`, include `**/*.spec.ts`).
- `test/*.e2e-spec.ts`: e2e tests using `supertest` against the full `AppModule` (`vitest.config.e2e.ts`).

## Conventions

- ESM: relative imports end in `.js` (`import { X } from './x.js'`), no `__dirname` (use `import.meta.dirname`).
- Vitest with globals enabled: use `vi.fn()` / `vi.spyOn`, never `jest.*`.
- Strict TypeScript, decorators with `emitDecoratorMetadata`. Import types used for DI as values, not `import type`.
- Organise by feature module (module + controller + service + providers + tests together), following Nest conventions: thin controllers, logic in providers, DI through constructors, DTO/schema validation at the boundary (Standard Schema pipe or `ValidationPipe`).
- `.oxlintrc.json` disables `no-explicit-any` and enables `no-floating-promises`. The lint config being lenient does not change the rule below: do not use `any`.

## Rules (always follow)

### Tests

1. **TDD, strictly.** Red, green, refactor. Write the smallest failing test first and watch it fail for the right reason. Then write the minimum implementation that passes. Then refactor with tests green. Do not write implementation ahead of a failing test.
2. **Test at the right level.** Unit for isolated logic, integration for modules wired together with Nest's `Test.createTestingModule`, e2e for HTTP behaviour through the real app. Choose per change; cover the behaviour at each level where it carries risk.
3. **No redundant tests.** Prefer adding an assertion to an existing test over a new test that repeats its setup. Do not duplicate coverage across levels without reason.
4. **Meaningful tests.** Assert on observable behaviour (inputs and outputs, HTTP responses, side effects at boundaries), not implementation details. Do not set a value and assert it back. Tests should survive a refactor that preserves behaviour.

### Code quality

1. Follow NestJS conventions (modules, providers, DI, guards/pipes/interceptors where they fit).
2. Use the right patterns for the problem; prefer first-party Nest packages over custom code or new libraries.
3. Aim for high cohesion, separation of concerns, loose coupling, modularity, appropriate abstraction, and SOLID.
4. Apply the lessons of Kent Beck (simple design, small steps, tests as design feedback), Alistair Cockburn (ports and adapters: keep the domain independent of delivery and infrastructure), Dave Farley (continuous delivery, fast reliable feedback, testability) and Uncle Bob (clean code, clean architecture, dependency rule).

### General

1. Always use explicit types. Never use `any`; use `unknown`, generics, or proper interfaces.
2. Do not write comments unless absolutely necessary. Express intent through names and structure.
3. After finishing a feature or a sizeable chunk of work, run `npm test`, `npm run test:e2e`, `npm run lint` and `npm run build`, and confirm the app works. Fix failures before reporting done.
