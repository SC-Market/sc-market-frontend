/**
 * AddItemDialog Component Tests
 * 
 * Tests for the AddItemDialog component including:
 * - Item search/autocomplete functionality
 * - Quantity input validation
 * - Quality tier selection
 * - Priority selection
 * - Notes field
 * - Form validation
 * - Submission handling
 * 
 * Task 14.3 - Create AddItemDialog component
 * Requirements: 8.1, 8.2, 8.3
 */

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { AddItemDialog } from "../AddItemDialog"

// Mock the RTK Query hooks
vi.mock("../../../store/api/v2/market", () => ({
  useSearchGameItemsQuery: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
}))

vi.mock("../../../store/wishlistsApi", () => ({
  useAddWishlistItemMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false },
  ]),
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
      <AddItemDialog
        open={true}
        onClose={mockOnClose}
        wishlistId={mockWishlistId}
        {...props}
      />
    )
  }

  describe("Dialog Rendering", () => {
    it("should render the dialog when open", () => {
      renderComponent()
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Add Item to Wishlist")).toBeInTheDocument()
    })

    it("should not render the dialog when closed", () => {
      renderComponent({ open: false })
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("should render all form fields", () => {
      renderComponent()
      expect(screen.getByLabelText(/search item/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
      expect(screen.getByText(/desired quality tier/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    })

    it("should render action buttons", () => {
      renderComponent()
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /add item/i })).toBeInTheDocument()
    })
  })

  describe("Item Search/Autocomplete (Requirement 8.1)", () => {
    it("should show helper text for search input", () => {
      renderComponent()
      expect(screen.getByText(/start typing to search for game items/i)).toBeInTheDocument()
    })

    it("should require at least 2 characters to search", async () => {
      renderComponent()
      const searchInput = screen.getByLabelText(/search item/i)

      await userEvent.click(searchInput)

      await waitFor(() => {
        expect(screen.getByText(/type at least 2 characters to search/i)).toBeInTheDocument()
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
      const quantityInput = screen.getByLabelText(/quantity/i)

      await userEvent.clear(quantityInput)
      await userEvent.type(quantityInput, "5")

      expect(quantityInput).toHaveValue(5)
    })

    it("should show helper text for quantity", () => {
      renderComponent()
      expect(screen.getByText(/how many of this item do you want/i)).toBeInTheDocument()
    })
  })

  describe("Quality Tier Selection (Requirement 8.3)", () => {
    it("should make quality tier optional", () => {
      renderComponent()
      expect(screen.getByText(/desired quality tier \(optional\)/i)).toBeInTheDocument()
    })

    it("should show quality tier description", () => {
      renderComponent()
      expect(screen.getByText(/select the quality tier you want for this item/i)).toBeInTheDocument()
    })
  })

  describe("Priority Selection (Requirement 8.1)", () => {
    it("should default priority to 3 (Medium)", () => {
      renderComponent()
      expect(screen.getByText(/priority level: 3/i)).toBeInTheDocument()
    })

    it("should show priority labels on slider", () => {
      renderComponent()
      expect(screen.getByText("Low")).toBeInTheDocument()
      expect(screen.getByText("Medium")).toBeInTheDocument()
      expect(screen.getByText("Critical")).toBeInTheDocument()
    })

    it("should have priority dropdown", () => {
      renderComponent()
      expect(screen.getByLabelText(/priority \*/i)).toBeInTheDocument()
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
      expect(screen.getByText(/0\/500 characters/i)).toBeInTheDocument()
    })

    it("should update character count as user types", async () => {
      renderComponent()
      const notesInput = screen.getByLabelText(/notes/i)

      await userEvent.type(notesInput, "Test")

      await waitFor(() => {
        expect(screen.getByText(/4\/500 characters/i)).toBeInTheDocument()
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

    it("should have required field indicators", () => {
      renderComponent()
      expect(screen.getByLabelText(/search item \*/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/quantity \*/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority \*/i)).toBeInTheDocument()
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
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    })

    it("should have helper text for form fields", () => {
      renderComponent()
      expect(screen.getByText(/start typing to search for game items/i)).toBeInTheDocument()
      expect(screen.getByText(/how many of this item do you want/i)).toBeInTheDocument()
    })

    it("should mark required fields with asterisk", () => {
      renderComponent()
      expect(screen.getByLabelText(/search item \*/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/quantity \*/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority \*/i)).toBeInTheDocument()
    })
  })
})
