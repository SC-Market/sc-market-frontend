import { act, renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))
vi.mock("../../api/moderationApi", () => ({
  useReportContentMutation: vi.fn(),
}))
vi.mock("../../../../store/api/v2/market", () => ({
  useUpdateContentReportMutation: vi.fn(),
}))

import * as moderationApi from "../../api/moderationApi"
import * as v2 from "../../../../store/api/v2/market"
import {
  mockMutationTrigger,
  mutationIdle,
} from "../../../../__tests__/rtkQueryMocks"
import { useReportContent, useUpdateReport } from "../useModerationActions"

type E = typeof moderationApi.moderationApi.endpoints
type V2 = typeof v2.marketV2Api.endpoints
const report = mockMutationTrigger<E["reportContent"]>()
const update = mockMutationTrigger<V2["updateContentReport"]>()

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, "error").mockImplementation(() => {})
  vi.mocked(moderationApi.useReportContentMutation).mockReturnValue([
    report,
    mutationIdle<E["reportContent"]>(),
  ])
  vi.mocked(v2.useUpdateContentReportMutation).mockReturnValue([
    update,
    mutationIdle<V2["updateContentReport"]>(),
  ])
})

describe("useReportContent", () => {
  it("warns and sends nothing without a reason", async () => {
    const { result } = renderHook(() => useReportContent())
    await expect(result.current.submit("/market/1", "", "")).resolves.toBe(
      false,
    )
    expect(report).not.toHaveBeenCalled()
    expect(alert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warning" }),
    )
  })

  it("sends the report, leaving out empty details", async () => {
    const { result } = renderHook(() => useReportContent())
    let sent: boolean | undefined
    await act(async () => {
      sent = await result.current.submit("/market/1", "spam", "")
    })
    expect(sent).toBe(true)
    expect(report).toHaveBeenCalledWith({
      reported_url: "/market/1",
      report_reason: "spam",
      report_details: undefined,
    })
    expect(alert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" }),
    )
    expect(result.current.isSubmitting).toBe(false)
  })
})

describe("useUpdateReport", () => {
  it("resolves to whether the update saved", async () => {
    const { result } = renderHook(() => useUpdateReport())
    await expect(
      result.current.update("r1", { status: "resolved", notes: "ok" }),
    ).resolves.toBe(true)
    expect(update).toHaveBeenCalledWith({
      reportId: "r1",
      updateContentReportRequest: { status: "resolved", notes: "ok" },
    })
    update.mockReturnValueOnce({
      unwrap: () => Promise.reject({ status: 500 }),
    })
    await expect(
      result.current.update("r1", { status: "resolved" }),
    ).resolves.toBe(false)
  })
})
