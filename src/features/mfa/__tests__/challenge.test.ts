import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import type { BaseQueryApi } from "@reduxjs/toolkit/query"
import { createBaseQuery } from "../../../store/baseQuery"
import type { NetworkEnv } from "../../../store/networkEnv"
import {
  isMfaEndpoint,
  mfaErrorCode,
  requestMfaChallenge,
  setMfaChallengeHandler,
} from "../challengeBroker"

const json = (status: number, body: unknown = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
const mfa403 = (code: string) => json(403, { error: { code, message: "x" } })

const env: NetworkEnv = {
  credentials: "include",
  headers: {},
  onUnauthorized: vi.fn(() => Promise.resolve(false)),
  checkSession: vi.fn(() => Promise.resolve("unsupported" as const)),
  onLoggedOut: vi.fn(),
}
const api = {
  signal: new AbortController().signal,
  abort: () => {},
  dispatch: vi.fn(),
  getState: () => ({}),
  extra: { networkEnv: env },
  endpoint: "test",
  type: "mutation",
} as unknown as BaseQueryApi

let fetchMock: ReturnType<typeof vi.fn>
let unregister: (() => void) | null = null
beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal("fetch", fetchMock)
})
afterEach(() => {
  unregister?.()
  unregister = null
  vi.unstubAllGlobals()
})

const bq = () => createBaseQuery({ baseUrl: "https://api.test", retry: false })

describe("MFA challenge in the base query", () => {
  it.each([
    ["MFA_REQUIRED", "required"],
    ["MFA_STEP_UP_REQUIRED", "step_up"],
  ])("on 403 %s, prompts (%s) and retries once after verification", async (code, kind) => {
    const handler = vi.fn(() => Promise.resolve(true))
    unregister = setMfaChallengeHandler(handler)
    fetchMock.mockResolvedValueOnce(mfa403(code)).mockResolvedValueOnce(json(200, { ok: 1 }))
    const result = await bq()({ url: "/admin/feature-flags/config", method: "PUT", body: {} }, api, {})
    expect(handler).toHaveBeenCalledWith(kind)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.data).toEqual({ ok: 1 })
  })

  it("returns the error when the user cancels", async () => {
    unregister = setMfaChallengeHandler(() => Promise.resolve(false))
    fetchMock.mockResolvedValue(mfa403("MFA_REQUIRED"))
    const result = await bq()("/admin/x", api, {})
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(mfaErrorCode(result.error)).toBe("MFA_REQUIRED")
  })

  it("retries only once even if still not verified", async () => {
    unregister = setMfaChallengeHandler(() => Promise.resolve(true))
    fetchMock.mockImplementation(() => Promise.resolve(mfa403("MFA_STEP_UP_REQUIRED")))
    await bq()("/admin/x", api, {})
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("does nothing for ordinary 403s, for enrollment-required, or without a host", async () => {
    const handler = vi.fn(() => Promise.resolve(true))
    fetchMock.mockResolvedValue(mfa403("MFA_REQUIRED"))
    await bq()("/admin/x", api, {}) // no host registered
    expect(fetchMock).toHaveBeenCalledTimes(1)

    unregister = setMfaChallengeHandler(handler)
    fetchMock.mockResolvedValue(json(403, { error: { code: "FORBIDDEN" } }))
    await bq()("/orders/1", api, {})
    fetchMock.mockResolvedValue(mfa403("MFA_ENROLLMENT_REQUIRED"))
    await bq()("/admin/x", api, {})
    expect(handler).not.toHaveBeenCalled()
  })

  it("never prompts for the two-factor endpoints themselves", async () => {
    const handler = vi.fn(() => Promise.resolve(true))
    unregister = setMfaChallengeHandler(handler)
    fetchMock.mockResolvedValue(mfa403("MFA_STEP_UP_REQUIRED"))
    await bq()({ url: "/auth/mfa/recovery-codes/regenerate", method: "POST" }, api, {})
    expect(handler).not.toHaveBeenCalled()
    expect(isMfaEndpoint("/auth/mfa/verify")).toBe(true)
    expect(isMfaEndpoint("/admin/mfa/users/x/reset")).toBe(false)
  })

  it("shares one prompt between concurrent requests", async () => {
    let resolve!: (ok: boolean) => void
    const handler = vi.fn(() => new Promise<boolean>((r) => (resolve = r)))
    unregister = setMfaChallengeHandler(handler)
    const a = requestMfaChallenge("required")
    const b = requestMfaChallenge("step_up")
    resolve(true)
    expect(await a).toBe(true)
    expect(await b).toBe(true)
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
