import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))
vi.mock("../../api/tokensApi", () => ({
  useCreateTokenMutation: vi.fn(),
  useUpdateTokenMutation: vi.fn(),
  useDeleteTokenMutation: vi.fn(),
}))

import * as tokensApi from "../../api/tokensApi"
import {
  mockMutationTrigger,
  mutationIdle,
} from "../../../../__tests__/rtkQueryMocks"
import {
  useCreateToken,
  useDeleteToken,
  useUpdateToken,
} from "../useTokenActions"

type E = typeof tokensApi.tokensApi.endpoints
const create = mockMutationTrigger<E["createToken"]>()
const update = mockMutationTrigger<E["updateToken"]>()
const remove = mockMutationTrigger<E["deleteToken"]>()
const reject = (data: unknown) => ({
  unwrap: () => Promise.reject({ status: 400, data }),
})
const request = { name: "Bot", scopes: ["orders:read"] }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(tokensApi.useCreateTokenMutation).mockReturnValue([
    create,
    mutationIdle<E["createToken"]>(),
  ])
  vi.mocked(tokensApi.useUpdateTokenMutation).mockReturnValue([
    update,
    mutationIdle<E["updateToken"]>(),
  ])
  vi.mocked(tokensApi.useDeleteTokenMutation).mockReturnValue([
    remove,
    mutationIdle<E["deleteToken"]>(),
  ])
})

describe("useCreateToken", () => {
  it("returns the new secret", async () => {
    create.mockReturnValueOnce({
      unwrap: () => Promise.resolve({ token: "scm_secret" }),
    })
    const { result } = renderHook(() => useCreateToken())
    await expect(result.current.create(request)).resolves.toEqual({
      token: "scm_secret",
    })
    expect(create).toHaveBeenCalledWith(request)
  })

  it("returns the API's message, string or object", async () => {
    const { result } = renderHook(() => useCreateToken())
    create.mockReturnValueOnce(reject({ error: "Too many tokens" }))
    await expect(result.current.create(request)).resolves.toEqual({
      error: "Too many tokens",
    })
    create.mockReturnValueOnce(reject({ error: { message: "Bad scope" } }))
    await expect(result.current.create(request)).resolves.toEqual({
      error: "Bad scope",
    })
  })
})

describe("useUpdateToken", () => {
  it("alerts when saved, else returns the message", async () => {
    const { result } = renderHook(() => useUpdateToken())
    await expect(result.current.update("t1", request)).resolves.toBe(null)
    expect(update).toHaveBeenCalledWith({ tokenId: "t1", body: request })
    expect(alert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" }),
    )
    update.mockReturnValueOnce(reject({ error: "Expired" }))
    await expect(result.current.update("t1", request)).resolves.toBe("Expired")
  })
})

describe("useDeleteToken", () => {
  it("resolves to whether it was deleted", async () => {
    const { result } = renderHook(() => useDeleteToken())
    await expect(result.current("t1")).resolves.toBe(true)
    remove.mockReturnValueOnce(reject({}))
    await expect(result.current("t1")).resolves.toBe(false)
  })
})
