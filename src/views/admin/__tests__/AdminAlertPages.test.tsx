/**
 * Admin › Alerts: the list links to the New and Edit pages; New shows the
 * delivery channels and needs a title and content; Edit loads the alert by
 * id (generated useGetAdminAlertQuery), fills the form, shows Active instead
 * of the channels, and says so when the alert is gone.
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { AdminAlert } from "../../../store/api/v2/market"

const h = vi.hoisted(() => ({
  alert: undefined as AdminAlert | undefined,
  alertError: false,
  alertLoading: false,
  getAlertArgs: [] as unknown[],
  list: [] as AdminAlert[],
}))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))
vi.mock("../../../components/markdown/Markdown.lazy", () => ({
  MarkdownEditor: (props: {
    value: string
    TextFieldProps?: { label?: string }
  }) => (
    <textarea
      aria-label={props.TextFieldProps?.label}
      value={props.value}
      readOnly
    />
  ),
  MarkdownRender: (props: { text: string }) => <div>{props.text}</div>,
}))
vi.mock("../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: (props: {
    children: React.ReactNode
    headerTitle?: React.ReactNode
  }) => (
    <main>
      <h1>{props.headerTitle}</h1>
      {props.children}
    </main>
  ),
}))
vi.mock("../../../components/grid/ThemedDataGrid", () => ({
  ThemedDataGrid: (props: {
    rows: Array<AdminAlert & { id: string }>
    columns: Array<{
      field: string
      renderCell?: (p: { row: unknown; value: unknown }) => React.ReactNode
    }>
  }) => (
    <table>
      <tbody>
        {props.rows.map((row) => (
          <tr key={row.id}>
            {props.columns.map((c) => (
              <td key={c.field}>
                {c.renderCell
                  ? c.renderCell({
                      row,
                      value: row[c.field as keyof typeof row],
                    })
                  : String(row[c.field as keyof typeof row] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}))
vi.mock("../../../features/contractor/api/contractorApi", () => ({
  useSearchContractorsQuery: () => ({ data: [], isLoading: false }),
}))
vi.mock("../../../store/api/v2/admin-overrides", () => ({
  useCreateAdminAlertMutation: () => [vi.fn(), { isLoading: false }],
}))
vi.mock("../../../store/api/v2/market", () => ({
  usePreviewAdminAlertAudienceQuery: () => ({
    data: { recipients: 3, verified_emails: 2, discord_linked: 1 },
    isFetching: false,
  }),
  useUpdateAdminAlertMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteAdminAlertMutation: () => [vi.fn(), { isLoading: false }],
  useListAdminAlertsQuery: () => ({
    data: {
      alerts: h.list,
      pagination: {
        page: 0,
        page_size: 20,
        total: h.list.length,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
    },
    isLoading: false,
  }),
  useGetAdminAlertQuery: (arg: unknown) => {
    h.getAlertArgs.push(arg)
    return {
      data: h.alert,
      isLoading: h.alertLoading,
      isError: h.alertError,
    }
  },
}))

import { AdminAlertsView } from "../AdminAlertsView"
import {
  AdminAlertEdit,
  AdminAlertNew,
} from "../../../pages/admin/AdminAlertForm"

const ALERT: AdminAlert = {
  alert_id: "11111111-1111-4111-8111-111111111111",
  title: "Downtime",
  content: "Back soon",
  link: null,
  target_type: "admins_only",
  target_spectrum_id: null,
  created_by: "u1",
  created_at: "2026-11-01T00:00:00Z",
  active: true,
  channels: ["in_app", "push"],
}

const theme = createTheme({
  layoutSpacing: { component: 2, layout: 3 },
  borderRadius: { topLevel: 1 },
})

function renderAt(path: string) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/admin/alerts" element={<AdminAlertsView />} />
          <Route path="/admin/alerts/new" element={<AdminAlertNew />} />
          <Route
            path="/admin/alerts/:alertId/edit"
            element={<AdminAlertEdit />}
          />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

beforeEach(() => {
  h.alert = undefined
  h.alertError = false
  h.alertLoading = false
  h.getAlertArgs = []
  h.list = []
})

describe("Admin alerts list", () => {
  it("Create Alert goes to the New page; each row's edit goes to its Edit page", () => {
    h.list = [ALERT]
    renderAt("/admin/alerts")
    expect(screen.getByRole("link", { name: "Create Alert" })).toHaveAttribute(
      "href",
      "/admin/alerts/new",
    )
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      `/admin/alerts/${ALERT.alert_id}/edit`,
    )
  })
})

describe("New alert page", () => {
  it("shows the channels; Create needs a title and content; Cancel goes back", () => {
    renderAt("/admin/alerts/new")
    expect(
      screen.getByRole("heading", { name: "Create Alert" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "In-app" })).toBeChecked()
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled()
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute(
      "href",
      "/admin/alerts",
    )
    expect(screen.queryByRole("checkbox", { name: "Active" })).toBeNull()
  })
})

describe("Edit alert page", () => {
  it("loads the alert by its id and fills the form", () => {
    h.alert = ALERT
    renderAt(`/admin/alerts/${ALERT.alert_id}/edit`)
    expect(h.getAlertArgs[0]).toEqual({ alertId: ALERT.alert_id })
    expect(screen.getByDisplayValue("Downtime")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Back soon")).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Active" })).toBeChecked()
    // Editing never re-sends, so there are no channels to pick.
    expect(screen.queryByRole("checkbox", { name: "In-app" })).toBeNull()
    expect(screen.getByRole("button", { name: "Update" })).toBeEnabled()
  })

  it("says so when the alert doesn't exist", () => {
    h.alertError = true
    renderAt(`/admin/alerts/${ALERT.alert_id}/edit`)
    expect(
      screen.getByText("This alert doesn't exist or was deleted."),
    ).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Update" })).toBeNull()
  })
})
