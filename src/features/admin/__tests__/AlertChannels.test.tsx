import React from "react"
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

const preview = vi.fn()
const update = vi.fn()
vi.mock("../../../store/api/v2/market", () => ({
  usePreviewAdminAlertAudienceQuery: (arg: unknown, opts: unknown) => {
    preview(arg, opts)
    return {
      data: { recipients: 120, verified_emails: 80, discord_linked: 40 },
      isFetching: false,
    }
  },
  useUpdateAdminAlertMutation: () => [update, { isLoading: false }],
}))

const create = vi.fn()
vi.mock("../../../store/api/v2/admin-overrides", () => ({
  useCreateAdminAlertMutation: () => [create, { isLoading: false }],
}))
const navigate = vi.fn()
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}))
vi.mock("../../contractor/api/contractorApi", () => ({
  useSearchContractorsQuery: () => ({ data: [], isLoading: false }),
}))
vi.mock("../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))

import { AlertChannelsField } from "../components/AlertChannelsField"
import { useAdminAlertForm } from "../hooks/useAdminAlertForm"

describe("AlertChannelsField", () => {
  it("in-app is checked and locked; toggling email adds it; the preview shows email reach", () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <AlertChannelsField
        channels={["in_app", "push"]}
        onChange={onChange}
        targetType="all_users"
      />,
    )
    const inApp = screen.getByRole("checkbox", {
      name: "In-app",
    }) as HTMLInputElement
    expect(inApp.checked).toBe(true)
    expect(inApp.disabled).toBe(true)
    expect(
      (screen.getByRole("checkbox", { name: "Email" }) as HTMLInputElement)
        .checked,
    ).toBe(false)
    expect(screen.getByTestId("alert-audience").textContent).toBe(
      "~120 recipients",
    )

    fireEvent.click(screen.getByRole("checkbox", { name: "Email" }))
    expect(onChange).toHaveBeenCalledWith(["in_app", "push", "email"])

    rerender(
      <AlertChannelsField
        channels={["in_app", "push", "email"]}
        onChange={onChange}
        targetType="all_users"
      />,
    )
    expect(screen.getByTestId("alert-audience").textContent).toBe(
      "~120 recipients; email to ~80 verified addresses",
    )
  })

  it("specific org: no preview until an org is picked", () => {
    render(
      <AlertChannelsField
        channels={["in_app"]}
        onChange={vi.fn()}
        targetType="specific_org"
      />,
    )
    expect(preview).toHaveBeenLastCalledWith(
      { targetType: "specific_org" },
      { skip: true },
    )
    expect(screen.getByTestId("alert-audience").textContent).toContain(
      "Pick an organization",
    )
  })
})

describe("useAdminAlertForm", () => {
  beforeEach(() => {
    create.mockReset()
    create.mockReturnValue({ unwrap: () => Promise.resolve({}) })
    update.mockReset()
    update.mockReturnValue({ unwrap: () => Promise.resolve({}) })
    navigate.mockReset()
  })

  it("defaults to in-app + push", () => {
    const { result } = renderHook(() => useAdminAlertForm())
    expect(result.current.channels).toEqual(["in_app", "push"])
    expect(result.current.isEdit).toBe(false)
  })

  it("email to all users asks for confirmation, then sends with confirm_email_all_users", async () => {
    const { result } = renderHook(() => useAdminAlertForm())
    act(() => {
      result.current.setFormData({
        ...result.current.formData,
        title: "T",
        content: "C",
        target_type: "all_users",
      })
      result.current.setChannels(["in_app", "push", "email"])
    })
    act(() => result.current.handleSubmit())
    expect(create).not.toHaveBeenCalled()
    expect(result.current.confirmEmailOpen).toBe(true)

    await act(async () => result.current.handleSubmit(true))
    expect(create).toHaveBeenCalledWith({
      adminAlertCreateRequest: expect.objectContaining({
        channels: ["in_app", "push", "email"],
        confirm_email_all_users: true,
      }),
    })
    expect(navigate).toHaveBeenCalledWith("/admin/alerts")
  })

  it("no confirmation without email, or for a narrower target", () => {
    const { result } = renderHook(() => useAdminAlertForm())
    act(() => {
      result.current.setFormData({
        ...result.current.formData,
        title: "T",
        content: "C",
        target_type: "admins_only",
      })
      result.current.setChannels(["in_app", "email"])
    })
    act(() => result.current.handleSubmit())
    expect(create).toHaveBeenCalledWith({
      adminAlertCreateRequest: expect.objectContaining({
        channels: ["in_app", "email"],
        target_type: "admins_only",
      }),
    })
    expect(create.mock.calls[0][0].adminAlertCreateRequest).not.toHaveProperty(
      "confirm_email_all_users",
    )
  })

  it("specific org needs an org before it sends", () => {
    const { result } = renderHook(() => useAdminAlertForm())
    act(() => {
      result.current.setFormData({
        ...result.current.formData,
        title: "T",
        content: "C",
      })
      result.current.handleTargetTypeChange("specific_org")
    })
    act(() => result.current.handleSubmit())
    expect(create).not.toHaveBeenCalled()
    expect(result.current.contractorError).not.toBe("")
  })

  it("edit: starts from the alert and saves only the editable fields", async () => {
    const { result } = renderHook(() =>
      useAdminAlertForm({
        alert_id: "a1",
        title: "Downtime",
        content: "Back soon",
        link: null,
        target_type: "all_users",
        target_spectrum_id: null,
        created_by: "u1",
        created_at: "2026-11-01T00:00:00Z",
        active: true,
        channels: ["in_app", "email"],
      }),
    )
    expect(result.current.isEdit).toBe(true)
    expect(result.current.formData.title).toBe("Downtime")
    act(() =>
      result.current.setFormData({ ...result.current.formData, active: false }),
    )
    await act(async () => result.current.handleSubmit())
    expect(create).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith({
      alertId: "a1",
      adminAlertUpdateRequest: {
        title: "Downtime",
        content: "Back soon",
        link: null,
        target_type: "all_users",
        target_spectrum_id: null,
        active: false,
      },
    })
    expect(navigate).toHaveBeenCalledWith("/admin/alerts")
  })
})
