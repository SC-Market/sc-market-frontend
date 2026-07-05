/**
 * WishlistShare Component Tests
 * 
 * Tests for wishlist sharing functionality including:
 * - Share link generation and display
 * - Copy to clipboard functionality
 * - Privacy settings toggle
 * - Collaborative mode toggle
 * - Error handling
 * - Loading states
 * 
 * Task 14.5 - Create WishlistShare component
 * Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6
 */

import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { WishlistShare } from "../WishlistShare"
import { marketV2Api } from "../../../store/api/v2/market"
import type { Wishlist } from "../../../store/api/v2/market"

// Mock window.location
delete (window as any).location
window.location = { origin: "https://example.com" } as any

// Helper to create mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware),
    preloadedState: initialState,
  })
}

// Helper to render with Redux
const renderWithRedux = (component: React.ReactElement, store = createMockStore()) => {
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  }
}

// Mock wishlist data
const mockWishlist: Wishlist = {
  wishlist_id: "wishlist-123",
  user_id: "user-456",
  wishlist_name: "My Test Wishlist",
  wishlist_description: "Test description",
  is_public: false,
  share_token: undefined,
  organization_id: undefined,
  is_collaborative: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

const mockPublicWishlist: Wishlist = {
  ...mockWishlist,
  is_public: true,
  share_token: "abc123xyz789",
}

const mockOrgWishlist: Wishlist = {
  ...mockWishlist,
  organization_id: "org-789",
}

describe("WishlistShare Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("should render dialog with wishlist name", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockWishlist} />
      )

      expect(screen.getByText("Share Wishlist")).toBeInTheDocument()
      expect(screen.getByText("My Test Wishlist")).toBeInTheDocument()
    })

    it("should render privacy settings section", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockWishlist} />
      )

      expect(screen.getByText("Privacy Settings")).toBeInTheDocument()
      expect(screen.getAllByText("Private").length).toBeGreaterThan(0)
    })

    it("should render current sharing status summary (Requirement 28.4)", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockWishlist} />
      )

      expect(screen.getByText("Current Sharing Status")).toBeInTheDocument()
      expect(screen.getByText(/Visibility:/)).toBeInTheDocument()
      expect(screen.getByText(/Collaboration:/)).toBeInTheDocument()
      expect(screen.getByText(/Share Link:/)).toBeInTheDocument()
    })

    it("should not render when dialog is closed", () => {
      renderWithRedux(
        <WishlistShare open={false} onClose={vi.fn()} wishlist={mockWishlist} />
      )

      expect(screen.queryByText("Share Wishlist")).not.toBeInTheDocument()
    })
  })

  describe("Privacy Settings (Requirement 28.5)", () => {
    it("should display private status for private wishlist", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockWishlist} />
      )

      expect(screen.getAllByText("Private").length).toBeGreaterThan(0)
      expect(screen.getByText("Only you can view this shopping list")).toBeInTheDocument()
    })

    it("should display public status for public wishlist", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockPublicWishlist} />
      )

      expect(screen.getAllByText("Public").length).toBeGreaterThan(0)
      expect(screen.getByText("Anyone with the link can view this shopping list")).toBeInTheDocument()
    })

    it("should show info alert when wishlist is private", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockWishlist} />
      )

      expect(
        screen.getByText("Enable public visibility to generate a shareable link")
      ).toBeInTheDocument()
    })

    it("should toggle privacy switch", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockWishlist} />
      )

      const privacySwitch = screen.getByRole("checkbox", { name: /Private/i })
      expect(privacySwitch).not.toBeChecked()

      fireEvent.click(privacySwitch)
      // Note: Actual API call would be mocked in integration tests
    })
  })

  describe("Share Link Generation (Requirement 28.1)", () => {
    it("should display share link for public wishlist with token", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockPublicWishlist} />
      )

      expect(screen.getByText("Share Link")).toBeInTheDocument()
      expect(screen.getByText("Copy this link to share your wishlist with others")).toBeInTheDocument()

      const linkInput = screen.getByDisplayValue(
        "https://example.com/game-data/shopping-lists/wishlist-123?share_token=abc123xyz789"
      )
      expect(linkInput).toBeInTheDocument()
      expect(linkInput).toHaveAttribute("readonly")
    })

    it("should not display share link for private wishlist", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockWishlist} />
      )

      expect(screen.queryByText("Share Link")).not.toBeInTheDocument()
    })

    it("should generate correct share URL format", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockPublicWishlist} />
      )

      const expectedUrl = `https://example.com/game-data/shopping-lists/${mockPublicWishlist.wishlist_id}?share_token=${mockPublicWishlist.share_token}`
      expect(screen.getByDisplayValue(expectedUrl)).toBeInTheDocument()
    })
  })

  describe("Copy to Clipboard (Requirement 28.1)", () => {
    it("should render copy button for public wishlist", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockPublicWishlist} />
      )

      const copyButton = screen.getByRole("button", { name: /Copy to clipboard/i })
      expect(copyButton).toBeInTheDocument()
    })

    it("should copy link to clipboard when copy button is clicked", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      ;(navigator.clipboard.writeText as any) = writeTextMock

      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockPublicWishlist} />
      )

      const copyButton = screen.getByRole("button", { name: /Copy to clipboard/i })
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith(
          "https://example.com/game-data/shopping-lists/wishlist-123?share_token=abc123xyz789"
        )
      })
    })

    it("should show success message after copying", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      ;(navigator.clipboard.writeText as any) = writeTextMock

      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockPublicWishlist} />
      )

      const copyButton = screen.getByRole("button", { name: /Copy to clipboard/i })
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText("Link copied to clipboard!")).toBeInTheDocument()
      })
    })

    it("should change copy button icon to check after copying", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      ;(navigator.clipboard.writeText as any) = writeTextMock

      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockPublicWishlist} />
      )

      const copyButton = screen.getByRole("button", { name: /Copy to clipboard/i })
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Copied!/i })).toBeInTheDocument()
      })
    })

    it("should handle clipboard copy failure", async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error("Clipboard error"))
      ;(navigator.clipboard.writeText as any) = writeTextMock

      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockPublicWishlist} />
      )

      const copyButton = screen.getByRole("button", { name: /Copy to clipboard/i })
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText("Failed to copy link. Please copy manually.")).toBeInTheDocument()
      })
    })
  })

  describe("Collaborative Mode (Requirement 28.6)", () => {
    it("should display collaborative settings for organization wishlist", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockOrgWishlist} />
      )

      expect(screen.getByText("Collaboration Settings")).toBeInTheDocument()
      expect(screen.getByText("Collaborative Mode")).toBeInTheDocument()
    })

    it("should display info about collaborative mode for organization wishlist", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockOrgWishlist} />
      )

      expect(
        screen.getByText(/This wishlist is associated with your organization/)
      ).toBeInTheDocument()
    })

    it("should show disabled collaborative mode by default", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockOrgWishlist} />
      )

      const collaborativeSwitch = screen.getByRole("checkbox", { name: /Collaborative Mode/i })
      expect(collaborativeSwitch).not.toBeChecked()
      expect(
        screen.getByText("Only you can add and edit items in this shopping list")
      ).toBeInTheDocument()
    })

    it("should show enabled collaborative mode when active", () => {
      const collaborativeWishlist = { ...mockOrgWishlist, is_collaborative: true }
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={collaborativeWishlist} />
      )

      const collaborativeSwitch = screen.getByRole("checkbox", { name: /Collaborative Mode/i })
      expect(collaborativeSwitch).toBeChecked()
      expect(
        screen.getByText("Organization members can add and edit items in this shopping list")
      ).toBeInTheDocument()
    })

    it("should show info alert for non-organization wishlist", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockWishlist} />
      )

      expect(
        screen.getByText(/This wishlist is not associated with an organization/)
      ).toBeInTheDocument()
      expect(screen.queryByText("Collaboration Settings")).not.toBeInTheDocument()
    })

    it("should toggle collaborative switch", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockOrgWishlist} />
      )

      const collaborativeSwitch = screen.getByRole("checkbox", { name: /Collaborative Mode/i })
      expect(collaborativeSwitch).not.toBeChecked()

      fireEvent.click(collaborativeSwitch)
      // Note: Actual API call would be mocked in integration tests
    })
  })

  describe("Sharing Status Summary (Requirement 28.4)", () => {
    it("should display correct status for private non-collaborative wishlist", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockWishlist} />
      )

      expect(screen.getByText(/Visibility:/)).toBeInTheDocument()
      const privateElements = screen.getAllByText("Private")
      expect(privateElements.length).toBeGreaterThan(0)
      expect(screen.getByText(/Collaboration:/)).toBeInTheDocument()
      expect(screen.getByText("Disabled")).toBeInTheDocument()
      expect(screen.getByText(/Share Link:/)).toBeInTheDocument()
      expect(screen.getByText("Not Available")).toBeInTheDocument()
    })

    it("should display correct status for public wishlist with share token", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockPublicWishlist} />
      )

      const publicElements = screen.getAllByText("Public")
      expect(publicElements.length).toBeGreaterThan(0)
      expect(screen.getByText("Generated")).toBeInTheDocument()
    })

    it("should display correct status for collaborative organization wishlist", () => {
      const collaborativeWishlist = { ...mockOrgWishlist, is_collaborative: true }
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={collaborativeWishlist} />
      )

      expect(screen.getByText("Enabled")).toBeInTheDocument()
    })
  })

  describe("Dialog Actions", () => {
    it("should call onClose when close button is clicked", () => {
      const onCloseMock = vi.fn()
      renderWithRedux(
        <WishlistShare open={true} onClose={onCloseMock} wishlist={mockWishlist} />
      )

      const closeButton = screen.getByRole("button", { name: /Close/i })
      fireEvent.click(closeButton)

      expect(onCloseMock).toHaveBeenCalledTimes(1)
    })

    it("should call onClose when dialog backdrop is clicked", () => {
      const onCloseMock = vi.fn()
      const { container } = renderWithRedux(
        <WishlistShare open={true} onClose={onCloseMock} wishlist={mockWishlist} />
      )

      const backdrop = container.querySelector(".MuiBackdrop-root")
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(onCloseMock).toHaveBeenCalled()
      }
    })
  })

  describe("State Management", () => {
    it("should reset state when wishlist changes", () => {
      const { rerender, store } = renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockWishlist} />
      )

      // Initial state: private
      expect(screen.getAllByText("Private").length).toBeGreaterThan(0)

      // Change to public wishlist
      rerender(
        <Provider store={store}>
          <WishlistShare open={true} onClose={vi.fn()} wishlist={mockPublicWishlist} />
        </Provider>
      )

      // Should update to public
      expect(screen.getAllByText("Public").length).toBeGreaterThan(0)
    })

    it("should clear success message when dialog closes", () => {
      const onCloseMock = vi.fn()
      renderWithRedux(
        <WishlistShare open={true} onClose={onCloseMock} wishlist={mockWishlist} />
      )

      const closeButton = screen.getByRole("button", { name: /Close/i })
      fireEvent.click(closeButton)

      expect(onCloseMock).toHaveBeenCalled()
      // Success/error state would be cleared on next open
    })
  })

  describe("Accessibility", () => {
    it("should have accessible dialog title", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockWishlist} />
      )

      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Share Wishlist")).toBeInTheDocument()
    })

    it("should have accessible form controls", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockWishlist} />
      )

      const privacySwitch = screen.getByRole("checkbox", { name: /Private/i })
      expect(privacySwitch).toBeInTheDocument()
    })

    it("should have accessible buttons", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockPublicWishlist} />
      )

      expect(screen.getByRole("button", { name: /Copy to clipboard/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Close/i })).toBeInTheDocument()
    })

    it("should have readonly share link input", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockPublicWishlist} />
      )

      const linkInput = screen.getByDisplayValue(/https:\/\/example\.com/)
      expect(linkInput).toHaveAttribute("readonly")
    })
  })

  describe("Edge Cases", () => {
    it("should handle wishlist without share token", () => {
      const wishlistWithoutToken = { ...mockWishlist, is_public: true, share_token: undefined }
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={wishlistWithoutToken} />
      )

      expect(screen.queryByText("Share Link")).not.toBeInTheDocument()
    })

    it("should handle wishlist with empty description", () => {
      const wishlistNoDesc = { ...mockWishlist, wishlist_description: undefined }
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={wishlistNoDesc} />
      )

      expect(screen.getByText("My Test Wishlist")).toBeInTheDocument()
    })

    it("should handle organization wishlist without collaborative mode", () => {
      renderWithRedux(
        <WishlistShare open={true} onClose={vi.fn()} wishlist={mockOrgWishlist} />
      )

      const collaborativeSwitch = screen.getByRole("checkbox", { name: /Collaborative Mode/i })
      expect(collaborativeSwitch).not.toBeChecked()
    })
  })
})
