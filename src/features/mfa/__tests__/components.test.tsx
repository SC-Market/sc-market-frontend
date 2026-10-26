import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"

const api = vi.hoisted(() => ({
  start: vi.fn(),
  confirm: vi.fn(),
  verify: vi.fn(),
  status: { enrolled: true, enforcement: "enforce" } as Record<string, unknown>,
  session: { status: "authenticated", profile: { role: "admin" } } as Record<string, unknown>,
}))

vi.mock("../../../store/api/v2/market", () => {
  const mutation = (fn: (arg: unknown) => Promise<{ data?: unknown; error?: unknown }>) => () => {
    const [state, setState] = React.useState<{ data?: unknown; error?: unknown; isLoading: boolean }>({
      isLoading: false,
    })
    const trigger = async (arg: unknown) => {
      const r = await fn(arg)
      setState({ ...r, isLoading: false })
      return r
    }
    return [trigger, { ...state, reset: () => setState({ isLoading: false }) }]
  }
  return {
    useStartTotpEnrollmentMutation: mutation(api.start),
    useConfirmTotpEnrollmentMutation: mutation(api.confirm),
    useVerifyMfaMutation: mutation(api.verify),
    useGetMfaStatusQuery: () => ({ data: api.status }),
  }
})
vi.mock("../../../store/hooks", () => ({ useAppDispatch: () => vi.fn() }))
vi.mock("../../../hooks/login/useSession", () => ({ useSession: () => api.session }))

import { MfaEnrollDialog } from "../components/MfaEnrollDialog"
import { MfaCodeForm } from "../components/MfaCodeForm"
import { SiteAdminRoute } from "../../../components/router/LoggedInRoute"

beforeEach(() => {
  api.start.mockReset()
  api.confirm.mockReset()
  api.verify.mockReset()
})

describe("MfaEnrollDialog", () => {
  it("shows QR and manual key, confirms the code, then the recovery codes once", async () => {
    api.start.mockResolvedValue({
      data: { factor_id: "f1", otpauth_uri: "otpauth://x", qr_data_url: "data:image/svg+xml;base64,AA", manual_key: "ABCD EFGH" },
    })
    const codes = Array.from({ length: 10 }, (_, i) => `AAAA${i}-BBBBB`)
    api.confirm.mockResolvedValue({ data: { recovery_codes: codes, elevated_until: null } })
    const onClose = vi.fn()
    render(<MfaEnrollDialog open onClose={onClose} />)

    expect(await screen.findByAltText(/QR code/i)).toHaveAttribute("src", "data:image/svg+xml;base64,AA")
    expect(screen.getByTestId("mfa-manual-key")).toHaveTextContent("ABCD EFGH")
    fireEvent.click(screen.getByRole("button", { name: /next/i }))

    const input = screen.getByLabelText("authentication code")
    expect(input).toHaveAttribute("inputmode", "numeric")
    expect(input).toHaveAttribute("autocomplete", "one-time-code")
    fireEvent.change(input, { target: { value: "12a3456" } })
    expect(input).toHaveValue("123456")
    fireEvent.click(screen.getByRole("button", { name: /turn on/i }))

    await waitFor(() => expect(api.confirm).toHaveBeenCalledWith({ totpConfirmRequest: { factor_id: "f1", code: "123456" } }))
    const list = await screen.findByRole("list", { name: "recovery codes" })
    expect(list.querySelectorAll("li")).toHaveLength(10)
    const done = screen.getByRole("button", { name: /done/i })
    expect(done).toBeDisabled()
    fireEvent.click(screen.getByLabelText(/I saved these codes/i))
    fireEvent.click(done)
    expect(onClose).toHaveBeenCalledWith(true)
  })

  it("shows the server's error for a wrong code", async () => {
    api.start.mockResolvedValue({ data: { factor_id: "f1", otpauth_uri: "x", qr_data_url: "data:x", manual_key: "K" } })
    api.confirm.mockResolvedValue({ error: { status: 400, data: { error: { code: "MFA_INVALID_CODE" } } } })
    render(<MfaEnrollDialog open onClose={vi.fn()} />)
    fireEvent.click(await screen.findByRole("button", { name: /next/i }))
    fireEvent.change(screen.getByLabelText("authentication code"), { target: { value: "000000" } })
    fireEvent.click(screen.getByRole("button", { name: /turn on/i }))
    expect(await screen.findByText(/not valid/i)).toBeInTheDocument()
  })
})

describe("MfaCodeForm", () => {
  it("verifies a code, or a recovery code", async () => {
    api.verify.mockResolvedValue({ data: { method: "totp", elevated_until: "", stepup_until: "" } })
    const onVerified = vi.fn()
    render(<MfaCodeForm onVerified={onVerified} />)
    fireEvent.change(screen.getByLabelText("authentication code"), { target: { value: "654321" } })
    fireEvent.click(screen.getByRole("button", { name: /verify/i }))
    await waitFor(() => expect(onVerified).toHaveBeenCalled())
    expect(api.verify).toHaveBeenCalledWith({ mfaVerifyRequest: { code: "654321" } })

    fireEvent.click(screen.getByRole("button", { name: /recovery code/i }))
    fireEvent.change(screen.getByLabelText("recovery code"), { target: { value: "abcde-fghjk" } })
    fireEvent.click(screen.getByRole("button", { name: /verify/i }))
    await waitFor(() =>
      expect(api.verify).toHaveBeenLastCalledWith({ mfaVerifyRequest: { recovery_code: "ABCDE-FGHJK" } }),
    )
  })

  it("explains a lockout", async () => {
    api.verify.mockResolvedValue({
      error: { status: 429, data: { error: { code: "MFA_LOCKED", details: { locked_until: "2026-10-26T12:15:00Z" } } } },
    })
    render(<MfaCodeForm onVerified={vi.fn()} />)
    fireEvent.change(screen.getByLabelText("authentication code"), { target: { value: "111111" } })
    fireEvent.click(screen.getByRole("button", { name: /verify/i }))
    expect(await screen.findByText(/Too many attempts, try again at/i)).toBeInTheDocument()
  })
})

describe("SiteAdminRoute", () => {
  const renderAt = () =>
    render(
      <MemoryRouter initialEntries={["/admin/users"]}>
        <Routes>
          <Route element={<SiteAdminRoute />}>
            <Route path="/admin/users" element={<div>ADMIN PAGE</div>} />
          </Route>
          <Route path="/404" element={<div>NOT FOUND</div>} />
        </Routes>
      </MemoryRouter>,
    )

  it("renders admin pages for a verified admin", () => {
    api.session = { status: "authenticated", profile: { role: "admin" } }
    renderAt()
    expect(screen.getByText("ADMIN PAGE")).toBeInTheDocument()
  })

  it("shows the challenge for an admin who has not verified", async () => {
    api.session = { status: "authenticated", profile: { role: "user", admin_locked: "mfa_required" } }
    api.status = { enrolled: true, enforcement: "enforce" }
    renderAt()
    expect(await screen.findByText("Two-factor verification")).toBeInTheDocument()
    expect(screen.queryByText("ADMIN PAGE")).toBeNull()
  })

  it("prompts setup for an admin without a factor", async () => {
    api.session = { status: "authenticated", profile: { role: "user", admin_locked: "mfa_enrollment" } }
    api.status = { enrolled: false, enforcement: "enforce" }
    renderAt()
    expect(await screen.findByText("Set up two-factor authentication")).toBeInTheDocument()
  })

  it("still 404s regular users and custom-domain admin locks", () => {
    for (const profile of [{ role: "user" }, { role: "user", admin_locked: "custom_origin" }]) {
      api.session = { status: "authenticated", profile }
      const { unmount } = renderAt()
      expect(screen.getByText("NOT FOUND")).toBeInTheDocument()
      unmount()
    }
  })
})
