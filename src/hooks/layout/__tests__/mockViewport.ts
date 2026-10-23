import { vi } from "vitest"

/**
 * Stubs `window.matchMedia` for a viewport `width` px wide. Handles the
 * `(min-width:Npx)` / `(max-width:Npx)` queries MUI's breakpoint helpers
 * produce, joined with `and`.
 */
export function mockViewport(width: number) {
  return vi.spyOn(window, "matchMedia").mockImplementation((query: string) => {
    const checks = [...query.matchAll(/\((min|max)-width:\s*([\d.]+)px\)/g)]
    const matches =
      checks.length > 0 &&
      checks.every(([, kind, px]) =>
        kind === "min" ? width >= Number(px) : width <= Number(px),
      )
    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList
  })
}

export const PHONE_WIDTH = 390
export const DESKTOP_WIDTH = 1440
