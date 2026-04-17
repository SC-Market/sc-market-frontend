import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { vi } from "vitest";
import { VariantSelector } from "../VariantSelector";
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
  },
];

describe("VariantSelector", () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={mainTheme}>{component}</ThemeProvider>);
  };

  it("renders nothing when no variants provided", () => {
    const onVariantChange = vi.fn();
    const { container } = renderWithTheme(
      <VariantSelector
        variants={[]}
        selectedVariantId={null}
        onVariantChange={onVariantChange}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders read-only display for single variant", () => {
    const onVariantChange = vi.fn();
    renderWithTheme(
      <VariantSelector
        variants={[mockVariants[0]]}
        selectedVariantId="v1"
        onVariantChange={onVariantChange}
      />
    );

    expect(screen.getByText("Tier 3 (85%) - Crafted")).toBeInTheDocument();
    expect(screen.getByText("Qty: 10")).toBeInTheDocument();
    expect(screen.getByText("50,000 aUEC")).toBeInTheDocument();
  });

  it("renders dropdown for multiple variants", () => {
    const onVariantChange = vi.fn();
    renderWithTheme(
      <VariantSelector
        variants={mockVariants}
        selectedVariantId="v1"
        onVariantChange={onVariantChange}
      />
    );

    expect(screen.getByLabelText("Select Variant")).toBeInTheDocument();
  });

  it("displays selected variant in dropdown", () => {
    const onVariantChange = vi.fn();
    renderWithTheme(
      <VariantSelector
        variants={mockVariants}
        selectedVariantId="v1"
        onVariantChange={onVariantChange}
      />
    );

    // Material-UI Select uses a hidden input for the actual value
    const hiddenInput = document.querySelector('input[value="v1"]') as HTMLInputElement;
    expect(hiddenInput).toBeTruthy();
    expect(hiddenInput?.value).toBe("v1");
  });

  it("calls onVariantChange when variant is selected", () => {
    const onVariantChange = vi.fn();
    renderWithTheme(
      <VariantSelector
        variants={mockVariants}
        selectedVariantId="v1"
        onVariantChange={onVariantChange}
      />
    );

    const input = screen.getByLabelText("Select Variant");
    fireEvent.mouseDown(input);

    const option = screen.getByText("Tier 5 (95%) - Crafted");
    fireEvent.click(option);

    expect(onVariantChange).toHaveBeenCalledWith("v2");
  });

  it("displays custom label when provided", () => {
    const onVariantChange = vi.fn();
    renderWithTheme(
      <VariantSelector
        variants={mockVariants}
        selectedVariantId="v1"
        onVariantChange={onVariantChange}
        label="Choose Quality"
      />
    );

    expect(screen.getByLabelText("Choose Quality")).toBeInTheDocument();
  });

  it("disables dropdown when disabled prop is true", () => {
    const onVariantChange = vi.fn();
    renderWithTheme(
      <VariantSelector
        variants={mockVariants}
        selectedVariantId="v1"
        onVariantChange={onVariantChange}
        disabled={true}
      />
    );

    const input = screen.getByLabelText("Select Variant");
    // Material-UI uses aria-disabled for disabled state
    expect(input).toHaveAttribute("aria-disabled", "true");
  });

  it("displays quality badges for variants with quality_tier", () => {
    const onVariantChange = vi.fn();
    renderWithTheme(
      <VariantSelector
        variants={mockVariants}
        selectedVariantId="v1"
        onVariantChange={onVariantChange}
      />
    );

    const input = screen.getByLabelText("Select Variant");
    fireEvent.mouseDown(input);

    // Use getAllByText since badges appear in both selected and menu items
    const tier3Badges = screen.getAllByText("Tier 3");
    const tier5Badges = screen.getAllByText("Tier 5");
    expect(tier3Badges.length).toBeGreaterThan(0);
    expect(tier5Badges.length).toBeGreaterThan(0);
  });
});
