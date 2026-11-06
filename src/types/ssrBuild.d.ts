// Outputs of `npm run build` (build/ssr/), absent until a build has run.
// src/ssr imports them; these declarations type them either way.
declare module "*/build/ssr/version.json" {
  const info: { version: string }
  export default info
}
declare module "*/build/ssr/inline-css.json" {
  const inlineCss: Record<string, string>
  export default inlineCss
}
declare module "*/build/ssr/index.js" {
  import type { ServerBuild } from "react-router"
  const build: ServerBuild
  export = build
}
