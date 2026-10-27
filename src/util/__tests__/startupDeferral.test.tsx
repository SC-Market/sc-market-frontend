import React from "react"
import { act, render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  armStartupDeferral,
  isStartupGateOpen,
  noteAppCommitted,
  openStartupGate,
  resetStartupDeferralForTests,
  STARTUP_DEFER_TIMEOUT_MS,
  useStartupGateOpen,
  whenStartupGateOpen,
} from "../startupDeferral"

function Probe() {
  return <span data-testid="gate">{String(useStartupGateOpen())}</span>
}

beforeEach(() => resetStartupDeferralForTests())
afterEach(() => {
  vi.useRealTimers()
  resetStartupDeferralForTests()
})

describe("startupDeferral", () => {
  it("is open unless armed (tests, server)", async () => {
    expect(isStartupGateOpen()).toBe(true)
    await expect(whenStartupGateOpen()).resolves.toBeUndefined()
    render(<Probe />)
    expect(screen.getByTestId("gate").textContent).toBe("true")
  })

  it("armed: closed until opened, then open for good", async () => {
    armStartupDeferral()
    render(<Probe />)
    expect(screen.getByTestId("gate").textContent).toBe("false")
    let resolved = false
    void whenStartupGateOpen().then(() => (resolved = true))
    await Promise.resolve()
    expect(resolved).toBe(false)
    act(() => openStartupGate())
    expect(screen.getByTestId("gate").textContent).toBe("true")
    await Promise.resolve()
    expect(resolved).toBe(true)
    openStartupGate()
    expect(isStartupGateOpen()).toBe(true)
  })

  it("opens by itself after the timeout from the first commit", () => {
    vi.useFakeTimers()
    armStartupDeferral()
    noteAppCommitted()
    vi.advanceTimersByTime(STARTUP_DEFER_TIMEOUT_MS - 1)
    expect(isStartupGateOpen()).toBe(false)
    vi.advanceTimersByTime(1000)
    expect(isStartupGateOpen()).toBe(true)
  })

  it("no fallback timer before the app commits", () => {
    vi.useFakeTimers()
    armStartupDeferral()
    vi.advanceTimersByTime(STARTUP_DEFER_TIMEOUT_MS * 3)
    expect(isStartupGateOpen()).toBe(false)
  })
})
