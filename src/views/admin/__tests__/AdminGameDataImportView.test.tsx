import "../../../util/i18n"
import React from "react"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { GameDataImportJob } from "../../../store/api/admin"
import { AdminGameDataImportView } from "../AdminGameDataImportView"

const mocks = vi.hoisted(() => ({
  issueAlert: vi.fn(),
  jobs: undefined as { jobs: GameDataImportJob[] } | undefined,
}))

vi.mock("../../../store/api/admin", () => ({
  useImportGameDataMutation: () => [vi.fn(), { isLoading: false }],
  useListGameDataImportJobsQuery: () => ({
    data: mocks.jobs,
    refetch: vi.fn(),
  }),
}))

vi.mock("../../../store/api/v2/market", () => ({
  useGetPagesDeployHookStatusQuery: () => ({ data: undefined }),
}))

vi.mock("../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => mocks.issueAlert,
}))

const job = (
  id: string,
  status: GameDataImportJob["status"],
): GameDataImportJob => ({
  id,
  status,
  startedAt: "2026-11-01T00:00:00Z",
  completedAt: status === "completed" || status === "failed" ? "x" : null,
  progress: null,
  result: null,
  error: status === "failed" ? "boom" : null,
  details: null,
})

const ui = () => (
  <MemoryRouter>
    <AdminGameDataImportView />
  </MemoryRouter>
)

describe("AdminGameDataImportView job alerts", () => {
  beforeEach(() => {
    mocks.issueAlert.mockReset()
    mocks.jobs = undefined
  })

  it("does not alert for jobs already finished on first load", () => {
    const { rerender } = render(ui())
    mocks.jobs = { jobs: [job("a", "completed"), job("b", "failed")] }
    rerender(ui())
    // a later poll returning the same finished jobs stays quiet too
    mocks.jobs = { jobs: [job("a", "completed"), job("b", "failed")] }
    rerender(ui())
    expect(mocks.issueAlert).not.toHaveBeenCalled()
  })

  it("alerts once when a job finishes while the page is open", () => {
    mocks.jobs = { jobs: [job("old", "completed"), job("run", "importing")] }
    const { rerender } = render(ui())
    expect(mocks.issueAlert).not.toHaveBeenCalled()

    mocks.jobs = { jobs: [job("old", "completed"), job("run", "completed")] }
    rerender(ui())
    expect(mocks.issueAlert).toHaveBeenCalledTimes(1)
    expect(mocks.issueAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" }),
    )

    mocks.jobs = { jobs: [job("old", "completed"), job("run", "completed")] }
    rerender(ui())
    expect(mocks.issueAlert).toHaveBeenCalledTimes(1)
  })

  it("alerts for a new job that appears already failed", () => {
    mocks.jobs = { jobs: [] }
    const { rerender } = render(ui())
    mocks.jobs = { jobs: [job("new", "failed")] }
    rerender(ui())
    expect(mocks.issueAlert).toHaveBeenCalledWith(
      expect.objectContaining({ message: "boom", severity: "error" }),
    )
  })
})
