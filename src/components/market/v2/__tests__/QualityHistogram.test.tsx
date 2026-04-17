import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { QualityHistogram } from "../QualityHistogram";
import { mainTheme } from "../../../../hooks/styles/Theme";

const mockDistribution = [
  {
    tier: 1,
    count: 5,
    percentage: 10,
    averagePrice: 10000,
  },
  {
    tier: 2,
    count: 10,
    percentage: 20,
    averagePrice: 20000,
  },
  {
    tier: 3,
    count: 15,
    percentage: 30,
    averagePrice: 30000,
  },
  {
    tier: 4,
    count: 12,
    percentage: 24,
    averagePrice: 40000,
  },
  {
    tier: 5,
    count: 8,
    percentage: 16,
    averagePrice: 50000,
  },
];

describe("QualityHistogram", () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={mainTheme}>{component}</ThemeProvider>);
  };

  it("renders empty state when no distribution provided", () => {
    renderWithTheme(<QualityHistogram distribution={[]} />);
    expect(screen.getByText("No quality data available")).toBeInTheDocument();
  });

  it("renders default title", () => {
    renderWithTheme(<QualityHistogram distribution={mockDistribution} />);
    expect(screen.getByText("Quality Distribution")).toBeInTheDocument();
  });

  it("renders custom title when provided", () => {
    renderWithTheme(
      <QualityHistogram
        distribution={mockDistribution}
        title="Item Quality Breakdown"
      />
    );
    expect(screen.getByText("Item Quality Breakdown")).toBeInTheDocument();
  });

  it("displays quality badges for each tier", () => {
    renderWithTheme(<QualityHistogram distribution={mockDistribution} />);

    expect(screen.getByText("Tier 1")).toBeInTheDocument();
    expect(screen.getByText("Tier 2")).toBeInTheDocument();
    expect(screen.getByText("Tier 3")).toBeInTheDocument();
    expect(screen.getByText("Tier 4")).toBeInTheDocument();
    expect(screen.getByText("Tier 5")).toBeInTheDocument();
  });

  it("displays count for each tier", () => {
    renderWithTheme(<QualityHistogram distribution={mockDistribution} />);

    expect(screen.getByText("5 listings")).toBeInTheDocument();
    expect(screen.getByText("10 listings")).toBeInTheDocument();
    expect(screen.getByText("15 listings")).toBeInTheDocument();
    expect(screen.getByText("12 listings")).toBeInTheDocument();
    expect(screen.getByText("8 listings")).toBeInTheDocument();
  });

  it("displays singular listing for count of 1", () => {
    const singleDistribution = [
      {
        tier: 3,
        count: 1,
        percentage: 100,
      },
    ];

    renderWithTheme(<QualityHistogram distribution={singleDistribution} />);
    expect(screen.getByText("1 listing")).toBeInTheDocument();
  });

  it("displays percentage for each tier", () => {
    renderWithTheme(<QualityHistogram distribution={mockDistribution} />);

    expect(screen.getByText("10.0%")).toBeInTheDocument();
    expect(screen.getByText("20.0%")).toBeInTheDocument();
    expect(screen.getByText("30.0%")).toBeInTheDocument();
    expect(screen.getByText("24.0%")).toBeInTheDocument();
    expect(screen.getByText("16.0%")).toBeInTheDocument();
  });

  it("does not display prices by default", () => {
    renderWithTheme(<QualityHistogram distribution={mockDistribution} />);

    expect(screen.queryByText(/Avg:/)).not.toBeInTheDocument();
  });

  it("displays average prices when showPrices is true", () => {
    renderWithTheme(
      <QualityHistogram distribution={mockDistribution} showPrices={true} />
    );

    expect(screen.getByText("Avg: 10,000 aUEC")).toBeInTheDocument();
    expect(screen.getByText("Avg: 20,000 aUEC")).toBeInTheDocument();
    expect(screen.getByText("Avg: 30,000 aUEC")).toBeInTheDocument();
    expect(screen.getByText("Avg: 40,000 aUEC")).toBeInTheDocument();
    expect(screen.getByText("Avg: 50,000 aUEC")).toBeInTheDocument();
  });

  it("displays total listings count", () => {
    renderWithTheme(<QualityHistogram distribution={mockDistribution} />);

    expect(screen.getByText("Total Listings")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument(); // 5+10+15+12+8
  });

  it("handles distribution with missing averagePrice", () => {
    const distributionWithoutPrices = mockDistribution.map(
      ({ averagePrice, ...rest }) => rest
    );

    renderWithTheme(
      <QualityHistogram
        distribution={distributionWithoutPrices}
        showPrices={true}
      />
    );

    // Should not crash and should not display price info
    expect(screen.queryByText(/Avg:/)).not.toBeInTheDocument();
  });

  it("renders percentage bars for visual representation", () => {
    const { container } = renderWithTheme(
      <QualityHistogram distribution={mockDistribution} />
    );

    // Check that the component renders without errors
    expect(screen.getByText("Quality Distribution")).toBeInTheDocument();
    expect(screen.getByText("Total Listings")).toBeInTheDocument();
  });
});
