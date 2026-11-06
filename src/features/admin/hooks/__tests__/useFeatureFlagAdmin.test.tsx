import { act, renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))
vi.mock("../../../../store/api/v2/market", () => ({
  useUpdateConfigMutation: vi.fn(),
  useSetUserOverrideMutation: vi.fn(),
  useRemoveUserOverrideMutation: vi.fn(),
}))

import * as market from "../../../../store/api/v2/market"
import type { marketV2Api } from "../../../../store/api/v2/market"
import {
  mockMutationTrigger,
  mutationIdle,
} from "../../../../__tests__/rtkQueryMocks"
import { useFlagUserOverride, useSaveFlagConfig } from "../useFeatureFlagAdmin"

type E = typeof marketV2Api.endpoints
const updateConfig = mockMutationTrigger<E["updateConfig"]>()
const setOverride = mockMutationTrigger<E["setUserOverride"]>()
const removeOverride = mockMutationTrigger<E["removeUserOverride"]>()
const reject = (error: unknown) => ({ unwrap: () => Promise.reject(error) })

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(market.useUpdateConfigMutation).mockReturnValue([
    updateConfig,
    mutationIdle<E["updateConfig"]>(),
  ])
  vi.mocked(market.useSetUserOverrideMutation).mockReturnValue([
    setOverride,
    mutationIdle<E["setUserOverride"]>(),
  ])
  vi.mocked(market.useRemoveUserOverrideMutation).mockReturnValue([
    removeOverride,
    mutationIdle<E["removeUserOverride"]>(),
  ])
})

describe("useSaveFlagConfig", () => {
  it("sends only the edited fields", async () => {
    const { result } = renderHook(() => useSaveFlagConfig("market_v2"))
    let saved: boolean | undefined
    await act(async () => {
      saved = await result.current.save({
        enabled: null,
        default_version: "V2",
        rollout_percentage: 0,
      })
    })
    expect(saved).toBe(true)
    expect(updateConfig).toHaveBeenCalledWith({
      updateConfigRequest: {
        flag_name: "market_v2",
        default_version: "V2",
        rollout_percentage: 0,
      },
    })
    expect(alert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" }),
    )
  })

  it("alerts the error and resolves false", async () => {
    updateConfig.mockReturnValueOnce(reject(new Error("nope")))
    const { result } = renderHook(() => useSaveFlagConfig("market_v2"))
    let saved: boolean | undefined
    await act(async () => {
      saved = await result.current.save({
        enabled: true,
        default_version: null,
        rollout_percentage: null,
      })
    })
    expect(saved).toBe(false)
    expect(alert).toHaveBeenCalledWith({ message: "nope", severity: "error" })
    expect(result.current.saving).toBe(false)
  })
})

describe("useFlagUserOverride", () => {
  it("sets an override with the username trimmed, and removes one", async () => {
    const { result } = renderHook(() => useFlagUserOverride("market_v2"))
    await expect(result.current.set(" alice ", false)).resolves.toBe(true)
    expect(setOverride).toHaveBeenCalledWith({
      setUserOverrideRequest: {
        username: "alice",
        flag_name: "market_v2",
        enabled: false,
      },
    })
    await expect(result.current.remove("alice")).resolves.toBe(true)
    expect(removeOverride).toHaveBeenCalledWith({
      username: "alice",
      flagName: "market_v2",
    })
  })

  it("resolves false when the user isn't found", async () => {
    setOverride.mockReturnValueOnce(reject({ status: 404 }))
    const { result } = renderHook(() => useFlagUserOverride("market_v2"))
    await expect(result.current.set("ghost", true)).resolves.toBe(false)
    expect(alert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error" }),
    )
  })
})
