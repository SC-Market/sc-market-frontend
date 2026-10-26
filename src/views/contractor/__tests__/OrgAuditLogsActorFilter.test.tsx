/**
 * The org audit log's actor filter took a raw user ID, which members can't
 * see anywhere. It's now a member autocomplete that filters by username.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"

const { logsQuery, membersQuery } = vi.hoisted(() => ({
  logsQuery: vi.fn(),
  membersQuery: vi.fn(),
}))
const emptyLogs = { data: { items: [], total: 0, page: 1, page_size: 10 }, isLoading: false }
const members = { data: [{ username: "alice" }, { username: "alfred" }] }

vi.mock("../../../features/contractor/api/contractorApi", () => ({
  useGetContractorAuditLogsQuery: (arg: unknown) => {
    logsQuery(arg)
    return emptyLogs
  },
  useSearchContractorMembersQuery: (arg: unknown, opts: { skip: boolean }) => {
    membersQuery(arg, opts)
    return opts.skip ? {} : members
  },
}))
vi.mock("../../../hooks/login/CurrentOrg", () => ({
  useCurrentOrg: () => [{ spectrum_id: "TESTORG" }, vi.fn()],
}))

import { OrgAuditLogs } from "../OrgAuditLogs"

describe("OrgAuditLogs › filter by member", () => {
  beforeEach(() => vi.clearAllMocks())

  it("searches the org's members and filters by the picked username", async () => {
    render(
      <ThemeProvider theme={mainTheme}>
        <OrgAuditLogs />
      </ThemeProvider>,
    )
    const input = screen.getByLabelText(/orgAuditLogs.filter_actor|Filter by member/)
    fireEvent.change(input, { target: { value: "al" } })
    await waitFor(() =>
      expect(membersQuery).toHaveBeenCalledWith(
        { spectrum_id: "TESTORG", query: "al" },
        { skip: false },
      ),
    )
    fireEvent.click(await screen.findByText("alice"))

    await waitFor(() =>
      expect(logsQuery).toHaveBeenLastCalledWith(
        expect.objectContaining({ spectrum_id: "TESTORG", actor_username: "alice" }),
      ),
    )
    expect(logsQuery.mock.calls.every(([arg]) => !("actor_id" in (arg as object)))).toBe(true)
  })
})
