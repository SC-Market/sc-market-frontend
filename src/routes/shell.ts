/**
 * The route modules' access to the app shell (src/app/shell.ts).
 *
 * Route modules are bundled into one small "routes" chunk (vite.config.ts)
 * that every page load needs. Rollup moves every module a manual chunk
 * statically imports into that chunk, before tree-shaking can drop unused
 * re-exports, so a route module importing a guard or the app layout
 * directly would drag code that is otherwise only in lazy page chunks into
 * the first load. Instead the root route (src/root.tsx) provides the shell
 * once, and route modules render its components by name.
 */
import { createElement, type ComponentProps, type ComponentType } from "react"
import type { shell as appShell } from "../app/shell"

export type Shell = typeof appShell
export type ShellName = keyof Shell

let current: Shell | null = null

/** Called once by src/root.tsx (and by tests that mount the route table). */
export function provideShell(shell: Shell): void {
  current = shell
}

/**
 * A component that renders the shell's `name` component with its props.
 * It carries the same name, so devtools and the route tests label routes by
 * the guard or layout they render (LoggedInRoute, OrgAdminRoute…).
 */
export function shellComponent<K extends ShellName>(
  name: K,
): ComponentType<ComponentProps<Shell[K]>> {
  function ShellComponent(props: ComponentProps<Shell[K]>) {
    if (!current) {
      throw new Error(`The app shell is not provided (rendering ${name})`)
    }
    // The shell's components have different props; this one gets exactly
    // the props of current[name] (see the signature).
    return createElement(
      current[name] as ComponentType<object>,
      props as object,
    )
  }
  Object.defineProperty(ShellComponent, "name", { value: name })
  return ShellComponent
}
