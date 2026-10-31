import { vi, describe, it, expect, beforeEach } from "vitest"
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import english from "../../../locales/en/english.json"
import { OrgLinkBackLine, orgLinkBackUrl } from "../OrgLinkBackLine"

// Real English strings with {{var}} interpolation
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, string>) => {
      const value = key
        .split(".")
        .reduce<unknown>(
          (node, part) => (node as Record<string, unknown>)?.[part],
          english,
        )
      return String(value).replace(/{{(\w+)}}/g, (_, k) => vars?.[k] ?? "")
    },
  }),
}))

const LINE =
  "Find our shop on SC Market: https://sc-market.space/contractor/TESTORG"

describe("OrgLinkBackLine", () => {
  const writeText = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    writeText.mockClear()
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    })
  })

  it("links to the canonical public org page", () => {
    expect(orgLinkBackUrl("TESTORG")).toBe(
      "https://sc-market.space/contractor/TESTORG",
    )
  })

  it("shows the line, marks it optional, and copies it exactly", async () => {
    render(<OrgLinkBackLine spectrumId="TESTORG" context="verify" />)
    expect(screen.getByText(LINE)).toBeInTheDocument()
    expect(
      screen.getByText(/optional/i, { selector: "h6" }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /copy line/i }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(LINE))
  })

  it("never resembles the verification code", () => {
    expect(LINE).not.toMatch(/\[sc-market\.space:/i)
  })

  it("after verification, says only the code can be removed", () => {
    render(<OrgLinkBackLine spectrumId="TESTORG" context="verified" />)
    expect(
      screen.getByText(/only the code can be removed/i),
    ).toBeInTheDocument()
  })
})
