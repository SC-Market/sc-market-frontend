/**
 * The admin dialogs on ResponsiveDialog / ConfirmDialog: each is named by
 * its title, the long forms go full screen on phones and ignore backdrop
 * clicks (typed work), and nothing closes while a save is in flight.
 */
import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { Button } from "@mui/material"
import { describe, it, expect, vi, beforeEach } from "vitest"

const h = vi.hoisted(() => ({
  mobile: false,
  creatingAlert: false,
  creatingDefinition: false,
  grant: vi.fn(),
}))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../hooks/layout/useBreakpoint", () => ({
  useIsMobile: () => h.mobile,
  useBreakpointDown: () => h.mobile,
}))
vi.mock("../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))
vi.mock("../../../components/markdown/Markdown.lazy", () => ({
  MarkdownEditor: (props: { TextFieldProps?: { label?: string } }) => (
    <textarea aria-label={props.TextFieldProps?.label} />
  ),
  MarkdownRender: (props: { text: string }) => <div>{props.text}</div>,
}))
vi.mock("../../../features/admin/components/AlertChannelsField", () => ({
  AlertChannelsField: () => null,
}))
vi.mock("../../../features/admin/api/adminApi", () => ({
  useGetAdminAlertsQuery: () => ({ data: undefined, isLoading: false }),
  useCreateAdminAlertMutation: () => [vi.fn(), { isLoading: h.creatingAlert }],
  useUpdateAdminAlertMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteAdminAlertMutation: () => [vi.fn(), { isLoading: false }],
}))
vi.mock("../../../features/contractor/api/contractorApi", () => ({
  useSearchContractorsQuery: () => ({ data: [], isLoading: false }),
}))
vi.mock("../../../store/api/attributes", () => ({
  useGetAttributeDefinitionsQuery: () => ({ data: undefined }),
  useCreateAttributeDefinitionMutation: () => [
    vi.fn(),
    { isLoading: h.creatingDefinition },
  ],
  useUpdateAttributeDefinitionMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteAttributeDefinitionMutation: () => [vi.fn(), { isLoading: false }],
}))
vi.mock("../../../store/api/premium", () => ({
  useGetPremiumOrgsQuery: () => ({ data: undefined, isLoading: false }),
}))
vi.mock("../../../store/api/contractors", () => ({
  useSearchContractorsQuery: () => ({ data: undefined }),
}))
vi.mock("../../../features/admin/hooks/useOrgPremiumAdmin", () => ({
  useOrgPremiumAdmin: () => ({
    grant: h.grant,
    revoke: vi.fn(),
    isSetting: false,
    isRevoking: false,
  }),
}))
vi.mock("../../../store/api/v2/market", () => ({
  useGetStatsQuery: () => ({ data: [] }),
  useGetUserOverridesQuery: () => ({ data: undefined }),
}))
vi.mock("../../../features/admin/hooks/useFeatureFlagAdmin", () => ({
  useSaveFlagConfig: () => ({ save: vi.fn(), saving: false }),
  useFlagUserOverride: () => ({ set: vi.fn(), remove: vi.fn() }),
}))
vi.mock("../../../components/search/UserSearch", () => ({
  UserSearch: () => <input aria-label="User search" />,
}))

import { useAdminAlerts } from "../../../features/admin/hooks/useAdminAlerts"
import { useAdminAttributeDefinitions } from "../../../features/admin/hooks/useAdminAttributeDefinitions"
import { CreateAlertDialog } from "../CreateAlertDialog"
import { EditAlertDialog } from "../EditAlertDialog"
import {
  CreateAttributeDefinitionDialog,
  EditAttributeDefinitionDialog,
} from "../AttributeDefinitionFormDialogs"
import { AdminPremiumManagementView } from "../AdminPremiumManagementView"
import { AdminFeatureFlagDetailView } from "../AdminFeatureFlagDetailView"

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)

function AlertsHarness() {
  const alerts = useAdminAlerts()
  return (
    <>
      <Button onClick={alerts.handleOpenCreateModal}>open create</Button>
      <Button
        onClick={() =>
          alerts.handleOpenEditModal({
            alert_id: "a1",
            title: "Downtime",
            content: "Back soon",
            link: null,
            target_type: "all_users",
            target_spectrum_id: null,
            created_by: "u1",
            created_at: "2026-11-01T00:00:00Z",
            active: true,
          })
        }
      >
        open edit
      </Button>
      <CreateAlertDialog alerts={alerts} />
      <EditAlertDialog alerts={alerts} />
    </>
  )
}

function DefinitionsHarness() {
  const defs = useAdminAttributeDefinitions()
  return (
    <>
      <Button onClick={defs.handleOpenCreateModal}>open create</Button>
      <CreateAttributeDefinitionDialog defs={defs} />
      <EditAttributeDefinitionDialog defs={defs} />
    </>
  )
}

const backdrop = () => document.querySelector(".MuiBackdrop-root") as Element
const fullScreen = () => document.querySelector(".MuiDialog-paperFullScreen")

beforeEach(() => {
  h.mobile = false
  h.creatingAlert = false
  h.creatingDefinition = false
  h.grant.mockReset()
})

describe("Create / Edit alert", () => {
  it("create: named by its title, ignores backdrop clicks, Cancel closes", async () => {
    wrap(<AlertsHarness />)
    fireEvent.click(screen.getByText("open create"))
    expect(
      screen.getByRole("dialog", { name: "Create Alert" }),
    ).toBeInTheDocument()
    expect(fullScreen()).toBeNull()
    fireEvent.click(backdrop())
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("create: full screen on phones", () => {
    h.mobile = true
    wrap(<AlertsHarness />)
    fireEvent.click(screen.getByText("open create"))
    expect(fullScreen()).not.toBeNull()
  })

  it("create: nothing closes while it saves", () => {
    h.creatingAlert = true
    wrap(<AlertsHarness />)
    fireEvent.click(screen.getByText("open create"))
    const dialog = screen.getByRole("dialog", { name: "Create Alert" })
    fireEvent.keyDown(dialog, { key: "Escape" })
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Close" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
  })

  it("edit: named by its title and filled with the alert", () => {
    wrap(<AlertsHarness />)
    fireEvent.click(screen.getByText("open edit"))
    expect(
      screen.getByRole("dialog", { name: "Edit Alert" }),
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue("Downtime")).toBeInTheDocument()
  })
})

describe("Attribute definition dialogs", () => {
  it("create: named by its title, full screen on phones, ignores backdrop clicks", () => {
    h.mobile = true
    wrap(<DefinitionsHarness />)
    fireEvent.click(screen.getByText("open create"))
    expect(
      screen.getByRole("dialog", { name: "Create Attribute Definition" }),
    ).toBeInTheDocument()
    expect(fullScreen()).not.toBeNull()
    fireEvent.click(backdrop())
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("create: Cancel and Close are locked while it saves", () => {
    h.creatingDefinition = true
    wrap(<DefinitionsHarness />)
    fireEvent.click(screen.getByText("open create"))
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Close" })).toBeDisabled()
  })
})

describe("Grant premium", () => {
  it("opens a dialog named by its title; Grant needs an org", async () => {
    wrap(<AdminPremiumManagementView />)
    fireEvent.click(screen.getByRole("button", { name: "Grant Premium" }))
    const dialog = screen.getByRole("dialog", { name: "Grant Premium Tier" })
    expect(dialog).toBeInTheDocument()
    const buttons = screen.getAllByRole("button", { name: "Grant Premium" })
    expect(buttons[buttons.length - 1]).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("full screen on phones", () => {
    h.mobile = true
    wrap(<AdminPremiumManagementView />)
    fireEvent.click(screen.getByRole("button", { name: "Grant Premium" }))
    expect(fullScreen()).not.toBeNull()
  })
})

describe("Feature flag: add override", () => {
  it("opens a dialog named by its title; Add needs a user", () => {
    wrap(<AdminFeatureFlagDetailView flagName="market_v2" />)
    fireEvent.click(screen.getByRole("button", { name: "Add Override" }))
    expect(
      screen.getByRole("dialog", { name: "Add Override for market V2" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled()
  })

  it("phones: a bottom sheet", () => {
    h.mobile = true
    wrap(<AdminFeatureFlagDetailView flagName="market_v2" />)
    fireEvent.click(screen.getByRole("button", { name: "Add Override" }))
    expect(screen.getByTestId("sheet-handle")).toBeInTheDocument()
  })
})
