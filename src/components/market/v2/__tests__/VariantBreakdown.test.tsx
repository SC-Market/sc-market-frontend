import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { vi } from "vitest";
import { VariantBreakdown } from "../VariantBreakdown";
import { mainTheme } from "../../../../hooks/styles/Theme";

const mockVariants = [
  {
    variant_id: "v1",
    display_name: "Tier 3 (85%) - Crafted",
    short_name: "T3 Crafted",
    attributes: {
      quality_tier: 3,
      quality_value: 85,
      crafted_source: "crafted",
    },
    quantity: 10,
    price: 50000,
    locations: ["Port Olisar", "Lorville"],
  },
  {
    variant_id: "v2",
    display_name: "Tier 5 (95%) - Crafted",
    short_name: "T5 Crafted",
    attributes: {
      quality_tier: 5,
      quality_value: 95,
      crafted_source: "crafted",
    },
    quantity: 5,
    price: 100000,
    locations: ["Area18"],
  },
];

describe("VariantBreakdown", () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={mainTheme}>{component}</ThemeProvider>);
  };

  it("renders empty state when no variants provided", () => {
    renderWithTheme(<VariantBreakdown variants={[]} />);
    expect(screen.getByText("No variants available")).toBeInTheDocument();
  });

  it("renders all variants in table", () => {
    renderWithTheme(<VariantBreakdown variants={mockVariants} />);

    // Component renders quality_value as "{value}/1000" chips
    expect(screen.getByText("85/1000")).toBeInTheDocument();
    expect(screen.getByText("95/1000")).toBeInTheDocument();
  });

  it("displays quality badges for each variant", () => {
    renderWithTheme(<VariantBreakdown variants={mockVariants} />);

    // QualityBadge renders "Tier X" labels
    expect(screen.getByText("Tier 3")).toBeInTheDocument();
    expect(screen.getByText("Tier 5")).toBeInTheDocument();
  });

  it("displays quantities for each variant", () => {
    renderWithTheme(<VariantBreakdown variants={mockVariants} />);

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("displays prices for each variant", () => {
    renderWithTheme(<VariantBreakdown variants={mockVariants} />);

    // formatPrice: 50000 -> "50,000 aUEC", 100000 -> "100K aUEC"
    expect(screen.getByText("50,000 aUEC")).toBeInTheDocument();
    expect(screen.getByText("100K aUEC")).toBeInTheDocument();
  });

  it("displays locations when provided", () => {
    renderWithTheme(<VariantBreakdown variants={mockVariants} />);

    expect(screen.getByText("Port Olisar, Lorville")).toBeInTheDocument();
    expect(screen.getByText("Area18")).toBeInTheDocument();
  });

  it("displays crafted_source as chip", () => {
    renderWithTheme(<VariantBreakdown variants={mockVariants} />);

    // formatCraftedSource("crafted") -> "Crafted"
    const craftedChips = screen.getAllByText("Crafted");
    expect(craftedChips.length).toBe(2);
  });

  it("renders action buttons when showActions is true", () => {
    const onSelectVariant = vi.fn();
    renderWithTheme(
      <VariantBreakdown
        variants={mockVariants}
        onSelectVariant={onSelectVariant}
        showActions={true}
      />
    );

    const addButtons = screen.getAllByText("Add");
    expect(addButtons.length).toBe(2);
  });

  it("does not render action buttons when showActions is false", () => {
    renderWithTheme(
      <VariantBreakdown variants={mockVariants} showActions={false} />
    );

    expect(screen.queryByText("Add")).not.toBeInTheDocument();
  });

  it("calls onSelectVariant when action button is clicked", () => {
    const onSelectVariant = vi.fn();
    renderWithTheme(
      <VariantBreakdown
        variants={mockVariants}
        onSelectVariant={onSelectVariant}
        showActions={true}
      />
    );

    const addButtons = screen.getAllByText("Add");
    fireEvent.click(addButtons[0]);

    expect(onSelectVariant).toHaveBeenCalledWith("v1");
  });

  it("disables action button when quantity is zero", () => {
    const variantWithZeroQty = [
      {
        ...mockVariants[0],
        quantity: 0,
      },
    ];

    const onSelectVariant = vi.fn();
    renderWithTheme(
      <VariantBreakdown
        variants={variantWithZeroQty}
        onSelectVariant={onSelectVariant}
        showActions={true}
      />
    );

    const addButton = screen.getByText("Add");
    expect(addButton).toBeDisabled();
  });

  it("renders table headers", () => {
    renderWithTheme(
      <VariantBreakdown variants={mockVariants} showActions={true} />
    );

    expect(screen.getByText("Variant")).toBeInTheDocument();
    expect(screen.getByText("Quantity")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });
});
