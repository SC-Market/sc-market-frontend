import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))
vi.mock("../../api/chatsApi", () => ({
  useCreateChatMutation: vi.fn(),
  useSendChatMessageMutation: vi.fn(),
}))

import * as chatsApi from "../../api/chatsApi"
import {
  mockMutationTrigger,
  mutationIdle,
} from "../../../../__tests__/rtkQueryMocks"
import { useCreateChat, useSendChatMessage } from "../useChatActions"

type E = typeof chatsApi.chatsApi.endpoints
const create = mockMutationTrigger<E["createChat"]>()
const send = mockMutationTrigger<E["sendChatMessage"]>()
const reject = (error: unknown) => ({ unwrap: () => Promise.reject(error) })

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(chatsApi.useCreateChatMutation).mockReturnValue([
    create,
    mutationIdle<E["createChat"]>(),
  ])
  vi.mocked(chatsApi.useSendChatMessageMutation).mockReturnValue([
    send,
    mutationIdle<E["sendChatMessage"]>(),
  ])
})

describe("useCreateChat", () => {
  it("creates the chat and alerts", async () => {
    const { result } = renderHook(() => useCreateChat())
    await expect(result.current.create(["a", "b"])).resolves.toBe(null)
    expect(create).toHaveBeenCalledWith({ users: ["a", "b"] })
    expect(alert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" }),
    )
  })

  it("returns the API's message for the form", async () => {
    create.mockReturnValueOnce(
      reject({ status: 400, data: { error: { message: "Blocked" } } }),
    )
    const { result } = renderHook(() => useCreateChat())
    await expect(result.current.create(["a"])).resolves.toBe("Blocked")
  })
})

describe("useSendChatMessage", () => {
  it("sends, and alerts a failure", async () => {
    send.mockReturnValueOnce(reject({ status: 500, data: {} }))
    const { result } = renderHook(() => useSendChatMessage())
    result.current("c1", "hello", "me")
    expect(send).toHaveBeenCalledWith({
      chat_id: "c1",
      content: "hello",
      username: "me",
    })
    await vi.waitFor(() => expect(alert).toHaveBeenCalled())
  })
})
