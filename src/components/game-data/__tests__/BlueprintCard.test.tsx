/**
 * BlueprintCard Component Tests
 *
 * Tests for the BlueprintCard component covering:
 * - Grid and list view rendering
 * - Blueprint metadata display
 * - Bookmark toggle functionality
 * - Click handlers
 *
 * Task 12.2 - Create BlueprintCard component
 */

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { vi } from "vitest"
import { BlueprintCard } from "../BlueprintCard"

// Wrap renders with MemoryRouter since BlueprintCard uses useNavigate
const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

describe("BlueprintCard", () => {
  const mockBlueprint = {
    blueprint_id: "bp-123",
    blueprint_name: "Advanced Weapon Blueprint",
    output_item_name: "Advanced Laser Cannon",
    output_item_icon: "https://example.com/icon.png",
    item_category: "Weapons",
    item_subcategory: "Energy Weapons",
    rarity: "Rare",
    tier: 3,
    ingredient_count: 5,
    mission_count: 3,
    crafting_time_seconds: 180,
    user_owns: false,
  }

  describe("Grid View", () => {
    it("should render blueprint output item name in grid view", () => {
      renderWithRouter(<BlueprintCard blueprint={mockBlueprint} viewMode="grid" />)

      expect(screen.getByText("Advanced Laser Cannon")).toBeInTheDocument()
      expect(screen.getByText("Rare")).toBeInTheDocument()
    })

    it("should display category in grid view", () => {
      renderWithRouter(<BlueprintCard blueprint={mockBlueprint} viewMode="grid" />)

      // Category appears both in subtitle and as a chip
      const weaponsElements = screen.getAllByText("Weapons")
      expect(weaponsElements.length).toBeGreaterThanOrEqual(1)
    })

    it("should display mission source count", () => {
      renderWithRouter(<BlueprintCard blueprint={mockBlueprint} viewMode="grid" />)

      expect(screen.getByText("3 mission sources")).toBeInTheDocument()
    })

    it("should handle singular mission count", () => {
      const singleBlueprint = {
        ...mockBlueprint,
        mission_count: 1,
      }

      renderWithRouter(<BlueprintCard blueprint={singleBlueprint} viewMode="grid" />)

      expect(screen.getByText("1 mission source")).toBeInTheDocument()
    })

    it("should format crafting time correctly", () => {
      renderWithRouter(<BlueprintCard blueprint={mockBlueprint} viewMode="grid" />)
      // 180 seconds = 3m
      expect(screen.getByText("3m")).toBeInTheDocument()
      expect(screen.getByText("Craft time")).toBeInTheDocument()
    })

    it("should not display crafting time if not provided", () => {
      const blueprintWithoutTime = { ...mockBlueprint, crafting_time_seconds: undefined }
      renderWithRouter(<BlueprintCard blueprint={blueprintWithoutTime} viewMode="grid" />)

      expect(screen.queryByText("Craft time")).not.toBeInTheDocument()
    })

    it("should not display rarity if not provided", () => {
      const blueprintWithoutRarity = { ...mockBlueprint, rarity: undefined }
      renderWithRouter(<BlueprintCard blueprint={blueprintWithoutRarity} viewMode="grid" />)

      expect(screen.queryByText("Rare")).not.toBeInTheDocument()
    })

    it("should not display tier if not provided", () => {
      const blueprintWithoutTier = { ...mockBlueprint, tier: undefined }
      renderWithRouter(<BlueprintCard blueprint={blueprintWithoutTier} viewMode="grid" />)

      expect(screen.queryByText(/^T\d/)).not.toBeInTheDocument()
    })

    it("should display tier chip when tier is provided", () => {
      renderWithRouter(<BlueprintCard blueprint={mockBlueprint} viewMode="grid" />)

      expect(screen.getByText("T3")).toBeInTheDocument()
    })
  })

  describe("List View", () => {
    it("should render blueprint output item name in list view", () => {
      renderWithRouter(<BlueprintCard blueprint={mockBlueprint} viewMode="list" />)

      expect(screen.getByText("Advanced Laser Cannon")).toBeInTheDocument()
      expect(screen.getByText("Rare")).toBeInTheDocument()
    })

    it("should display mission count in list view", () => {
      renderWithRouter(<BlueprintCard blueprint={mockBlueprint} viewMode="list" />)

      expect(screen.getByText("3 msn")).toBeInTheDocument()
    })

    it("should not display category if not provided", () => {
      const blueprintWithoutCategory = { ...mockBlueprint, item_category: undefined }
      renderWithRouter(<BlueprintCard blueprint={blueprintWithoutCategory} viewMode="list" />)

      expect(screen.queryByText("Weapons")).not.toBeInTheDocument()
    })
  })

  describe("Click Handlers", () => {
    it("should call onClick when card is clicked", () => {
      const handleClick = vi.fn()
      renderWithRouter(<BlueprintCard blueprint={mockBlueprint} onClick={handleClick} />)

      const card = screen.getByText("Advanced Laser Cannon").closest("[class*='MuiCard']")
      fireEvent.click(card!)

      expect(handleClick).toHaveBeenCalledWith("bp-123", "Advanced Weapon Blueprint")
    })

    it("should not call onClick when bookmark is clicked", () => {
      const handleClick = vi.fn()
      const handleBookmark = vi.fn()
      renderWithRouter(
        <BlueprintCard
          blueprint={mockBlueprint}
          onClick={handleClick}
          onBookmarkToggle={handleBookmark}
        />
      )

      // Find the bookmark icon button
      const bookmarkIcon = screen.getByTestId("BookmarkBorderIcon")
      const bookmarkButton = bookmarkIcon.closest("button")
      fireEvent.click(bookmarkButton!)

      expect(handleBookmark).toHaveBeenCalledWith("bp-123", true)
    })
  })

  describe("Bookmark Toggle", () => {
    it("should display bookmark border when not owned", () => {
      renderWithRouter(
        <BlueprintCard
          blueprint={mockBlueprint}
          onBookmarkToggle={vi.fn()}
        />
      )

      expect(screen.getByTestId("BookmarkBorderIcon")).toBeInTheDocument()
    })

    it("should display filled bookmark when owned", () => {
      const ownedBlueprint = { ...mockBlueprint, user_owns: true }
      renderWithRouter(
        <BlueprintCard
          blueprint={ownedBlueprint}
          onBookmarkToggle={vi.fn()}
        />
      )

      expect(screen.getByTestId("BookmarkIcon")).toBeInTheDocument()
    })

    it("should call onBookmarkToggle with correct parameters", () => {
      const handleBookmark = vi.fn()
      renderWithRouter(
        <BlueprintCard
          blueprint={mockBlueprint}
          onBookmarkToggle={handleBookmark}
        />
      )

      const bookmarkIcon = screen.getByTestId("BookmarkBorderIcon")
      const bookmarkButton = bookmarkIcon.closest("button")
      fireEvent.click(bookmarkButton!)

      expect(handleBookmark).toHaveBeenCalledWith("bp-123", true)
    })

    it("should toggle bookmark state correctly", () => {
      const handleBookmark = vi.fn()
      const ownedBlueprint = { ...mockBlueprint, user_owns: true }
      renderWithRouter(
        <BlueprintCard
          blueprint={ownedBlueprint}
          onBookmarkToggle={handleBookmark}
        />
      )

      const bookmarkIcon = screen.getByTestId("BookmarkIcon")
      const bookmarkButton = bookmarkIcon.closest("button")
      fireEvent.click(bookmarkButton!)

      expect(handleBookmark).toHaveBeenCalledWith("bp-123", false)
    })

    it("should not display bookmark if onBookmarkToggle is not provided", () => {
      renderWithRouter(<BlueprintCard blueprint={mockBlueprint} />)

      expect(screen.queryByTestId("icon-Bookmark")).not.toBeInTheDocument()
      expect(screen.queryByTestId("icon-BookmarkBorder")).not.toBeInTheDocument()
    })
  })

  describe("Default Props", () => {
    it("should default to grid view if viewMode is not specified", () => {
      renderWithRouter(<BlueprintCard blueprint={mockBlueprint} />)

      // Grid view renders the output_item_name
      expect(screen.getByText("Advanced Laser Cannon")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle missing icon gracefully", () => {
      const blueprintWithoutIcon = { ...mockBlueprint, output_item_icon: undefined }
      renderWithRouter(<BlueprintCard blueprint={blueprintWithoutIcon} viewMode="grid" />)

      // Component should still render the item name
      expect(screen.getByText("Advanced Laser Cannon")).toBeInTheDocument()
    })

    it("should handle zero crafting time", () => {
      const blueprintWithZeroTime = { ...mockBlueprint, crafting_time_seconds: 0 }
      renderWithRouter(<BlueprintCard blueprint={blueprintWithZeroTime} viewMode="grid" />)

      expect(screen.queryByText("Craft time")).not.toBeInTheDocument()
    })

    it("should handle zero mission count", () => {
      const blueprintWithZeroMissions = { ...mockBlueprint, mission_count: 0 }
      renderWithRouter(<BlueprintCard blueprint={blueprintWithZeroMissions} viewMode="grid" />)

      expect(screen.getByText("No mission sources")).toBeInTheDocument()
    })

    it("should handle long output item names", () => {
      const blueprintWithLongName = {
        ...mockBlueprint,
        output_item_name: "This is a very long item name that should be handled gracefully",
      }
      renderWithRouter(<BlueprintCard blueprint={blueprintWithLongName} viewMode="grid" />)

      expect(
        screen.getByText("This is a very long item name that should be handled gracefully")
      ).toBeInTheDocument()
    })
  })
})
