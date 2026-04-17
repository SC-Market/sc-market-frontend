import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { vi } from "vitest";
import { QualityFilter } from "../QualityFilter";
import { mainTheme } from "../../../../hooks/styles/theme";

describe("QualityFilter", () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={mainTheme}>{component}</ThemeProvider>);
  };

  it("renders min and max tier dropdowns", () => {
    const onMinTierChange = vi.fn();
    const onMaxTierChange = vi.fn();

    renderWithTheme(
      <QualityFilter
        minTier={null}
        maxTier={null}
        onMinTierChange={onMinTierChange}
        onMaxTierChange={onMaxTierChange}
      />
    );

    expect(screen.getByLabelText("Min Tier")).toBeInTheDocument();
    expect(screen.getByLabelText("Max Tier")).toBeInTheDocument();
  });

  it("displays current min tier value", () => {
    const onMinTierChange = vi.fn();
    const onMaxTierChange = vi.fn();

    renderWithTheme(
      <QualityFilter
        minTier={2}
        maxTier={null}
        onMinTierChange={onMinTierChange}
        onMaxTierChange={onMaxTierChange}
      />
    );

    // Material-UI Select uses a hidden input for the actual value
    const hiddenInput = document.querySelector('input[value="2"]') as HTMLInputElement;
    expect(hiddenInput).toBeTruthy();
    expect(hiddenInput?.value).toBe("2");
  });

  it("displays current max tier value", () => {
    const onMinTierChange = vi.fn();
    const onMaxTierChange = vi.fn();

    renderWithTheme(
      <QualityFilter
        minTier={null}
        maxTier={4}
        onMinTierChange={onMinTierChange}
        onMaxTierChange={onMaxTierChange}
      />
    );

    // Material-UI Select uses a hidden input for the actual value
    const hiddenInput = document.querySelector('input[value="4"]') as HTMLInputElement;
    expect(hiddenInput).toBeTruthy();
    expect(hiddenInput?.value).toBe("4");
  });

  it("calls onMinTierChange when min tier is selected", () => {
    const onMinTierChange = vi.fn();
    const onMaxTierChange = vi.fn();

    renderWithTheme(
      <QualityFilter
        minTier={null}
        maxTier={null}
        onMinTierChange={onMinTierChange}
        onMaxTierChange={onMaxTierChange}
      />
    );

    const minTierInput = screen.getByLabelText("Min Tier");
    fireEvent.mouseDown(minTierInput);

    const option = screen.getByText("Tier 3 (Gold)");
    fireEvent.click(option);

    expect(onMinTierChange).toHaveBeenCalledWith(3);
  });

  it("calls onMaxTierChange when max tier is selected", () => {
    const onMinTierChange = vi.fn();
    const onMaxTierChange = vi.fn();

    renderWithTheme(
      <QualityFilter
        minTier={null}
        maxTier={null}
        onMinTierChange={onMinTierChange}
        onMaxTierChange={onMaxTierChange}
      />
    );

    const maxTierInput = screen.getByLabelText("Max Tier");
    fireEvent.mouseDown(maxTierInput);

    const option = screen.getByText("Tier 5 (Diamond)");
    fireEvent.click(option);

    expect(onMaxTierChange).toHaveBeenCalledWith(5);
  });

  it("calls onMinTierChange with null when Any is selected", () => {
    const onMinTierChange = vi.fn();
    const onMaxTierChange = vi.fn();

    renderWithTheme(
      <QualityFilter
        minTier={2}
        maxTier={null}
        onMinTierChange={onMinTierChange}
        onMaxTierChange={onMaxTierChange}
      />
    );

    const minTierInput = screen.getByLabelText("Min Tier");
    fireEvent.mouseDown(minTierInput);

    const anyOption = screen.getAllByText("Any")[0];
    fireEvent.click(anyOption);

    expect(onMinTierChange).toHaveBeenCalledWith(null);
  });

  it("displays Quality Tier label", () => {
    const onMinTierChange = vi.fn();
    const onMaxTierChange = vi.fn();

    renderWithTheme(
      <QualityFilter
        minTier={null}
        maxTier={null}
        onMinTierChange={onMinTierChange}
        onMaxTierChange={onMaxTierChange}
      />
    );

    expect(screen.getByText("Quality Tier")).toBeInTheDocument();
  });
});
