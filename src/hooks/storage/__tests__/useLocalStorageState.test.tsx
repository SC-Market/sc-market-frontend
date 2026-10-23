import React from "react"
import { act, renderHook } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { useLocalStorageState } from "../useLocalStorageState"

const MODES = ["grid", "list"] as const

function useMode() {
  return useLocalStorageState<"grid" | "list">("test-view", "grid", MODES)
}

function ModeLabel() {
  const [mode] = useMode()
  return <span data-testid="mode">{mode}</span>
}

describe("useLocalStorageState", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("reads the stored value on the first client render", () => {
    localStorage.setItem("test-view", "list")
    const { result } = renderHook(useMode)
    expect(result.current[0]).toBe("list")
  })

  it("falls back to the default when nothing or an unknown value is stored", () => {
    const { result: empty } = renderHook(useMode)
    expect(empty.current[0]).toBe("grid")

    localStorage.setItem("test-view", "tiles")
    const { result: invalid } = renderHook(useMode)
    expect(invalid.current[0]).toBe("grid")
  })

  it("persists and re-renders on set", () => {
    const { result } = renderHook(useMode)
    act(() => result.current[1]("list"))
    expect(result.current[0]).toBe("list")
    expect(localStorage.getItem("test-view")).toBe("list")
  })

  it("keeps components using the same key in sync", () => {
    const a = renderHook(useMode)
    const b = renderHook(useMode)
    act(() => a.result.current[1]("list"))
    expect(b.result.current[0]).toBe("list")
  })

  it("renders the default on the server even when a value is stored", () => {
    localStorage.setItem("test-view", "list")
    expect(renderToString(<ModeLabel />)).toContain(">grid<")
  })

  it("hydrates with the default, then applies the stored value", async () => {
    localStorage.setItem("test-view", "list")
    const container = document.createElement("div")
    container.innerHTML = renderToString(<ModeLabel />)
    document.body.appendChild(container)

    const errors: unknown[] = []
    let root: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      root = hydrateRoot(container, <ModeLabel />, {
        onRecoverableError: (error) => errors.push(error),
      })
    })

    expect(errors).toEqual([])
    expect(container.textContent).toBe("list")
    act(() => root!.unmount())
    container.remove()
  })

  it("still updates when localStorage rejects the write", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError")
      },
    })
    try {
      const { result } = renderHook(() =>
        useLocalStorageState<"grid" | "list">("blocked-view", "grid", MODES),
      )
      act(() => result.current[1]("list"))
      expect(result.current[0]).toBe("list")
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
