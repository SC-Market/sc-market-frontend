import React from "react"
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (
      k: string,
      d?: string | ({ defaultValue?: string } & Record<string, unknown>),
    ) => {
      const o = typeof d === "string" ? { defaultValue: d } : (d ?? {})
      return String(o.defaultValue ?? k).replace(/\{\{(\w+)\}\}/g, (_m, n) =>
        String(o[n] ?? ""),
      )
    },
  }),
}))

const preview = vi.fn()
vi.mock("../../../store/api/v2/market", () => ({
  usePreviewAdminAlertAudienceQuery: (arg: unknown, opts: unknown) => {
    preview(arg, opts)
    return {
      data: { recipients: 120, verified_emails: 80, discord_linked: 40 },
      isFetching: false,
    }
  },
}))

const create = vi.fn()
vi.mock("../api/adminApi", () => ({
  useGetAdminAlertsQuery: () => ({
    data: undefined,
    isLoading: false,
    error: undefined,
  }),
  useCreateAdminAlertMutation: () => [create, { isLoading: false }],
  useUpdateAdminAlertMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteAdminAlertMutation: () => [vi.fn(), { isLoading: false }],
}))
vi.mock("../../contractor/api/contractorApi", () => ({
  useSearchContractorsQuery: () => ({ data: [], isLoading: false }),
}))
vi.mock("../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))

import { AlertChannelsField } from "../components/AlertChannelsField"
import { useAdminAlerts } from "../hooks/useAdminAlerts"

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

describe("useAdminAlerts create flow", () => {
  beforeEach(() => {
    create.mockReset()
    create.mockReturnValue({ unwrap: () => Promise.resolve({}) })
  })

  it("defaults to in-app + push", () => {
    const { result } = renderHook(() => useAdminAlerts())
    expect(result.current.channels).toEqual(["in_app", "push"])
  })

  it("email to all users asks for confirmation, then sends with confirm_email_all_users", () => {
    const { result } = renderHook(() => useAdminAlerts())
    act(() => {
      result.current.setFormData({
        ...result.current.formData,
        title: "T",
        content: "C",
        target_type: "all_users",
      })
      result.current.setChannels(["in_app", "push", "email"])
    })
    act(() => result.current.handleCreateAlert())
    expect(create).not.toHaveBeenCalled()
    expect(result.current.confirmEmailOpen).toBe(true)

    act(() => result.current.handleCreateAlert(true))
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        channels: ["in_app", "push", "email"],
        confirm_email_all_users: true,
      }),
    )
  })

  it("no confirmation without email, or for a narrower target", () => {
    const { result } = renderHook(() => useAdminAlerts())
    act(() => {
      result.current.setFormData({
        ...result.current.formData,
        title: "T",
        content: "C",
        target_type: "admins_only",
      })
      result.current.setChannels(["in_app", "email"])
    })
    act(() => result.current.handleCreateAlert())
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        channels: ["in_app", "email"],
        target_type: "admins_only",
      }),
    )
    expect(create.mock.calls[0][0]).not.toHaveProperty(
      "confirm_email_all_users",
    )
  })
})
