/**
 * Unit tests for WikiItemBrowser component
 */

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import { WikiItemBrowser } from "../WikiItemBrowser"
import { wikiApi } from "../../../store/wikiApi"

// Mock store setup
const createMockStore = () => {
  return configureStore({
    reducer: {
      [wikiApi.reducerPath]: wikiApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(wikiApi.middleware),
  })
}

// Mock data
const mockItemsResponse = {
  items: [
    {
      id: "item-1",
      name: "Test Weapon",
      type: "WeaponGun",
      size: "3",
      grade: "A",
      manufacturer: "Aegis Dynamics",
      image_url: "https://example.com/weapon.jpg",
    },
    {
      id: "item-2",
      name: "Test Shield",
      type: "Shield",
      size: "2",
      grade: "B",
      manufacturer: "Origin Jumpworks",
      image_url: "https://example.com/shield.jpg",
    },
  ],
  total: 2,
  page: 1,
  page_size: 20,
}

describe("WikiItemBrowser", () => {
  let store: ReturnType<typeof createMockStore>

  beforeEach(() => {
    store = createMockStore()
  })

  it("renders the component with title and description", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiItemBrowser />
        </BrowserRouter>
      </Provider>
    )

    expect(screen.getByText("Game Items Database")).toBeInTheDocument()
    expect(
      screen.getByText("Browse all game items with detailed stats and information")
    ).toBeInTheDocument()
  })

  it("renders filter controls", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiItemBrowser />
        </BrowserRouter>
      </Provider>
    )

    // Check that filter section exists
    expect(screen.getByPlaceholderText("Search by name...")).toBeInTheDocument()
    expect(screen.getAllByText("Type").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Size").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Grade").length).toBeGreaterThan(0)
  })

  it("displays loading state", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiItemBrowser />
        </BrowserRouter>
      </Provider>
    )

    // Should show loading indicator initially
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })
})
