/**
 * Regression: the layouts used to splice the user's first org membership
 * (profile.contractors[0]) into the breadcrumbs, so /recruiting read
 * "Recruiting Orgs › MEDRUNNER SERVICES" with no org selected anywhere.
 * Breadcrumbs are exactly what the page passes.
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { describe, it, expect, vi } from "vitest"
import { StandardPageLayout } from "../StandardPageLayout"
import { BannerPageLayout } from "../BannerPageLayout"
import { DrawerOpenContext } from "../../../hooks/layout/Drawer"

vi.mock("../../../hooks/login/useSession", () => ({
  useSession: () => ({
    status: "authenticated",
    profile: {
      username: "member",
      contractors: [{ spectrum_id: "MEDRUNNER", name: "MEDRUNNER SERVICES" }],
    },
  }),
}))
vi.mock("../../metadata/Page", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock("../../../pages/errors/ErrorPage", () => ({
  ErrorPage: () => <div>Error Page</div>,
}))
vi.mock("../../footer/Footer", () => ({ Footer: () => <div /> }))

const theme = createTheme({ layoutSpacing: { component: 2, layout: 3 } })

function Wrapper({ children }: { children: React.ReactNode }) {
  const drawer = React.useState(false)
  return (
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={["/recruiting"]}>
        <DrawerOpenContext.Provider value={drawer}>
          {children}
        </DrawerOpenContext.Provider>
      </MemoryRouter>
    </ThemeProvider>
  )
}

describe("layout breadcrumbs never add an org the page didn't pass", () => {
  it("StandardPageLayout: /recruiting shows only its own crumb for an org member", () => {
    render(
      <Wrapper>
        <StandardPageLayout breadcrumbs={[{ label: "Recruiting Orgs" }]}>
          <div>content</div>
        </StandardPageLayout>
      </Wrapper>,
    )
    // A one-item trail renders no breadcrumb bar at all (PageBreadcrumbs)
    expect(screen.queryByText("Recruiting Orgs")).not.toBeInTheDocument()
    expect(screen.queryByText("MEDRUNNER SERVICES")).not.toBeInTheDocument()
  })

  it("StandardPageLayout: a two-item trail renders exactly those items", () => {
    render(
      <Wrapper>
        <StandardPageLayout
          breadcrumbs={[
            { label: "Recruiting", href: "/recruiting" },
            { label: "Create post" },
          ]}
        >
          <div>content</div>
        </StandardPageLayout>
      </Wrapper>,
    )
    expect(screen.getByText("Create post")).toBeInTheDocument()
    expect(screen.queryByText("MEDRUNNER SERVICES")).not.toBeInTheDocument()
  })

  it("BannerPageLayout: same for banner pages", () => {
    render(
      <Wrapper>
        <BannerPageLayout
          breadcrumbs={[
            { label: "Market", href: "/market" },
            { label: "Cart" },
          ]}
        >
          <div>content</div>
        </BannerPageLayout>
      </Wrapper>,
    )
    expect(screen.getByText("Cart")).toBeInTheDocument()
    expect(screen.queryByText("MEDRUNNER SERVICES")).not.toBeInTheDocument()
  })
})
