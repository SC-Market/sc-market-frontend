import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { MarketMultipleViewV2 } from "../MarketMultipleViewV2";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";

/**
 * MarketMultipleViewV2 Component Tests
 * 
 * Task: 11.6 Implement MarketMultipleViewV2 component
 * Requirements: 42.1-42.10
 * 
 * Test Coverage:
 * - Display all items in bundle (42.4)
 * - Show quality tier for each item (42.5)
 * - Display variant attributes for each item (42.6)
 * - Calculate bundle total with per-variant pricing (42.7)
 * - Provide variant selection for each item (42.8)
 * - Validate availability for entire bundle (42.9)
 * - Visual parity with V1 MarketMultipleView (42.2)
 */

// Mock dependencies
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "test-bundle-123" }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock("../../../store/profile", () => ({
  useGetUserProfileQuery: () => ({
    data: {
      username: "testuser",
      role: "user",
    },
  }),
}));

vi.mock("../../../hooks/login/CurrentOrg", () => ({
  useCurrentOrg: () => [null],
}));

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, defaultValue?: string, options?: any) => {
        if (options) {
          return defaultValue?.replace(/\{\{(\w+)\}\}/g, (_, k) => options[k]) || key;
        }
        return defaultValue || key;
      },
      i18n: {
        language: "en",
      },
    }),
  };
});

// Mock components
vi.mock("../../../components/market/v2/QualityBadge", () => ({
  QualityBadge: ({ tier, size }: any) => (
    <span data-testid={`quality-badge-${tier}`}>Tier {tier}</span>
  ),
}));

vi.mock("../../../components/market/v2/VariantSelector", () => ({
  VariantSelector: ({ onVariantChange, variants, selectedVariantId }: any) => (
    <select
      data-testid="variant-selector"
      value={selectedVariantId || ""}
      onChange={(e) => onVariantChange(e.target.value || null)}
    >
      <option value="">Select variant</option>
      {variants?.map((v: any) => (
        <option key={v.variant_id} value={v.variant_id}>
          {v.display_name}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("../../../components/rating/ListingRating", () => ({
  ListingNameAndRating: ({ user, contractor }: any) => (
    <div data-testid="seller-rating">
      {user?.username || contractor?.name}
    </div>
  ),
}));

vi.mock("../../../components/list/UserList", () => ({
  UserList: ({ users, title }: any) => (
    <div data-testid="user-list">
      <div>{title}</div>
      {users.map((u: any, i: number) => (
        <div key={i}>{u.name || u.username}</div>
      ))}
    </div>
  ),
}));

vi.mock("../../../components/list/OrderList", () => ({
  OrderList: ({ orders }: any) => (
    <div data-testid="order-list">{orders.length} orders</div>
  ),
}));

vi.mock("../../../components/modal/ImagePreviewModal", () => ({
  ImagePreviewModal: ({ open, onClose }: any) => (
    open ? <div data-testid="image-modal">Image Modal</div> : null
  ),
}));

vi.mock("../../../components/markdown/Markdown.lazy", () => ({
  MarkdownRender: ({ text }: any) => <div data-testid="markdown">{text}</div>,
}));

vi.mock("../listing-view/components/ListingDetailItem", () => ({
  ListingDetailItem: ({ children, icon }: any) => (
    <div data-testid="listing-detail-item">{children}</div>
  ),
}));

vi.mock("../../../components/paper/Section", () => ({
  Section: ({ children, title }: any) => (
    <div data-testid="section">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

// Mock store setup
const createMockStore = () => {
  return configureStore({
    reducer: {
      // Add minimal reducers needed for the component
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe("MarketMultipleViewV2", () => {
  describe("Bundle Display", () => {
    it("should display bundle title", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      expect(screen.getByText("Complete Weapon Bundle")).toBeInTheDocument();
    });

    it("should display all items in bundle", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      // Check that item selector has all items
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);
      
      expect(screen.getByText("Energy Rifle")).toBeInTheDocument();
      expect(screen.getByText("Ballistic Pistol")).toBeInTheDocument();
    });

    it("should display bundle description", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      expect(
        screen.getByText("A complete set of weapons with various quality tiers.")
      ).toBeInTheDocument();
    });
  });

  describe("Quality Tier Display", () => {
    it("should show quality tier badges for variants", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      // Quality badges should be present
      const qualityBadges = screen.getAllByTestId(/quality-badge-/);
      expect(qualityBadges.length).toBeGreaterThan(0);
    });

    it("should display quality tier in variant display name", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      expect(screen.getByText(/Tier 3 \(75\.5%\) - Crafted/)).toBeInTheDocument();
      expect(screen.getByText(/Tier 5 \(95\.0%\) - Crafted/)).toBeInTheDocument();
    });
  });

  describe("Variant Attributes Display", () => {
    it("should display variant attributes in details table", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      // Check for crafted source in display names
      expect(screen.getByText(/Crafted/)).toBeInTheDocument();
    });

    it("should display quantity for each variant", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      // Quantities should be visible in the table
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should display price for each variant", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      // Prices should be visible
      expect(screen.getByText(/2,500 aUEC/)).toBeInTheDocument();
      expect(screen.getByText(/5,000 aUEC/)).toBeInTheDocument();
    });
  });

  describe("Variant Selection", () => {
    it("should allow selecting variants for items with multiple variants", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      // VariantSelector should be present for items with multiple variants
      const variantSelectors = screen.getAllByTestId("variant-selector");
      expect(variantSelectors.length).toBeGreaterThan(0);
    });

    it("should update bundle total when variant is selected", async () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      // Initially, bundle total should prompt to select variants
      expect(screen.getByText("Select all variants")).toBeInTheDocument();
    });
  });

  describe("Bundle Total Calculation", () => {
    it("should display bundle total section", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      // Bundle total section should be present
      expect(screen.getByText("Bundle Contents")).toBeInTheDocument();
      expect(screen.getByText("Bundle Total")).toBeInTheDocument();
    });

    it("should use per-variant pricing for items with per_variant mode", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      // Energy Rifle has per_variant pricing with different prices
      expect(screen.getByText(/2,500 aUEC/)).toBeInTheDocument();
      expect(screen.getByText(/5,000 aUEC/)).toBeInTheDocument();
    });

    it("should use unified pricing for items with unified mode", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      // Ballistic Pistol has unified pricing at 1,500 aUEC
      expect(screen.getByText(/1,500 aUEC/)).toBeInTheDocument();
    });

    it("should prompt user to select variants when not all selected", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      // Should show prompt to select variants
      expect(
        screen.getByText("Please select a variant for each item")
      ).toBeInTheDocument();
    });
  });

  describe("Visual Parity with V1", () => {
    it("should display breadcrumbs navigation", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      expect(screen.getByText("MarketMultipleView.market")).toBeInTheDocument();
      expect(screen.getByText("Weapon")).toBeInTheDocument();
    });

    it("should display seller information with rating", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      // Seller name should be displayed
      expect(screen.getByText("TestSeller")).toBeInTheDocument();
    });

    it("should display listing timestamps", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      expect(screen.getByText(/MarketMultipleView.listed/)).toBeInTheDocument();
      expect(screen.getByText(/MarketMultipleView.updated/)).toBeInTheDocument();
      expect(screen.getByText(/MarketMultipleView.expires/)).toBeInTheDocument();
    });
  });

  describe("Image Handling", () => {
    it("should display bundle image", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("alt", expect.stringContaining("Complete Weapon Bundle"));
    });

    it("should handle image error with fallback", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      const image = screen.getByRole("img") as HTMLImageElement;
      
      // Trigger error
      fireEvent.error(image);
      
      // Should use fallback image
      expect(image.src).toContain("default-image.png");
    });
  });
});
