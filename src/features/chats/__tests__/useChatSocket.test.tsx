import { renderHook } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi } from "vitest"
import type { Session } from "../../../hooks/login/useSession"

const { fakeSocket, io } = vi.hoisted(() => {
  const fakeSocket = {
    connected: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  }
  return { fakeSocket, io: vi.fn(() => fakeSocket) }
})

vi.mock("socket.io-client", () => ({ io }))

const sessionRef = vi.hoisted(() => ({
  current: { status: "unknown", profile: undefined } as Session,
}))
vi.mock("../../../hooks/login/useSession", () => ({
  useSession: () => sessionRef.current,
}))

vi.mock("react-redux", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-redux")>()),
  useDispatch: () => vi.fn(),
}))

const authenticated: Session = {
  status: "authenticated",
  profile: { username: "tester" } as Extract<
    Session,
    { status: "authenticated" }
  >["profile"],
}

describe("chat socket", () => {
  beforeEach(() => {
    fakeSocket.connected = false
    for (const fn of [
      fakeSocket.connect,
      fakeSocket.disconnect,
      fakeSocket.on,
      fakeSocket.off,
      fakeSocket.emit,
    ]) {
      fn.mockClear()
    }
    sessionRef.current = { status: "unknown", profile: undefined }
  })

  it("is created lazily, once, and shared by every caller", async () => {
    const { getChatSocket } = await import("../socket")
    expect(io).not.toHaveBeenCalled()
    expect(getChatSocket()).toBe(getChatSocket())
    expect(io).toHaveBeenCalledTimes(1)
  })

  it("connects while authenticated and stays connected across remounts", async () => {
    const { useChatSocket } = await import("../hooks/useChatSocket")
    sessionRef.current = authenticated

    const first = renderHook(() => useChatSocket("chat-1", vi.fn()))
    expect(fakeSocket.connect).toHaveBeenCalledTimes(1)
    fakeSocket.connected = true
    first.unmount()

    renderHook(() => useChatSocket("chat-2", vi.fn()))
    expect(fakeSocket.connect).toHaveBeenCalledTimes(1)
    expect(fakeSocket.disconnect).not.toHaveBeenCalled()
  })

  it("disconnects when the session is not authenticated", async () => {
    const { useChatSocket } = await import("../hooks/useChatSocket")
    sessionRef.current = { status: "anonymous", profile: undefined }
    renderHook(() => useChatSocket(undefined, vi.fn()))
    expect(fakeSocket.connect).not.toHaveBeenCalled()
    expect(fakeSocket.disconnect).toHaveBeenCalled()
  })

  it("registers one message listener per mount and removes it on unmount", async () => {
    const { useChatSocket } = await import("../hooks/useChatSocket")
    sessionRef.current = authenticated
    const { unmount } = renderHook(() => useChatSocket("chat-1", vi.fn()))

    const listeners = fakeSocket.on.mock.calls.filter(
      ([event]) => event === "serverMessage",
    )
    expect(listeners).toHaveLength(1)

    unmount()
    expect(fakeSocket.off).toHaveBeenCalledWith("serverMessage", listeners[0][1])
  })

  it("joins the open chat's room and leaves it on change", async () => {
    const { useChatSocket } = await import("../hooks/useChatSocket")
    const { rerender, unmount } = renderHook(
      ({ id }) => useChatSocket(id, vi.fn()),
      { initialProps: { id: "chat-1" } },
    )
    expect(fakeSocket.emit).toHaveBeenCalledWith("clientJoinRoom", { chat_id: "chat-1" })

    rerender({ id: "chat-2" })
    expect(fakeSocket.emit).toHaveBeenCalledWith("clientLeaveRoom", { chat_id: "chat-1" })
    expect(fakeSocket.emit).toHaveBeenCalledWith("clientJoinRoom", { chat_id: "chat-2" })

    unmount()
    expect(fakeSocket.emit).toHaveBeenLastCalledWith("clientLeaveRoom", { chat_id: "chat-2" })
  })
})
