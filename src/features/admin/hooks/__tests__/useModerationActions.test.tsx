import { act, renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))
vi.mock("../../api/moderationApi", () => ({
  useReportContentMutation: vi.fn(),
  useUpdateReportMutation: vi.fn(),
}))

import * as moderationApi from "../../api/moderationApi"
import {
  mockMutationTrigger,
  mutationIdle,
} from "../../../../__tests__/rtkQueryMocks"
import { useReportContent, useUpdateReport } from "../useModerationActions"

type E = typeof moderationApi.moderationApi.endpoints
const report = mockMutationTrigger<E["reportContent"]>()
const update = mockMutationTrigger<E["updateReport"]>()

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, "error").mockImplementation(() => {})
  vi.mocked(moderationApi.useReportContentMutation).mockReturnValue([
    report,
    mutationIdle<E["reportContent"]>(),
  ])
  vi.mocked(moderationApi.useUpdateReportMutation).mockReturnValue([
    update,
    mutationIdle<E["updateReport"]>(),
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
      data: { status: "resolved", notes: "ok" },
    })
    update.mockReturnValueOnce({
      unwrap: () => Promise.reject({ status: 500 }),
    })
    await expect(
      result.current.update("r1", { status: "resolved" }),
    ).resolves.toBe(false)
  })
})
