# Routes (React Router framework mode)

Since the Phase 2 migration (docs/ssr-migration-design.md) the route table is
`src/routes.ts`, not `src/App.tsx`.

## Adding a route

1. A page: add its chunk to `src/app/pages.ts`
   (`MyPage: pageEntry(() => import("../pages/x/MyPage"), (m) => m.MyPage)`),
   then a route module `src/routes/pages/MyPage.tsx`:
   ```tsx
   import { definePage } from "../definePage"
   const page = definePage("MyPage")
   export const clientLoader = page.clientLoader
   export const shouldRevalidate = page.shouldRevalidate
   export default page.Component
   ```
   Add `export const ErrorBoundary = shellComponent("RouteErrorFallback")`
   (from `../shell`) for an in-page error boundary.
2. A redirect or eager element: a module in `src/routes/elements/`. A guard or
   layout: `src/routes/layouts/`. Components they render come from the app
   shell by name (`shellComponent("LoggedInRoute")`); add new ones to
   `src/app/shell.ts`.
3. An entry in `src/routes.ts`: `{ id, path, file }`. The id is the file
   without `.tsx`, plus `~2`, `~3`… when several routes share a module.
4. Route modules never `import()` anything (lint rule + guard test): page
   chunks load through `definePage`, which retries and rate-limits reloads.

`src/router/routeObjects.tsx` turns the same table into RouteObjects for the
route tests (`src/router/__tests__`).

## Porting a branch that still edits App.tsx

`convert-app-routes.ts` regenerates everything above from an old-style
App.tsx (see its header). Use it only to carry such a branch over; review the
diff, since it overwrites the generated route modules.
