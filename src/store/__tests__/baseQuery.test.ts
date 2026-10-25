import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import type { BaseQueryApi } from "@reduxjs/toolkit/query"
import { createBaseQuery } from "../baseQuery"
import type { NetworkEnv } from "../networkEnv"

const BASE_URL = "https://api.test"

function jsonResponse(status: number, body: unknown = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function makeEnv(overrides: Partial<NetworkEnv> = {}): NetworkEnv {
  return {
    credentials: "include",
    headers: {},
    onUnauthorized: vi.fn(() => Promise.resolve(true)),
    checkSession: vi.fn(() => Promise.resolve("unsupported" as const)),
    onLoggedOut: vi.fn(),
    ...overrides,
  }
}

function makeApi(networkEnv: NetworkEnv | undefined): BaseQueryApi {
  return {
    signal: new AbortController().signal,
    abort: () => {},
    dispatch: vi.fn(),
    getState: () => ({}),
    extra: networkEnv ? { networkEnv } : undefined,
    endpoint: "test",
    type: "query",
  }
}

/** No-wait backoff so retry tests don't sleep. */
const instantRetry = { backoff: () => Promise.resolve() }

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("createBaseQuery — reauth", () => {
  it("on 401, calls onUnauthorized and retries the request exactly once", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }))
    const env = makeEnv()
    const baseQuery = createBaseQuery({ baseUrl: BASE_URL, retry: false })

    const result = await baseQuery("/thing", makeApi(env), {})

    expect(env.onUnauthorized).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.data).toEqual({ ok: true })
  })

  it("does not retry a 401 when the refresh fails", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(401)))
    const env = makeEnv({ onUnauthorized: vi.fn(() => Promise.resolve(false)) })
    const baseQuery = createBaseQuery({ baseUrl: BASE_URL, retry: false })

    const result = await baseQuery("/thing", makeApi(env), {})

    expect(env.onUnauthorized).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.error?.status).toBe(401)
  })

  it("retries a 401 only once even if the retried request is also 401", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(401)))
    const env = makeEnv()
    const baseQuery = createBaseQuery({ baseUrl: BASE_URL, retry: true })

    const result = await baseQuery("/thing", makeApi(env), instantRetry)

    expect(env.onUnauthorized).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.error?.status).toBe(401)
  })

  it("uses the env's credentials mode and headers", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200)))
    const env = makeEnv({ credentials: "omit", headers: { "X-Test": "1" } })
    const baseQuery = createBaseQuery({ baseUrl: BASE_URL, retry: false })

    await baseQuery("/thing", makeApi(env), {})

    const request = fetchMock.mock.calls[0][0] as Request
    expect(request.url).toBe(`${BASE_URL}/thing`)
    expect(request.credentials).toBe("omit")
    expect(request.headers.get("X-Test")).toBe("1")
  })

  it("throws when the store was created without a NetworkEnv", async () => {
    const baseQuery = createBaseQuery({ baseUrl: BASE_URL, retry: false })

    await expect(baseQuery("/thing", makeApi(undefined), {})).rejects.toThrow(
      /NetworkEnv/,
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe("createBaseQuery — retry", () => {
  it.each([400, 403, 404, 429])("never retries a %i", async (status) => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(status)))
    const env = makeEnv()
    const baseQuery = createBaseQuery({ baseUrl: BASE_URL, retry: true })

    const result = await baseQuery("/thing", makeApi(env), instantRetry)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.error?.status).toBe(status)
  })

  it("retries a 5xx up to 3 times", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(503)))
    const env = makeEnv()
    const baseQuery = createBaseQuery({ baseUrl: BASE_URL, retry: true })

    const result = await baseQuery("/thing", makeApi(env), instantRetry)

    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(result.error?.status).toBe(503)
  })

  it("returns the first success after a transient 5xx", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(502))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }))
    const env = makeEnv()
    const baseQuery = createBaseQuery({ baseUrl: BASE_URL, retry: true })

    const result = await baseQuery("/thing", makeApi(env), instantRetry)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.data).toEqual({ ok: true })
  })

  it("does not retry a 5xx when retry is off (serviceApi)", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(503)))
    const env = makeEnv()
    const baseQuery = createBaseQuery({ baseUrl: BASE_URL, retry: false })

    const result = await baseQuery("/thing", makeApi(env), {})

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.error?.status).toBe(503)
  })
})
