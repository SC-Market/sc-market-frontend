import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import {
  CustomDomainContext,
  type CustomDomain,
} from "../../../hooks/contractor/CustomDomain"

vi.mock("../../../features/notifications/hooks/useNotifications", () => ({
  useNotifications: () => ({
    shopsData: [],
    notifications: [],
    total: 0,
    unreadCount: 3,
    page: 0,
    pageSize: 5,
    handleChangePage: vi.fn(),
    handleChangeRowsPerPage: vi.fn(),
    resetPage: vi.fn(),
    scopeFilter: "all",
    setScopeFilter: vi.fn(),
    shopIdFilter: "",
    setShopIdFilter: vi.fn(),
    markAllReadCallback: vi.fn(),
    deleteAllCallback: vi.fn(),
  }),
}))

import { NotificationsButton } from "../NotificationsButton"

const theme = createTheme({
  palette: { outline: { main: "#888888" } },
  borderRadius: {
    topLevel: 0.375,
    image: 0.375,
    button: 1,
    input: 0.5,
    chip: 0.5,
    minimal: 0,
  },
})

function renderOn(domain: CustomDomain) {
  return render(
    <ThemeProvider theme={theme}>
      <CustomDomainContext.Provider value={domain}>
        <MemoryRouter>
          <NotificationsButton />
        </MemoryRouter>
      </CustomDomainContext.Provider>
    </ThemeProvider>,
  )
}

describe("NotificationsButton", () => {
  it("links to the notifications on sc-market.space on an org's domain", () => {
    renderOn({ isCustomDomain: true, customOrg: "MEDRUNNER" })
    const bell = screen.getByRole("link", { name: "Notifications" })
    expect(bell).toHaveAttribute(
      "href",
      "https://sc-market.space/notifications",
    )
    expect(bell).toHaveTextContent("3")
  })

  it("opens the list on the main site", () => {
    renderOn({ isCustomDomain: false, customOrg: undefined })
    expect(
      screen.getByRole("button", { name: "Notifications" }),
    ).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Notifications" })).toBeNull()
  })
})
