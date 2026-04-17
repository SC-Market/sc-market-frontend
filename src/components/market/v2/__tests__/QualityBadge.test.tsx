import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { QualityBadge } from "../QualityBadge";
import { mainTheme } from "../../../../hooks/styles/theme";

describe("QualityBadge", () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={mainTheme}>{component}</ThemeProvider>);
  };

  it("renders tier 1 badge with warning color", () => {
    renderWithTheme(<QualityBadge tier={1} />);
    expect(screen.getByText("Tier 1")).toBeInTheDocument();
  });

  it("renders tier 2 badge with default color", () => {
    renderWithTheme(<QualityBadge tier={2} />);
    expect(screen.getByText("Tier 2")).toBeInTheDocument();
  });

  it("renders tier 3 badge with info color", () => {
    renderWithTheme(<QualityBadge tier={3} />);
    expect(screen.getByText("Tier 3")).toBeInTheDocument();
  });

  it("renders tier 4 badge with primary color", () => {
    renderWithTheme(<QualityBadge tier={4} />);
    expect(screen.getByText("Tier 4")).toBeInTheDocument();
  });

  it("renders tier 5 badge with secondary color", () => {
    renderWithTheme(<QualityBadge tier={5} />);
    expect(screen.getByText("Tier 5")).toBeInTheDocument();
  });

  it("renders nothing for null tier", () => {
    const { container } = renderWithTheme(<QualityBadge tier={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for undefined tier", () => {
    const { container } = renderWithTheme(<QualityBadge tier={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for tier below 1", () => {
    const { container } = renderWithTheme(<QualityBadge tier={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for tier above 5", () => {
    const { container } = renderWithTheme(<QualityBadge tier={6} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders small size badge", () => {
    renderWithTheme(<QualityBadge tier={3} size="small" />);
    const badge = screen.getByText("Tier 3");
    expect(badge).toBeInTheDocument();
  });

  it("renders outlined variant", () => {
    renderWithTheme(<QualityBadge tier={3} variant="outlined" />);
    const badge = screen.getByText("Tier 3");
    expect(badge).toBeInTheDocument();
  });
});
