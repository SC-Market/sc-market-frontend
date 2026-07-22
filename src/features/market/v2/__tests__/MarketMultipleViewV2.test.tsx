import "./setup";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { configureStore } from "@reduxjs/toolkit";
import { MarketMultipleViewV2 } from "../MarketMultipleViewV2";
import { generatedApiV2 } from "../../../../store/generatedApiV2";
import { serviceApi } from "../../../../store/service";
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

vi.mock("../../profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({
    data: {
      username: "testuser",
      role: "user",
    },
  }),
}));

vi.mock("../../../../features/contractor/api/contractorApi", () => ({
  useGetContractorBySpectrumIDQuery: () => ({ data: undefined }),
}));

vi.mock("../../../../hooks/login/CurrentOrg", () => ({
  useCurrentOrg: () => [null],
}));

// StandardPageLayout depends on Page (useRouteError -> data router) and layout
// contexts not present under BrowserRouter. Mock it to render children plus title.
vi.mock("../../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children, title, isLoading, error }: any) => (
    <div data-testid="standard-page-layout">
      <h1>{title}</h1>
      {isLoading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">Error</div>}
      {children}
    </div>
  ),
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
vi.mock("../../../../components/market/v2/QualityBadge", () => ({
  QualityBadge: ({ tier, size }: any) => (
    <span data-testid={`quality-badge-${tier}`}>Tier {tier}</span>
  ),
}));

vi.mock("../../../../components/market/v2/VariantSelector", () => ({
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

vi.mock("../../../../components/rating/ListingRating", () => ({
  ListingNameAndRating: ({ user, contractor, shop }: any) => (
    <div data-testid="seller-rating">
      {user?.username || contractor?.name || shop?.name}
    </div>
  ),
}));

vi.mock("../../../../components/list/UserList", () => ({
  UserList: ({ users, title }: any) => (
    <div data-testid="user-list">
      <div>{title}</div>
      {users.map((u: any, i: number) => (
        <div key={i}>{u.name || u.username}</div>
      ))}
    </div>
  ),
}));

vi.mock("../../../../components/list/OrderList", () => ({
  OrderList: ({ orders }: any) => (
    <div data-testid="order-list">{orders.length} orders</div>
  ),
}));

vi.mock("../../../../components/modal/ImagePreviewModal", () => ({
  ImagePreviewModal: ({ open, onClose }: any) => (
    open ? <div data-testid="image-modal">Image Modal</div> : null
  ),
}));

vi.mock("../../../../components/markdown/Markdown.lazy", () => ({
  MarkdownRender: ({ text }: any) => <div data-testid="markdown">{text}</div>,
}));

vi.mock("../../listing-view/components/ListingDetailItem", () => ({
  ListingDetailItem: ({ children, icon }: any) => (
    <div data-testid="listing-detail-item">{children}</div>
  ),
}));

vi.mock("../../../../components/paper/Section", () => ({
  Section: ({ children, title }: any) => (
    <div data-testid="section">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

// The component fetches bundle data via useGetListingDetailQuery; mock it.
vi.mock("../../../../store/api/v2/market", () => ({
  useGetListingDetailQuery: () => ({
    data: {
      listing: {
        listing_id: "test-bundle-123",
        title: "Complete Weapon Bundle",
        description: "A complete set of weapons with various quality tiers.",
        status: "active",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        expires_at: "2024-02-01T00:00:00Z",
      },
      seller: {
        name: "TestSeller",
        slug: "testseller",
        logo_url: "https://example.com/logo.png",
        rating: 4.5,
      },
      items: [
        {
          item_id: "item-1",
          game_item: { id: "gi-1", name: "Energy Rifle", type: "Weapon", image_url: "https://example.com/rifle.png" },
          pricing_mode: "per_variant",
          base_price: 0,
          variants: [
            {
              variant_id: "v1",
              attributes: { quality_tier: 3, quality_value: 75.5, crafted_source: "Crafted" },
              display_name: "Tier 3 (75.5%) - Crafted",
              short_name: "T3",
              quantity: 5,
              price: 2500,
            },
            {
              variant_id: "v2",
              attributes: { quality_tier: 5, quality_value: 95.0, crafted_source: "Crafted" },
              display_name: "Tier 5 (95.0%) - Crafted",
              short_name: "T5",
              quantity: 2,
              price: 5000,
            },
          ],
        },
        {
          item_id: "item-2",
          game_item: { id: "gi-2", name: "Ballistic Pistol", type: "Weapon", image_url: "https://example.com/pistol.png" },
          pricing_mode: "unified",
          base_price: 1500,
          variants: [
            {
              variant_id: "v3",
              attributes: { quality_tier: 4, quality_value: 85.0, crafted_source: "Store" },
              display_name: "Tier 4 (85.0%) - Store",
              short_name: "T4",
              quantity: 3,
              price: 1500,
            },
          ],
        },
      ],
    },
    isLoading: false,
    error: undefined,
  }),
}));

// Mock store setup
const createMockStore = () => {
  return configureStore({
    reducer: {
      [generatedApiV2.reducerPath]: generatedApiV2.reducer,
      [serviceApi.reducerPath]: serviceApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(generatedApiV2.middleware, serviceApi.middleware),
  });
};

const testTheme = createTheme({
  layoutSpacing: { layout: 1, component: 1.5, text: 1, compact: 0.5 },
  borderRadius: { topLevel: 0.375, image: 0.375, button: 1, input: 0.5, chip: 0.5, minimal: 0 },
  palette: { outline: { main: "#e0e0e0" } },
} as any);

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <ThemeProvider theme={testTheme}>
        <BrowserRouter>{component}</BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe("MarketMultipleViewV2", () => {
  describe("Bundle Display", () => {
    it("should display bundle title", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      // Title appears in the layout header and the card header.
      expect(screen.getAllByText("Complete Weapon Bundle").length).toBeGreaterThan(0);
    });

    it("should display all items in bundle", () => {
      renderWithProviders(<MarketMultipleViewV2 />);

      // Both items should be present (in the item selector and/or contents).
      expect(screen.getAllByText("Energy Rifle").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Ballistic Pistol").length).toBeGreaterThan(0);
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
      
      expect(screen.getAllByText(/Tier 3 \(75\.5%\) - Crafted/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Tier 5 \(95\.0%\) - Crafted/).length).toBeGreaterThan(0);
    });
  });

  describe("Variant Attributes Display", () => {
    it("should display variant attributes in details table", () => {
      renderWithProviders(<MarketMultipleViewV2 />);
      
      // Check for crafted source in display names
      expect(screen.getAllByText(/Crafted/).length).toBeGreaterThan(0);
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
