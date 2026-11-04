import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import * as marketApi from "../../../../store/api/v2/market"
import type { EmailDeliverabilityResponse } from "../../../../store/api/v2/market"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../../store/api/v2/market", () => ({
  useGetEmailDeliverabilityQuery: vi.fn(),
  useReverifyEmailMutation: vi.fn(),
}))

import { EmailBounceNotice } from "../EmailBounceNotice"

const mockQuery = vi.mocked(marketApi.useGetEmailDeliverabilityQuery)
const mockMutation = vi.mocked(marketApi.useReverifyEmailMutation)
const refetch = vi.fn()
const reverify = vi.fn()

const status = (
  over: Partial<EmailDeliverabilityResponse> = {},
): EmailDeliverabilityResponse => ({
  has_email: true,
  email_verified: true,
  undeliverable: true,
  bounced_at: "2026-11-02T10:00:00.000Z",
  bounce_type: "hard",
  last_delivered_at: null,
  reverify_available_at: null,
  ...over,
})

function setup(data: EmailDeliverabilityResponse | undefined) {
  mockQuery.mockReturnValue({ data, refetch } as unknown as ReturnType<
    typeof marketApi.useGetEmailDeliverabilityQuery
  >)
  mockMutation.mockReturnValue([
    reverify,
    { isLoading: false },
  ] as unknown as ReturnType<typeof marketApi.useReverifyEmailMutation>)
}

describe("EmailBounceNotice", () => {
  beforeEach(() => vi.clearAllMocks())

  it("renders nothing while the address is deliverable", () => {
    setup(status({ undeliverable: false, bounced_at: null, bounce_type: null }))
    const { container } = render(
      <EmailBounceNotice email="a@example.test" onEditEmail={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("says the email bounced and offers to update it", () => {
    const onEditEmail = vi.fn()
    setup(status())
    render(
      <EmailBounceNotice email="a@example.test" onEditEmail={onEditEmail} />,
    )
    expect(
      screen.getByText("Your email bounced. Please update it."),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Email to a@example.test bounced on/),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Update email" }))
    expect(onEditEmail).toHaveBeenCalled()
  })

  it.each([
    ["soft", /kept bouncing/],
    ["complaint", /was reported as spam/],
  ] as const)("explains a %s bounce", (bounce_type, text) => {
    setup(status({ bounce_type }))
    render(<EmailBounceNotice email="a@example.test" onEditEmail={vi.fn()} />)
    expect(screen.getByText(text)).toBeInTheDocument()
  })

  it("re-verify sends a verification email", async () => {
    reverify.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          sent: true,
          reverify_available_at: "2026-11-02T10:15:00.000Z",
        }),
    })
    setup(status())
    render(<EmailBounceNotice email="a@example.test" onEditEmail={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Re-verify" }))
    await waitFor(() =>
      expect(screen.getByText(/Verification email sent/)).toBeInTheDocument(),
    )
    expect(screen.getByRole("button", { name: "Re-verify" })).toBeDisabled()
  })

  it("re-verify is disabled until the server's cooldown ends", () => {
    setup(
      status({
        reverify_available_at: new Date(
          Date.now() + 10 * 60 * 1000,
        ).toISOString(),
      }),
    )
    render(<EmailBounceNotice email="a@example.test" onEditEmail={vi.fn()} />)
    expect(screen.getByRole("button", { name: "Re-verify" })).toBeDisabled()
    expect(
      screen.getByText(/You can request another verification email at/),
    ).toBeInTheDocument()
  })

  it("refetches when the address changes", () => {
    setup(status())
    const { rerender } = render(
      <EmailBounceNotice email="a@example.test" onEditEmail={vi.fn()} />,
    )
    expect(refetch).not.toHaveBeenCalled()
    rerender(<EmailBounceNotice email="b@example.test" onEditEmail={vi.fn()} />)
    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
