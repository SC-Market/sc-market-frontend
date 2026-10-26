/**
 * White-label settings that disagreed with the API:
 * - "Require org membership" showed in Public mode, where it does nothing;
 * - custom tabs accepted http:// links, which the API rejects on save.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"

const { updateConfig, config, configResult, sidebar } = vi.hoisted(() => {
  const config = {
    focus_mode: "public" as "public" | "internal",
    homepage_path: null,
    require_membership: true,
  }
  return {
    updateConfig: vi.fn(),
    config,
    // RTK Query returns the same data object between renders; so must the mock.
    configResult: { data: { data: config } },
    sidebar: { data: { data: [] } },
  }
})

vi.mock("../../../hooks/login/CurrentOrg", () => ({
  useCurrentOrg: () => [{ spectrum_id: "WLORG" }, vi.fn()],
}))
vi.mock("../../../store/api/contractors", () => ({
  useGetWhitelabelConfigQuery: () => configResult,
  useGetWhitelabelSidebarQuery: () => sidebar,
  useUpdateWhitelabelConfigMutation: () => [
    (arg: unknown) => ({ unwrap: () => Promise.resolve(updateConfig(arg)) }),
    { isLoading: false },
  ],
  useUpdateWhitelabelSidebarMutation: () => [vi.fn(), { isLoading: false }],
}))

import { WhiteLabelSettings } from "../WhiteLabelSettings"
import { customTabPathError } from "../../../features/contractor/hooks/useWhiteLabelSettings"

function renderSettings() {
  render(
    <ThemeProvider theme={mainTheme}>
      <WhiteLabelSettings />
    </ThemeProvider>,
  )
}

describe("WhiteLabelSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    config.focus_mode = "public"
  })

  it("only offers Require org membership for an Internal site", () => {
    renderSettings()
    expect(screen.queryByLabelText("Require org membership to access")).toBeNull()
  })

  it("offers it for an Internal site and saves it", async () => {
    config.focus_mode = "internal"
    renderSettings()
    expect(screen.getByLabelText("Require org membership to access")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Save Settings" }))
    await waitFor(() => expect(updateConfig).toHaveBeenCalled())
    expect(updateConfig.mock.calls[0][0]).toMatchObject({ focus_mode: "internal", require_membership: true })
  })

  it("saves membership off for a Public site", async () => {
    renderSettings()
    fireEvent.click(screen.getByRole("button", { name: "Save Settings" }))
    await waitFor(() => expect(updateConfig).toHaveBeenCalled())
    expect(updateConfig.mock.calls[0][0]).toMatchObject({ focus_mode: "public", require_membership: false })
  })

  it("refuses an http:// custom tab like the API does", () => {
    renderSettings()
    fireEvent.change(screen.getByLabelText("Label"), { target: { value: "Staff" } })
    fireEvent.change(screen.getByLabelText("Path or URL"), { target: { value: "http://example.com" } })
    expect(screen.getByText("Links to other sites must use https://")).toBeTruthy()
    expect((screen.getByRole("button", { name: "Add" }) as HTMLButtonElement).disabled).toBe(true)

    fireEvent.change(screen.getByLabelText("Path or URL"), { target: { value: "https://example.com" } })
    expect((screen.getByRole("button", { name: "Add" }) as HTMLButtonElement).disabled).toBe(false)
  })
})

describe("customTabPathError", () => {
  it("accepts site paths and https links only", () => {
    expect(customTabPathError("/market")).toBeNull()
    expect(customTabPathError("https://staff.example.com")).toBeNull()
    expect(customTabPathError("http://staff.example.com")).not.toBeNull()
    expect(customTabPathError("market")).not.toBeNull()
  })
})
