/**
 * BlueprintCard Component Tests
 * 
 * Tests for the BlueprintCard component covering:
 * - Grid and list view rendering
 * - Blueprint metadata display
 * - Bookmark toggle functionality
 * - Click handlers
 * - Responsive behavior
 * 
 * Task 12.2 - Create BlueprintCard component
 */

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { vi } from "vitest"
import { BlueprintCard } from "../BlueprintCard"

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
    it("should render blueprint in grid view", () => {
      render(<BlueprintCard blueprint={mockBlueprint} viewMode="grid" />)

      expect(screen.getByText("Advanced Weapon Blueprint")).toBeInTheDocument()
      expect(screen.getByText("Crafts: Advanced Laser Cannon")).toBeInTheDocument()
      expect(screen.getByText("Rare")).toBeInTheDocument()
      expect(screen.getByText("Tier 3")).toBeInTheDocument()
      expect(screen.getByText("5 ingredients")).toBeInTheDocument()
      expect(screen.getByText("3 missions")).toBeInTheDocument()
      expect(screen.getByText("Crafting time: 3m")).toBeInTheDocument()
    })

    it("should display item icon in grid view", () => {
      render(<BlueprintCard blueprint={mockBlueprint} viewMode="grid" />)

      const icon = screen.getByAltText("Advanced Laser Cannon")
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute("src", "https://example.com/icon.png")
    })

    it("should handle singular ingredient and mission counts", () => {
      const singleBlueprint = {
        ...mockBlueprint,
        ingredient_count: 1,
        mission_count: 1,
      }

      render(<BlueprintCard blueprint={singleBlueprint} viewMode="grid" />)

      expect(screen.getByText("1 ingredient")).toBeInTheDocument()
      expect(screen.getByText("1 mission")).toBeInTheDocument()
    })

    it("should format crafting time correctly", () => {
      const testCases = [
        { seconds: 45, expected: "45s" },
        { seconds: 60, expected: "1m" },
        { seconds: 125, expected: "2m 5s" },
        { seconds: 3600, expected: "60m" },
      ]

      testCases.forEach(({ seconds, expected }) => {
        const blueprint = { ...mockBlueprint, crafting_time_seconds: seconds }
        const { unmount } = render(<BlueprintCard blueprint={blueprint} viewMode="grid" />)
        expect(screen.getByText(`Crafting time: ${expected}`)).toBeInTheDocument()
        unmount()
      })
    })

    it("should not display crafting time if not provided", () => {
      const blueprintWithoutTime = { ...mockBlueprint, crafting_time_seconds: undefined }
      render(<BlueprintCard blueprint={blueprintWithoutTime} viewMode="grid" />)

      expect(screen.queryByText(/Crafting time:/)).not.toBeInTheDocument()
    })

    it("should not display rarity if not provided", () => {
      const blueprintWithoutRarity = { ...mockBlueprint, rarity: undefined }
      render(<BlueprintCard blueprint={blueprintWithoutRarity} viewMode="grid" />)

      expect(screen.queryByText("Rare")).not.toBeInTheDocument()
    })

    it("should not display tier if not provided", () => {
      const blueprintWithoutTier = { ...mockBlueprint, tier: undefined }
      render(<BlueprintCard blueprint={blueprintWithoutTier} viewMode="grid" />)

      expect(screen.queryByText(/Tier/)).not.toBeInTheDocument()
    })
  })

  describe("List View", () => {
    it("should render blueprint in list view", () => {
      render(<BlueprintCard blueprint={mockBlueprint} viewMode="list" />)

      expect(screen.getByText("Advanced Weapon Blueprint")).toBeInTheDocument()
      expect(screen.getByText("Crafts: Advanced Laser Cannon")).toBeInTheDocument()
      expect(screen.getByText("Weapons")).toBeInTheDocument()
      expect(screen.getByText("Rare")).toBeInTheDocument()
      expect(screen.getByText("Tier 3")).toBeInTheDocument()
      expect(screen.getByText("5 ingredients")).toBeInTheDocument()
      expect(screen.getByText("3 missions")).toBeInTheDocument()
      expect(screen.getByText("3m")).toBeInTheDocument()
    })

    it("should display item icon in list view", () => {
      render(<BlueprintCard blueprint={mockBlueprint} viewMode="list" />)

      const icon = screen.getByAltText("Advanced Laser Cannon")
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute("src", "https://example.com/icon.png")
    })

    it("should not display category if not provided", () => {
      const blueprintWithoutCategory = { ...mockBlueprint, item_category: undefined }
      render(<BlueprintCard blueprint={blueprintWithoutCategory} viewMode="list" />)

      expect(screen.queryByText("Weapons")).not.toBeInTheDocument()
    })
  })

  describe("Click Handlers", () => {
    it("should call onClick when card is clicked", () => {
      const handleClick = vi.fn()
      render(<BlueprintCard blueprint={mockBlueprint} onClick={handleClick} />)

      const card = screen.getByText("Advanced Weapon Blueprint").closest(".MuiCard-root")
      fireEvent.click(card!)

      expect(handleClick).toHaveBeenCalledWith("bp-123")
    })

    it("should not call onClick when bookmark is clicked", () => {
      const handleClick = vi.fn()
      const handleBookmark = vi.fn()
      render(
        <BlueprintCard
          blueprint={mockBlueprint}
          onClick={handleClick}
          onBookmarkToggle={handleBookmark}
        />
      )

      const bookmark = screen.getByTestId("BookmarkBorderIcon").closest(".bookmark-toggle")
      fireEvent.click(bookmark!)

      expect(handleBookmark).toHaveBeenCalledWith("bp-123", true)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it("should not be clickable if onClick is not provided", () => {
      const { container } = render(<BlueprintCard blueprint={mockBlueprint} />)

      const card = container.querySelector(".MuiCard-root")
      expect(card).toHaveStyle({ cursor: "default" })
    })
  })

  describe("Bookmark Toggle", () => {
    it("should display bookmark border when not owned", () => {
      render(
        <BlueprintCard
          blueprint={mockBlueprint}
          onBookmarkToggle={vi.fn()}
        />
      )

      expect(screen.getByTestId("BookmarkBorderIcon")).toBeInTheDocument()
    })

    it("should display filled bookmark when owned", () => {
      const ownedBlueprint = { ...mockBlueprint, user_owns: true }
      render(
        <BlueprintCard
          blueprint={ownedBlueprint}
          onBookmarkToggle={vi.fn()}
        />
      )

      expect(screen.getByTestId("BookmarkIcon")).toBeInTheDocument()
    })

    it("should call onBookmarkToggle with correct parameters", () => {
      const handleBookmark = vi.fn()
      render(
        <BlueprintCard
          blueprint={mockBlueprint}
          onBookmarkToggle={handleBookmark}
        />
      )

      const bookmark = screen.getByTestId("BookmarkBorderIcon").closest(".bookmark-toggle")
      fireEvent.click(bookmark!)

      expect(handleBookmark).toHaveBeenCalledWith("bp-123", true)
    })

    it("should toggle bookmark state correctly", () => {
      const handleBookmark = vi.fn()
      const ownedBlueprint = { ...mockBlueprint, user_owns: true }
      render(
        <BlueprintCard
          blueprint={ownedBlueprint}
          onBookmarkToggle={handleBookmark}
        />
      )

      const bookmark = screen.getByTestId("BookmarkIcon").closest(".bookmark-toggle")
      fireEvent.click(bookmark!)

      expect(handleBookmark).toHaveBeenCalledWith("bp-123", false)
    })

    it("should not display bookmark if onBookmarkToggle is not provided", () => {
      render(<BlueprintCard blueprint={mockBlueprint} />)

      expect(screen.queryByTestId("BookmarkIcon")).not.toBeInTheDocument()
      expect(screen.queryByTestId("BookmarkBorderIcon")).not.toBeInTheDocument()
    })
  })

  describe("Default Props", () => {
    it("should default to grid view if viewMode is not specified", () => {
      const { container } = render(<BlueprintCard blueprint={mockBlueprint} />)

      // Grid view has absolute positioned bookmark
      const bookmark = container.querySelector(".bookmark-toggle")
      expect(bookmark).toBeNull() // No bookmark without handler
    })
  })

  describe("Edge Cases", () => {
    it("should handle missing icon gracefully", () => {
      const blueprintWithoutIcon = { ...mockBlueprint, output_item_icon: undefined }
      render(<BlueprintCard blueprint={blueprintWithoutIcon} viewMode="grid" />)

      expect(screen.queryByAltText("Advanced Laser Cannon")).not.toBeInTheDocument()
      expect(screen.getByText("Advanced Weapon Blueprint")).toBeInTheDocument()
    })

    it("should handle zero crafting time", () => {
      const blueprintWithZeroTime = { ...mockBlueprint, crafting_time_seconds: 0 }
      render(<BlueprintCard blueprint={blueprintWithZeroTime} viewMode="grid" />)

      expect(screen.queryByText(/Crafting time:/)).not.toBeInTheDocument()
    })

    it("should handle zero ingredient count", () => {
      const blueprintWithZeroIngredients = { ...mockBlueprint, ingredient_count: 0 }
      render(<BlueprintCard blueprint={blueprintWithZeroIngredients} viewMode="grid" />)

      expect(screen.getByText("0 ingredients")).toBeInTheDocument()
    })

    it("should handle zero mission count", () => {
      const blueprintWithZeroMissions = { ...mockBlueprint, mission_count: 0 }
      render(<BlueprintCard blueprint={blueprintWithZeroMissions} viewMode="grid" />)

      expect(screen.getByText("0 missions")).toBeInTheDocument()
    })

    it("should handle long blueprint names", () => {
      const blueprintWithLongName = {
        ...mockBlueprint,
        blueprint_name: "This is a very long blueprint name that should be handled gracefully",
      }
      render(<BlueprintCard blueprint={blueprintWithLongName} viewMode="grid" />)

      expect(
        screen.getByText("This is a very long blueprint name that should be handled gracefully")
      ).toBeInTheDocument()
    })
  })
})
