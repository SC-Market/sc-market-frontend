# Generated RTK Query API

These files are **generated** from `spec/sc-market.openapi.json`. Do not edit them by hand.

**The generated API should be preferred for new code.** Use the hooks and types from `src/store/api` (and `serviceApi`) instead of hand-written API slices when an endpoint exists in the OpenAPI spec. See this README for usage and regeneration.

## Regenerating

From `sc-market-frontend`:

```bash
npm run codegen:api
```

The script runs Prettier on `src/store/api/` after generation (see `scripts/codegen-api.ts`).

## Structure

- **One file per API domain** (e.g. `starmap.ts`, `orders.ts`) based on path prefix in `openapi-codegen.config.ts`.
- **`core.ts`** holds endpoints whose path doesn’t match any domain (catch-all).
- **`index.ts`** imports all slices so endpoints are injected into `serviceApi` when the store is set up.

## Using the API

- **Hooks and `serviceApi`**: Use `serviceApi` from `@/store/service` (or the store). All generated hooks are on that API, e.g. `serviceApi.useGetStarmapRouteQuery`.
- **Types**: Import response/arg types from the slice that defines them, e.g. `import type { GetStarmapRouteApiArg } from '@/store/api/starmap'`.

## Config

- **`openapi-codegen.config.ts`** (project root): path prefixes → output files, hooks, tags.
- To add a new domain: add a `{ pathPrefix, fileName }` entry to `API_DOMAINS` and run `npm run codegen:api`.
