/**
 * TEMPORARY (first-render investigation): `?perf=a,b` switches off parts of
 * the shell to measure what the first render costs. Remove after the A/B.
 */
const flags = new Set(
  typeof window === "undefined"
    ? []
    : (new URLSearchParams(window.location.search).get("perf") ?? "")
        .split(",")
        .filter(Boolean),
)

export function perfOff(name: string): boolean {
  return flags.has(name)
}
