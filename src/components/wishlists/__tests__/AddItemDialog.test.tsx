/**
 * AddItemDialog Component Tests
 *
 * Tests for the AddItemDialog component including:
 * - Dialog rendering and form fields
 * - Item search/autocomplete
 * - Quantity input
 * - Quality tier selection
 * - Priority selection
 * - Notes field
 * - Form validation
 * - Dialog actions
 *
 * Task 14.3 - Create AddItemDialog component
 * Requirements: 8.1, 8.2, 8.3
 */

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { AddItemDialog } from "../AddItemDialog"

// Mock the RTK Query hooks
vi.mock("../../../store/api/v2/market", () => ({
  useSearchGameItemsQuery: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useAddWishlistItemMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false },
  ]),
  useSearchBlueprintsQuery: vi.fn(() => ({
    data: { blueprints: [] },
    isLoading: false,
  })),
}))

// Mock lodash debounce
vi.mock("lodash", () => ({
  debounce: (fn: any) => fn,
}))

describe("AddItemDialog", () => {
  const mockOnClose = vi.fn()
  const mockWishlistId = "wishlist-123"

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <AddItemDialog
          open={true}
          onClose={mockOnClose}
          wishlistId={mockWishlistId}
          {...props}
        />
      </MemoryRouter>
    )
  }

  describe("Dialog Rendering", () => {
    it("should render the dialog when open", () => {
      renderComponent()
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Add Item to Shopping List")).toBeInTheDocument()
    })

    it("should not render the dialog when closed", () => {
      renderComponent({ open: false })
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("should render all form fields", () => {
      renderComponent()
      expect(screen.getByLabelText(/search item/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
      expect(screen.getByText(/quality tier \(optional\)/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    })

    it("should render action buttons", () => {
      renderComponent()
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /add item/i })).toBeInTheDocument()
    })
  })

  describe("Item Search/Autocomplete (Requirement 8.1)", () => {
    it("should display the search input with placeholder", () => {
      renderComponent()
      expect(screen.getByLabelText(/search item/i)).toBeInTheDocument()
    })

    it("should show no options text when input is focused with less than 2 chars", async () => {
      renderComponent()
      const searchInput = screen.getByLabelText(/search item/i)
      await userEvent.click(searchInput)

      await waitFor(() => {
        expect(screen.getByText("Type at least 2 characters")).toBeInTheDocument()
      })
    })
  })

  describe("Quantity Input (Requirement 8.2)", () => {
    it("should default quantity to 1", () => {
      renderComponent()
      const quantityInput = screen.getByLabelText(/quantity/i) as HTMLInputElement
      expect(quantityInput.value).toBe("1")
    })

    it("should allow changing quantity", async () => {
      renderComponent()
      const quantityInput = screen.getByLabelText(/quantity/i) as HTMLInputElement

      // The controlled input starts at 1, typing "5" appends giving "15"
      // since parseInt("") is NaN and the handler guards against it
      await userEvent.type(quantityInput, "5")

      expect(quantityInput).toHaveValue(15)
    })
  })

  describe("Quality Tier Selection (Requirement 8.3)", () => {
    it("should make quality tier optional", () => {
      renderComponent()
      expect(screen.getByText(/quality tier \(optional\)/i)).toBeInTheDocument()
    })
  })

  describe("Priority Selection (Requirement 8.1)", () => {
    it("should default priority to 3", () => {
      renderComponent()
      expect(screen.getByText(/Priority: 3/)).toBeInTheDocument()
    })

    it("should show priority labels on slider", () => {
      renderComponent()
      expect(screen.getByText("Low")).toBeInTheDocument()
      expect(screen.getByText("Medium")).toBeInTheDocument()
      expect(screen.getByText("Critical")).toBeInTheDocument()
    })
  })

  describe("Notes Field (Requirement 8.1)", () => {
    it("should allow entering notes", async () => {
      renderComponent()
      const notesInput = screen.getByLabelText(/notes/i)

      await userEvent.type(notesInput, "This is a test note")

      expect(notesInput).toHaveValue("This is a test note")
    })

    it("should show character count for notes", () => {
      renderComponent()
      expect(screen.getByText("0/500")).toBeInTheDocument()
    })

    it("should update character count as user types", async () => {
      renderComponent()
      const notesInput = screen.getByLabelText(/notes/i)

      await userEvent.type(notesInput, "Test")

      await waitFor(() => {
        expect(screen.getByText("4/500")).toBeInTheDocument()
      })
    })

    it("should make notes optional", () => {
      renderComponent()
      expect(screen.getByLabelText(/notes \(optional\)/i)).toBeInTheDocument()
    })
  })

  describe("Form Validation", () => {
    it("should disable submit button when no item is selected", () => {
      renderComponent()
      const addButton = screen.getByRole("button", { name: /add item/i })
      expect(addButton).toBeDisabled()
    })
  })

  describe("Dialog Actions", () => {
    it("should call onClose when cancel button is clicked", async () => {
      renderComponent()
      const cancelButton = screen.getByRole("button", { name: /cancel/i })

      await userEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it("should have add item button", () => {
      renderComponent()
      expect(screen.getByRole("button", { name: /add item/i })).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("should have proper labels for all form fields", () => {
      renderComponent()
      expect(screen.getByLabelText(/search item/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    })
  })
})
