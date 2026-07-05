/**
 * Unit tests for WikiShipBrowser component
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import { vi } from "vitest"
import { WikiShipBrowser } from "../WikiShipBrowser"
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

describe("WikiShipBrowser", () => {
  let store: ReturnType<typeof createMockStore>

  beforeEach(() => {
    store = createMockStore()
  })

  it("renders the component with title", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiShipBrowser />
        </BrowserRouter>
      </Provider>
    )

    expect(screen.getByText("Ships & Vehicles")).toBeInTheDocument()
  })

  it("renders search bar", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiShipBrowser />
        </BrowserRouter>
      </Provider>
    )

    expect(screen.getByPlaceholderText("Search ships, vehicles, manufacturers...")).toBeInTheDocument()
  })
})
