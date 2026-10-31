/**
 * Resolve the server build's dependencies the way a Cloudflare Worker
 * bundler does (the build also runs in the SSR Pages Function,
 * docs/ssr-worker.md): `workerd`/`worker` export conditions instead of
 * `node`, and package.json `browser` field mappings (Node-only files such
 * as @bugsnag/cuid's os.hostname() fingerprint swapped for their browser
 * versions). React Router adds Vite's default server conditions (`node`)
 * to the ssr environment, so they are replaced here, not merged.
 *
 * It also keeps the server build code-split (Vite inlines every dynamic
 * import for target "webworker"): Cloudflare bundles the Function with
 * esbuild, which turns each split chunk into a module that is only evaluated
 * when its import() runs, so the Function's startup doesn't evaluate every
 * page of the app.
 */
import type { Plugin } from "vite"

const WORKER_CONDITIONS = ["workerd", "worker", "edge-light", "module"]

export function workerSsrResolvePlugin(): Plugin {
  return {
    name: "sc-market-worker-ssr-resolve",
    apply: "build",
    enforce: "post",
    configEnvironment(name, config) {
      if (name !== "ssr") return
      config.resolve ??= {}
      config.resolve.conditions = [...WORKER_CONDITIONS]
      config.resolve.externalConditions = [...WORKER_CONDITIONS]
      config.resolve.mainFields = ["browser", "module", "jsnext:main", "jsnext"]
      config.build ??= {}
      config.build.rollupOptions ??= {}
      const output = config.build.rollupOptions.output
      if (Array.isArray(output)) {
        for (const o of output) o.inlineDynamicImports = false
      } else {
        config.build.rollupOptions.output = {
          ...output,
          inlineDynamicImports: false,
        }
      }
    },
  }
}
