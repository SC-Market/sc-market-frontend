import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"

const alert = vi.hoisted(() => vi.fn())
vi.mock("../../../hooks/alert/AlertHook", () => ({ useAlertHook: () => alert }))
vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

const {
  DiscordThreadControl,
  THREAD_POLL_INTERVAL_MS,
  THREAD_POLL_TIMEOUT_MS,
} = await import("../DiscordThreadControl")

/** Lets the create() promise chain settle under fake timers. */
async function flush() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

describe("DiscordThreadControl", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    alert.mockReset()
  })
  afterEach(() => vi.useRealTimers())

  it("links the thread when the record has one", () => {
    render(
      <DiscordThreadControl
        serverId="s1"
        threadId="t1"
        create={vi.fn()}
        refetch={vi.fn()}
      />,
    )
    const link = screen.getByRole("link", { name: "View thread" })
    expect(link.getAttribute("href")).toBe("https://discord.com/channels/s1/t1")
  })

  it("after a create, shows the pending state and re-reads until the thread lands", async () => {
    const create = vi.fn().mockResolvedValue({})
    const refetch = vi.fn()
    const { rerender } = render(
      <DiscordThreadControl
        serverId="s1"
        threadId={null}
        create={create}
        refetch={refetch}
      />,
    )
    fireEvent.click(screen.getByRole("button", { name: "Create thread" }))
    await flush()
    expect(create).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("status").textContent).toContain("Creating thread…")
    // No button while pending: a second click can't queue a second thread.
    expect(screen.queryByRole("button")).toBeNull()
    expect(refetch).toHaveBeenCalledTimes(1)
    act(() => vi.advanceTimersByTime(THREAD_POLL_INTERVAL_MS * 2))
    expect(refetch).toHaveBeenCalledTimes(3)

    rerender(
      <DiscordThreadControl
        serverId="s1"
        threadId="t9"
        create={create}
        refetch={refetch}
      />,
    )
    expect(screen.getByRole("link", { name: "View thread" })).toBeTruthy()
    act(() => vi.advanceTimersByTime(THREAD_POLL_INTERVAL_MS * 4))
    expect(refetch).toHaveBeenCalledTimes(3)
  })

  it("gives up the pending state after the timeout and says so", async () => {
    const refetch = vi.fn()
    render(
      <DiscordThreadControl
        serverId="s1"
        threadId={null}
        create={vi.fn().mockResolvedValue({})}
        refetch={refetch}
      />,
    )
    fireEvent.click(screen.getByRole("button", { name: "Create thread" }))
    await flush()
    act(() => vi.advanceTimersByTime(THREAD_POLL_TIMEOUT_MS))
    expect(alert).toHaveBeenCalledWith({
      message:
        "The Discord thread is taking longer than usual. Check back in a minute.",
      severity: "info",
    })
    expect(screen.getByRole("button", { name: "Create thread" })).toBeTruthy()
    const calls = refetch.mock.calls.length
    act(() => vi.advanceTimersByTime(THREAD_POLL_INTERVAL_MS * 3))
    expect(refetch).toHaveBeenCalledTimes(calls)
  })

  it("reports a failed create and stays on the button", async () => {
    const error = { data: { error: "nope" } }
    render(
      <DiscordThreadControl
        serverId="s1"
        threadId={null}
        create={vi.fn().mockRejectedValue(error)}
        refetch={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole("button", { name: "Create thread" }))
    await flush()
    expect(alert).toHaveBeenCalledWith(error)
    expect(screen.queryByRole("status")).toBeNull()
  })
})
