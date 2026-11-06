import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const dispatch = vi.fn()
vi.mock("../../../../store/hooks", () => ({ useAppDispatch: () => dispatch }))
vi.mock("../../../../store/api/v2/market", () => ({
  useVerifyMfaMutation: vi.fn(),
  useStartTotpEnrollmentMutation: vi.fn(),
  useConfirmTotpEnrollmentMutation: vi.fn(),
  useRegenerateMfaRecoveryCodesMutation: vi.fn(),
  useRemoveMfaFactorMutation: vi.fn(),
}))

import * as market from "../../../../store/api/v2/market"
import type { marketV2Api } from "../../../../store/api/v2/market"
import { mutationIdle } from "../../../../__tests__/rtkQueryMocks"
import { useRemoveMfaFactor, useVerifyMfa } from "../useMfaActions"

type E = typeof marketV2Api.endpoints
const verify = vi.fn()
const remove = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(market.useVerifyMfaMutation).mockReturnValue([
    verify as never,
    mutationIdle<E["verifyMfa"]>(),
  ])
  vi.mocked(market.useRemoveMfaFactorMutation).mockReturnValue([
    remove as never,
    mutationIdle<E["removeMfaFactor"]>(),
  ])
})

describe("useVerifyMfa", () => {
  it("sends a code, refreshes the profile and reports the method", async () => {
    verify.mockResolvedValue({
      data: { method: "totp", recovery_codes_remaining: 8 },
    })
    const { result } = renderHook(() => useVerifyMfa())
    await expect(result.current.verify(false, "123456")).resolves.toEqual({
      usedRecoveryCode: false,
      remaining: 8,
    })
    expect(verify).toHaveBeenCalledWith({
      mfaVerifyRequest: { code: "123456" },
    })
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it("trims a recovery code, and resolves null when refused", async () => {
    verify.mockResolvedValue({ error: { status: 401 } })
    const { result } = renderHook(() => useVerifyMfa())
    await expect(result.current.verify(true, " ABCDE-12345 ")).resolves.toBe(
      null,
    )
    expect(verify).toHaveBeenCalledWith({
      mfaVerifyRequest: { recovery_code: "ABCDE-12345" },
    })
    expect(dispatch).not.toHaveBeenCalled()
  })
})

describe("useRemoveMfaFactor", () => {
  it("removes the factor with a current code", async () => {
    remove.mockResolvedValue({ data: {} })
    const { result } = renderHook(() => useRemoveMfaFactor("f1"))
    await expect(result.current.remove("654321")).resolves.toBe(true)
    expect(remove).toHaveBeenCalledWith({
      factorId: "f1",
      mfaReauthRequest: { code: "654321" },
    })
    remove.mockResolvedValue({ error: { status: 403 } })
    await expect(result.current.remove("000000")).resolves.toBe(false)
  })
})
