/**
 * BlueprintInventory Component Tests
 *
 * The BlueprintInventory component is a redirect wrapper that navigates
 * to the BlueprintBrowser with owned=true and inventory=true params.
 */

import React from "react"
import { render, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { BlueprintInventory } from "../BlueprintInventory"

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe("BlueprintInventory", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should redirect to /blueprints with owned=true and inventory=true", async () => {
    render(
      <MemoryRouter initialEntries={["/blueprints/inventory"]}>
        <BlueprintInventory />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining("/blueprints?"),
        { replace: true }
      )
      const url = mockNavigate.mock.calls[0][0]
      expect(url).toContain("owned=true")
      expect(url).toContain("inventory=true")
    })
  })

  it("should preserve existing search params", async () => {
    render(
      <MemoryRouter initialEntries={["/blueprints/inventory?category=Weapons"]}>
        <BlueprintInventory />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled()
      const url = mockNavigate.mock.calls[0][0]
      expect(url).toContain("category=Weapons")
      expect(url).toContain("owned=true")
      expect(url).toContain("inventory=true")
    })
  })

  it("should render nothing (returns null)", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/blueprints/inventory"]}>
        <BlueprintInventory />
      </MemoryRouter>
    )

    expect(container.innerHTML).toBe("")
  })
})
