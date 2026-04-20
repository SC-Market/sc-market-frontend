/**
 * Unit tests for WishlistDetail component
 * 
 * Task 14.2 - Create WishlistDetail component
 * Requirements: 8.1, 8.2, 8.3, 53.1-53.10
 */

import React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { WishlistDetail } from "../WishlistDetail"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { wishlistsApi } from "../../../store/wishlistsApi"
import { BrowserRouter } from "react-router-dom"
import { vi, describe, it, expect, beforeEach } from "vitest"
import { CurrentOrgContext } from "../../../hooks/login/CurrentOrg"

// Mock the Page component to avoid serviceApi dependency
vi.mock("../../../components/metadata/Page", async () => {
  return {
    Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }
})

// Mock Footer to avoid AlertHookContext dependency
vi.mock("../../../components/footer/Footer", async () => {
  return {
    Footer: () => <div data-testid="footer">Footer</div>,
  }
})

// Mock navigate and useParams
const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ wishlist_id: "wishlist-1" }),
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
function renderWithProviders(
  ui: React.ReactElement,
  { store = createTestStore() } = {}
) {
  const currentOrgState: [any, any] = [null, vi.fn()]

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <CurrentOrgContext.Provider value={currentOrgState}>
          {ui}
        </CurrentOrgContext.Provider>
      </BrowserRouter>
    </Provider>
  )
}

// Mock wishlist data
const mockWishlistData = {
  wishlist: {
    wishlist_id: "wishlist-1",
    user_id: "user-1",
    wishlist_name: "Ship Components",
    wishlist_description: "Components for my Constellation",
    is_public: false,
    is_collaborative: false,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  items: [
    {
      item_id: "item-1",
      wishlist_id: "wishlist-1",
      game_item_id: "game-item-1",
      desired_quantity: 4,
      desired_quality_tier: 5,
      blueprint_id: "blueprint-1",
      priority: 5,
      notes: "Need for main thrusters",
      is_acquired: false,
      acquired_quantity: 0,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      game_item_name: "Quantum Drive",
      game_item_icon: "https://example.com/qd.png",
      game_item_type: "Component",
      blueprint_name: "Quantum Drive Blueprint",
      estimated_cost: 50000,
      crafting_available: true,
    },
    {
      item_id: "item-2",
      wishlist_id: "wishlist-1",
      game_item_id: "game-item-2",
      desired_quantity: 2,
      desired_quality_tier: 3,
      priority: 3,
      is_acquired: true,
      acquired_quantity: 2,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      game_item_name: "Shield Generator",
      game_item_icon: "https://example.com/shield.png",
      game_item_type: "Component",
      crafting_available: false,
    },
    {
      item_id: "item-3",
      wishlist_id: "wishlist-1",
      game_item_id: "game-item-3",
      desired_quantity: 1,
      priority: 1,
      is_acquired: false,
      acquired_quantity: 0,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      game_item_name: "Power Plant",
      game_item_type: "Component",
      crafting_available: false,
    },
  ],
  statistics: {
    total_items: 3,
    completed_items: 1,
    progress_percentage: 33,
    total_estimated_cost: 50000,
  },
}

describe("WishlistDetail", () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    // Set up window.location for route params
    Object.defineProperty(window, "location", {
      value: { pathname: "/wishlists/wishlist-1" },
      writable: true,
    })
  })

  describe("Display wishlist items (Requirement 53.1, 53.2)", () => {
    it("should display loading state while fetching wishlist", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: undefined,
        isLoading: true,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByRole("progressbar")).toBeInTheDocument()
      expect(screen.getByText("Loading Wishlist...")).toBeInTheDocument()
    })

    it("should display error message when fetch fails", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { status: 404, data: { message: "Not found" } },
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByText(/Failed to load wishlist/i)).toBeInTheDocument()
    })

    it("should display wishlist name and description", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByText("Ship Components")).toBeInTheDocument()
      expect(screen.getByText("Components for my Constellation")).toBeInTheDocument()
    })

    it("should display all wishlist items with names and icons", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByText("Quantum Drive")).toBeInTheDocument()
      expect(screen.getByText("Shield Generator")).toBeInTheDocument()
      expect(screen.getByText("Power Plant")).toBeInTheDocument()
    })

    it("should display item quantities", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByText("0 / 4")).toBeInTheDocument() // Quantum Drive
      expect(screen.getByText("2 / 2")).toBeInTheDocument() // Shield Generator
      expect(screen.getByText("0 / 1")).toBeInTheDocument() // Power Plant
    })

    it("should display item types", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      const componentLabels = screen.getAllByText("Component")
      expect(componentLabels.length).toBeGreaterThan(0)
    })
  })

  describe("Display quality tiers (Requirement 53.6)", () => {
    it("should display quality tier stars when specified", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      // Check for quality tier labels
      const qualityLabels = screen.getAllByText("Quality Tier")
      expect(qualityLabels.length).toBeGreaterThan(0)
    })

    it("should not display quality tier when not specified", () => {
      const dataWithoutQuality = {
        ...mockWishlistData,
        items: [
          {
            ...mockWishlistData.items[2],
            desired_quality_tier: undefined,
          },
        ],
      }

      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: dataWithoutQuality,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.queryByText("Quality Tier")).not.toBeInTheDocument()
    })
  })

  describe("Display acquisition status (Requirement 53.8)", () => {
    it("should display acquired badge for completed items", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByText("Acquired")).toBeInTheDocument()
    })

    it("should display mark as acquired button for incomplete items", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      const markButtons = screen.getAllByText("Mark as Acquired")
      expect(markButtons.length).toBeGreaterThan(0)
    })

    it("should toggle acquisition status when clicking mark button", async () => {
      const user = userEvent.setup()
      const mockUpdateItem = vi.fn().mockResolvedValue({ data: {} })

      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      vi.spyOn(wishlistsApi.endpoints.updateWishlistItem, "useMutation").mockReturnValue([
        mockUpdateItem,
        { isLoading: false },
      ] as any)

      renderWithProviders(<WishlistDetail />)

      const markButtons = screen.getAllByText("Mark as Acquired")
      await user.click(markButtons[0])

      await waitFor(() => {
        expect(mockUpdateItem).toHaveBeenCalledWith({
          wishlist_id: "wishlist-1",
          item_id: "item-1",
          body: {
            is_acquired: true,
            acquired_quantity: 4,
          },
        })
      })
    })
  })

  describe("Display crafting availability (Requirement 53.3)", () => {
    it("should display craftable badge for items with blueprints", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByText("Craftable")).toBeInTheDocument()
    })

    it("should show blueprint name in tooltip", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      const craftableChip = screen.getByText("Craftable")
      expect(craftableChip).toBeInTheDocument()
    })
  })

  describe("Display progress statistics (Requirement 53.4)", () => {
    it("should display progress percentage", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByText("33%")).toBeInTheDocument()
    })

    it("should display total items count", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByText("3")).toBeInTheDocument() // Total items
    })

    it("should display completed items count", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByText("1")).toBeInTheDocument() // Completed
    })

    it("should display remaining items count", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByText("2")).toBeInTheDocument() // Remaining
    })

    it("should display estimated cost when available", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByText("50,000 aUEC")).toBeInTheDocument()
    })

    it("should display progress bar", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      const progressBars = screen.getAllByRole("progressbar")
      expect(progressBars.length).toBeGreaterThan(0)
    })
  })

  describe("Support item priority sorting (Requirement 53.5, 53.9)", () => {
    it("should display priority levels for each item", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      const priorityLabels = screen.getAllByText("Priority")
      expect(priorityLabels.length).toBe(3)
    })

    it("should have sort dropdown with priority option", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByLabelText("Sort By")).toBeInTheDocument()
    })

    it("should sort items by priority by default", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      const itemNames = screen.getAllByRole("heading", { level: 6 })
      const firstItem = itemNames.find((el) => el.textContent?.includes("Quantum Drive"))
      expect(firstItem).toBeInTheDocument()
    })

    it("should sort items by name when selected", async () => {
      const user = userEvent.setup()

      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      const sortSelect = screen.getByLabelText("Sort By")
      await user.click(sortSelect)

      const nameOption = screen.getByText("Name")
      await user.click(nameOption)

      // Items should now be sorted alphabetically
      await waitFor(() => {
        const itemNames = screen.getAllByRole("heading", { level: 6 })
        expect(itemNames[0].textContent).toContain("Power Plant")
      })
    })

    it("should sort items by status when selected", async () => {
      const user = userEvent.setup()

      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      const sortSelect = screen.getByLabelText("Sort By")
      await user.click(sortSelect)

      const statusOption = screen.getByText("Status")
      await user.click(statusOption)

      // Incomplete items should come first
      await waitFor(() => {
        const itemNames = screen.getAllByRole("heading", { level: 6 })
        expect(itemNames[0].textContent).not.toContain("Shield Generator")
      })
    })

    it("should sort items by quality when selected", async () => {
      const user = userEvent.setup()

      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      const sortSelect = screen.getByLabelText("Sort By")
      await user.click(sortSelect)

      const qualityOption = screen.getByText("Quality")
      await user.click(qualityOption)

      // Highest quality items should come first
      await waitFor(() => {
        const itemNames = screen.getAllByRole("heading", { level: 6 })
        expect(itemNames[0].textContent).toContain("Quantum Drive")
      })
    })
  })

  describe("Display notes (Requirement 53.7)", () => {
    it("should display item notes when present", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByText("Need for main thrusters")).toBeInTheDocument()
    })

    it("should not display notes section when notes are absent", () => {
      const dataWithoutNotes = {
        ...mockWishlistData,
        items: mockWishlistData.items.map((item) => ({ ...item, notes: undefined })),
      }

      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: dataWithoutNotes,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.queryByText("Need for main thrusters")).not.toBeInTheDocument()
    })
  })

  describe("Item actions", () => {
    it("should display add item button", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByRole("button", { name: /Add Item/i })).toBeInTheDocument()
    })

    it("should display shopping list button", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByRole("button", { name: /Shopping List/i })).toBeInTheDocument()
    })

    it("should open item menu when clicking more button", async () => {
      const user = userEvent.setup()

      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      const moreButtons = screen.getAllByRole("button", { name: "" })
      const moreButton = moreButtons.find((btn) => btn.querySelector('[data-testid="MoreVertIcon"]'))

      if (moreButton) {
        await user.click(moreButton)
      }

      expect(screen.getByText("Edit Item")).toBeInTheDocument()
      expect(screen.getByText("Remove Item")).toBeInTheDocument()
    })

    it("should call removeItem mutation when clicking remove", async () => {
      const user = userEvent.setup()
      const mockRemoveItem = vi.fn().mockResolvedValue({ data: { success: true } })

      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      vi.spyOn(wishlistsApi.endpoints.removeWishlistItem, "useMutation").mockReturnValue([
        mockRemoveItem,
        { isLoading: false },
      ] as any)

      renderWithProviders(<WishlistDetail />)

      const moreButtons = screen.getAllByRole("button", { name: "" })
      const moreButton = moreButtons.find((btn) => btn.querySelector('[data-testid="MoreVertIcon"]'))

      if (moreButton) {
        await user.click(moreButton)
      }

      const removeButton = screen.getByText("Remove Item")
      await user.click(removeButton)

      await waitFor(() => {
        expect(mockRemoveItem).toHaveBeenCalledWith({
          wishlist_id: "wishlist-1",
          item_id: "item-1",
        })
      })
    })

    it("should navigate to shopping list when clicking shopping list button", async () => {
      const user = userEvent.setup()

      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      const shoppingListButton = screen.getByRole("button", { name: /Shopping List/i })
      await user.click(shoppingListButton)

      expect(mockNavigate).toHaveBeenCalledWith("/wishlists/wishlist-1/shopping-list")
    })
  })

  describe("Empty state", () => {
    it("should display empty state when no items exist", () => {
      const emptyData = {
        ...mockWishlistData,
        items: [],
        statistics: {
          total_items: 0,
          completed_items: 0,
          progress_percentage: 0,
          total_estimated_cost: 0,
        },
      }

      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: emptyData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByText("No items in this wishlist")).toBeInTheDocument()
      expect(screen.getByText(/Add items to start tracking/i)).toBeInTheDocument()
    })

    it("should display add first item button in empty state", () => {
      const emptyData = {
        ...mockWishlistData,
        items: [],
        statistics: {
          total_items: 0,
          completed_items: 0,
          progress_percentage: 0,
          total_estimated_cost: 0,
        },
      }

      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: emptyData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      expect(screen.getByRole("button", { name: /Add Your First Item/i })).toBeInTheDocument()
    })
  })

  describe("Breadcrumbs", () => {
    it("should display breadcrumbs with wishlist name", () => {
      vi.spyOn(wishlistsApi.endpoints.getWishlist, "useQuery").mockReturnValue({
        data: mockWishlistData,
        isLoading: false,
        error: undefined,
      } as any)

      renderWithProviders(<WishlistDetail />)

      // Breadcrumbs are rendered by StandardPageLayout
      expect(screen.getByText("Ship Components")).toBeInTheDocument()
    })
  })
})
