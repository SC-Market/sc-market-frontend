/**
 * Layout regression test for the open contract card byline
 * ("<author> - <time ago> - <price> <payment type>").
 *
 * The byline used to be a non-wrapping flex row whose children shrank, and the
 * author name allowed breaks inside words, so names rendered as "PureSce" /
 * "ptor". Segments must now wrap as whole units, the name truncates with an
 * ellipsis, and the time ago and price never break internally.
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect } from "vitest"
import { ContractListingMeta } from "../ContractListings"
import type { PublicContract } from "../../../features/contracting/api/publicContractsApi"

const contract = {
  id: "c1",
  title: "Haul some cargo",
  customer: { username: "PureSceptor", display_name: "PureSceptor" },
  description: "desc",
  kind: "Delivery",
  collateral: 0,
  cost: 1250000,
  payment_type: "one-time",
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120),
  status: "active",
  expiration: new Date(),
} as unknown as PublicContract

function renderMeta() {
  return render(
    <MemoryRouter>
      <ContractListingMeta contract={contract} />
    </MemoryRouter>,
  )
}

describe("ContractListingMeta", () => {
  it("wraps segments as whole units instead of shrinking them", () => {
    renderMeta()
    const row = screen.getByTestId("contract-listing-meta")
    const styles = window.getComputedStyle(row)
    expect(styles.display).toBe("flex")
    expect(styles.flexWrap).toBe("wrap")
  })

  it("truncates the author name with an ellipsis rather than breaking mid-word", () => {
    renderMeta()
    const name = screen.getByText("PureSceptor")
    const styles = window.getComputedStyle(name)
    expect(styles.whiteSpace).toBe("nowrap")
    expect(styles.textOverflow).toBe("ellipsis")
    expect(styles.overflow).toBe("hidden")
    expect(styles.wordBreak).toBe("normal")
    expect(styles.overflowWrap).toBe("normal")
    expect(name).toHaveAttribute("title", "PureSceptor")
  })

  it("keeps the time ago and the price on one line each", () => {
    renderMeta()
    const time = screen.getByText(/ago -$/)
    const price = screen.getByText(/aUEC/)
    for (const el of [time, price]) {
      const styles = window.getComputedStyle(el)
      expect(styles.whiteSpace).toBe("nowrap")
      expect(styles.flexShrink).toBe("0")
    }
    expect(price.textContent).toContain((1250000).toLocaleString(undefined))
  })
})
