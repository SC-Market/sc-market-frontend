/**
 * Unit tests for WishlistManager component
 * 
 * Task 14.1 - Create WishlistManager component
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

import React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { WishlistManager } from "../WishlistManager"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { wishlistsApi } from "../../../store/wishlistsApi"
import { BrowserRouter } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"

// Mock navigate
const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Helper to create test store
function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      [wishlistsApi.reducerPath]: wishlistsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(wishlistsApi.middleware),
    preloadedState,
  })
}

// Helper to render with providers
function renderWithProviders(ui: React.ReactElement, { store = createTestStore() } = {}) {
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  )
}

// Mock wishlists data
const mockWishlists = [
  {
    wishlist_id: "wishlist-1",
    user_id: "user-1",
    wishlist_name: "Ship Components",
    wishlist_description: "Components for my Constellation",
    is_public: false,
    is_collaborative: false,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    item_count: 5,
    completed_items: 2,
    progress_percentage: 40,
  },
  {
    wishlist_id: "wishlist-2",
    user_id: "user-1",
    wishlist_name: "Mining Equipment",
    wishlist_description: undefined,
    is_public: true,
    is_collaborative: true,
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-10T08:00:00Z",
    item_count: 3,
    completed_items: 0,
    progress_percentage: 0,
  },
]

describe("WishlistManager", () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  describe("Display list of user wishlists (Requirement 8.1, 8.2)", () => {
    it("should display loading state while fetching wishlists", () => {
      // Mock loading state
      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: undefined,
        isLoading: true,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })

    it("should display error message when fetch fails", () => {
      // Mock error state
      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { status: 401, data: { message: "Unauthorized" } },
      } as any)

      renderWithProviders(<WishlistManager />)

      expect(screen.getByText(/Failed to load wishlists/i)).toBeInTheDocument()
      expect(screen.getByText(/Please ensure you are logged in/i)).toBeInTheDocument()
    })

    it("should display empty state when no wishlists exist", () => {
      // Mock empty state
      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: [] },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      expect(screen.getByText(/No wishlists yet/i)).toBeInTheDocument()
      expect(screen.getByText(/Create your first wishlist/i)).toBeInTheDocument()
    })

    it("should display list of wishlists with names and descriptions", () => {
      // Mock success state
      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: mockWishlists },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      expect(screen.getByText("Ship Components")).toBeInTheDocument()
      expect(screen.getByText("Components for my Constellation")).toBeInTheDocument()
      expect(screen.getByText("Mining Equipment")).toBeInTheDocument()
    })

    it("should display item counts for each wishlist", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: mockWishlists },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      expect(screen.getByText("5 items")).toBeInTheDocument()
      expect(screen.getByText("3 items")).toBeInTheDocument()
    })

    it("should display visibility badges (public/private)", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: mockWishlists },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      const privateIcons = screen.getAllByTitle("Private")
      const publicIcons = screen.getAllByTitle("Public")

      expect(privateIcons).toHaveLength(1)
      expect(publicIcons).toHaveLength(1)
    })

    it("should display collaborative badge when applicable", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: mockWishlists },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      const collaborativeIcons = screen.getAllByTitle("Collaborative")
      expect(collaborativeIcons).toHaveLength(1)
    })
  })

  describe("Display progress statistics (Requirement 8.3)", () => {
    it("should display progress bar with percentage", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: mockWishlists },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      expect(screen.getByText("40%")).toBeInTheDocument()
      expect(screen.getByText("0%")).toBeInTheDocument()
    })

    it("should display completed items count", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: mockWishlists },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      expect(screen.getByText("2 acquired")).toBeInTheDocument()
    })

    it("should display creation date", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: mockWishlists },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      // Check for formatted dates
      expect(screen.getByText(/Created 1\/15\/2024/i)).toBeInTheDocument()
      expect(screen.getByText(/Created 1\/10\/2024/i)).toBeInTheDocument()
    })
  })

  describe("Create wishlist dialog (Requirement 8.4)", () => {
    it("should open create dialog when clicking create button", async () => {
      const user = userEvent.setup()

      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: [] },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      const createButton = screen.getByRole("button", { name: /Create Wishlist/i })
      await user.click(createButton)

      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Create New Wishlist")).toBeInTheDocument()
    })

    it("should have name and description fields in dialog", async () => {
      const user = userEvent.setup()

      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: [] },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      const createButton = screen.getByRole("button", { name: /Create Wishlist/i })
      await user.click(createButton)

      expect(screen.getByLabelText(/Wishlist Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    })

    it("should have public and collaborative toggles", async () => {
      const user = userEvent.setup()

      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: [] },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      const createButton = screen.getByRole("button", { name: /Create Wishlist/i })
      await user.click(createButton)

      expect(screen.getByText("Make Public")).toBeInTheDocument()
      expect(screen.getByText("Collaborative")).toBeInTheDocument()
    })

    it("should disable create button when name is empty", async () => {
      const user = userEvent.setup()

      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: [] },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      const createButton = screen.getByRole("button", { name: /Create Wishlist/i })
      await user.click(createButton)

      const dialog = screen.getByRole("dialog")
      const submitButton = within(dialog).getByRole("button", { name: /Create Wishlist/i })

      expect(submitButton).toBeDisabled()
    })

    it("should call createWishlist mutation with correct data", async () => {
      const user = userEvent.setup()
      const mockCreateWishlist = vi.fn().mockResolvedValue({
        data: { wishlist_id: "new-wishlist-id" },
      })

      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: [] },
        isLoading: false,
        error: undefined,
      } as any)

      vi.spyOn(wishlistsApi.endpoints.createWishlist, "useMutation").mockReturnValue([
        mockCreateWishlist,
        { isLoading: false },
      ] as any)

      renderWithProviders(<WishlistManager />)

      const createButton = screen.getByRole("button", { name: /Create Wishlist/i })
      await user.click(createButton)

      const nameInput = screen.getByLabelText(/Wishlist Name/i)
      await user.type(nameInput, "Test Wishlist")

      const descriptionInput = screen.getByLabelText(/Description/i)
      await user.type(descriptionInput, "Test description")

      const publicSwitch = screen.getByRole("checkbox", { name: /Make Public/i })
      await user.click(publicSwitch)

      const dialog = screen.getByRole("dialog")
      const submitButton = within(dialog).getByRole("button", { name: /Create Wishlist/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateWishlist).toHaveBeenCalledWith({
          wishlist_name: "Test Wishlist",
          wishlist_description: "Test description",
          is_public: true,
          is_collaborative: false,
        })
      })
    })

    it("should navigate to new wishlist after creation", async () => {
      const user = userEvent.setup()
      const mockCreateWishlist = vi.fn().mockResolvedValue({
        unwrap: () => Promise.resolve({ wishlist_id: "new-wishlist-id" }),
      })

      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: [] },
        isLoading: false,
        error: undefined,
      } as any)

      vi.spyOn(wishlistsApi.endpoints.createWishlist, "useMutation").mockReturnValue([
        mockCreateWishlist,
        { isLoading: false },
      ] as any)

      renderWithProviders(<WishlistManager />)

      const createButton = screen.getByRole("button", { name: /Create Wishlist/i })
      await user.click(createButton)

      const nameInput = screen.getByLabelText(/Wishlist Name/i)
      await user.type(nameInput, "Test Wishlist")

      const dialog = screen.getByRole("dialog")
      const submitButton = within(dialog).getByRole("button", { name: /Create Wishlist/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/wishlists/new-wishlist-id")
      })
    })
  })

  describe("Wishlist selection (Requirement 8.5)", () => {
    it("should navigate to wishlist detail when clicking wishlist card", async () => {
      const user = userEvent.setup()

      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: mockWishlists },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      const wishlistCard = screen.getByText("Ship Components").closest("div[role='button']")
      if (wishlistCard) {
        await user.click(wishlistCard)
      }

      expect(mockNavigate).toHaveBeenCalledWith("/wishlists/wishlist-1")
    })
  })

  describe("Delete wishlist (Requirement 8.6)", () => {
    it("should show delete confirmation dialog when clicking delete button", async () => {
      const user = userEvent.setup()

      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: mockWishlists },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      const deleteButtons = screen.getAllByRole("button", { name: "" })
      const deleteButton = deleteButtons.find((btn) => btn.querySelector('[data-testid="DeleteIcon"]'))

      if (deleteButton) {
        await user.click(deleteButton)
      }

      expect(screen.getByText("Delete Wishlist?")).toBeInTheDocument()
      expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument()
    })

    it("should call deleteWishlist mutation when confirming delete", async () => {
      const user = userEvent.setup()
      const mockDeleteWishlist = vi.fn().mockResolvedValue({ data: { success: true } })

      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: mockWishlists },
        isLoading: false,
        error: undefined,
      } as any)

      vi.spyOn(wishlistsApi.endpoints.deleteWishlist, "useMutation").mockReturnValue([
        mockDeleteWishlist,
        { isLoading: false },
      ] as any)

      renderWithProviders(<WishlistManager />)

      const deleteButtons = screen.getAllByRole("button", { name: "" })
      const deleteButton = deleteButtons.find((btn) => btn.querySelector('[data-testid="DeleteIcon"]'))

      if (deleteButton) {
        await user.click(deleteButton)
      }

      const confirmButton = screen.getByRole("button", { name: /Delete/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockDeleteWishlist).toHaveBeenCalledWith("wishlist-1")
      })
    })

    it("should close dialog when canceling delete", async () => {
      const user = userEvent.setup()

      vi.spyOn(wishlistsApi.endpoints.getWishlists, "useQuery").mockReturnValue({
        data: { wishlists: mockWishlists },
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistManager />)

      const deleteButtons = screen.getAllByRole("button", { name: "" })
      const deleteButton = deleteButtons.find((btn) => btn.querySelector('[data-testid="DeleteIcon"]'))

      if (deleteButton) {
        await user.click(deleteButton)
      }

      const cancelButton = screen.getByRole("button", { name: /Cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText("Delete Wishlist?")).not.toBeInTheDocument()
      })
    })
  })
})
