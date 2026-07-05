/**
 * Unit tests for WikiItemBrowser component
 */

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import { vi } from "vitest"
import { WikiItemBrowser } from "../WikiItemBrowser"
import { marketV2Api } from "../../../store/api/v2/market"
import { serviceApi } from "../../../store/service"
import { generatedApiV2 } from "../../../store/generatedApiV2"

// Mock Page to avoid serviceApi dependency
vi.mock("../../../components/metadata/Page", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock StandardPageLayout to avoid serviceApi/profileApi dependencies
vi.mock("../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children, title, headerTitle }: { children: React.ReactNode; title?: string; headerTitle?: string }) => <div><h1>{headerTitle || title}</h1>{children}</div>,
}))

// Mock react-i18next
vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next")
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, def?: string) => def || key,
      i18n: { language: "en", changeLanguage: vi.fn() },
    }),
  }
})

// Mock store setup
const createMockStore = () => {
  return configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
      [serviceApi.reducerPath]: serviceApi.reducer,
      [generatedApiV2.reducerPath]: generatedApiV2.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware, serviceApi.middleware, generatedApiV2.middleware),
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

  it("renders the component with title", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiItemBrowser />
        </BrowserRouter>
      </Provider>
    )

    expect(screen.getByText("Game Items Database")).toBeInTheDocument()
  })

  it("renders filter controls", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiItemBrowser />
        </BrowserRouter>
      </Provider>
    )

    // Check that search bar exists with actual placeholder
    expect(screen.getByPlaceholderText("Search items, types, manufacturers...")).toBeInTheDocument()
  })

  it("displays loading state", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiItemBrowser />
        </BrowserRouter>
      </Provider>
    )

    // Should show skeleton loading indicators (MUI Skeleton elements)
    const skeletons = document.querySelectorAll(".MuiSkeleton-root")
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
