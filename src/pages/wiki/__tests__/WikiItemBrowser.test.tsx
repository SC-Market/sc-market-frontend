/**
 * Unit tests for WikiItemBrowser component
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import { vi } from "vitest"
import { WikiItemBrowser } from "../WikiItemBrowser"
import { marketV2Api } from "../../../store/api/v2/market"
import { serviceApi } from "../../../store/service"

// Mock Page to avoid serviceApi dependency
vi.mock("../../../components/metadata/Page", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock StandardPageLayout to avoid serviceApi/profileApi dependencies
vi.mock("../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({
    children,
    title,
    headerTitle,
  }: {
    children: React.ReactNode
    title?: string
    headerTitle?: string
  }) => (
    <div>
      <h1>{headerTitle || title}</h1>
      {children}
    </div>
  ),
}))

// Mock react-i18next
vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

// Mock store setup
const createMockStore = () => {
  return configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
      [serviceApi.reducerPath]: serviceApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        marketV2Api.middleware,
        serviceApi.middleware,
      ),
  })
}

// Mock data

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
      </Provider>,
    )

    expect(screen.getByText("Game Items Database")).toBeInTheDocument()
  })

  it("renders filter controls", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiItemBrowser />
        </BrowserRouter>
      </Provider>,
    )

    // Check that search bar exists with actual placeholder
    expect(
      screen.getByPlaceholderText("Search items, types and manufacturers"),
    ).toBeInTheDocument()
  })

  it("displays loading state", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiItemBrowser />
        </BrowserRouter>
      </Provider>,
    )

    // Should show skeleton loading indicators (MUI Skeleton elements)
    const skeletons = document.querySelectorAll(".MuiSkeleton-root")
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
