/**
 * axe regression for the base (every-theme) findings of the white-label
 * storefront audit (medrunner.sc-market.space, 2026-11-09), rendered in
 * MEDRUNNER's dark theme:
 * - the rating breakdown's progress bars had no name (aria-progressbar-name)
 * - badge tooltips put aria-label on a role-less div (aria-prohibited-attr)
 * - tabs pointed aria-controls at panels that don't exist
 *   (aria-valid-attr-value)
 * - sidebar lists held links and headings, not list items (list)
 * - review rows were role="checkbox" around links (nested-interactive,
 *   aria-required-children)
 * Colour contrast needs a layout engine; the theme's ratios are covered by
 * hooks/styles/theme/__tests__/roles.test.tsx and the live audit.
 */
import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import { axe } from "jest-axe"
import { MemoryRouter } from "react-router-dom"
import { Tab, Table, TableBody, Tabs, ThemeProvider } from "@mui/material"
import { buildOrgTheme } from "../hooks/styles/themeCache"
import { ReviewSummaryArea } from "../views/contractor/OrgReviews"
import { BadgeDisplay } from "../components/rating/BadgeDisplay"
import { a11yProps } from "../components/tabs/Tabs"
import { SidebarWhiteLabelTabs } from "../components/sidebar/SidebarWhiteLabelTabs"
import { ShopReviewRow } from "../features/shops/components/ShopReviewsTab"
import {
  BADGE_CONSISTENCY_PRO,
  BADGE_RATING_99_9,
  BADGE_SPEED_PRO,
  BADGE_STREAK_PRO,
  BADGE_VOLUME_PRO,
} from "../util/badges"

const theme = buildOrgTheme(
  {
    light: {},
    dark: {
      palette: {
        text: { primary: "#ffffff", secondary: "#6a7282" },
        primary: { main: "#2c5278", contrastText: "#ffffff" },
        background: {
          paper: "#1d2735",
          default: "#1e2939",
          sidebar: "#1d2735",
        },
      },
    },
  },
  "dark",
)

const RULES = [
  "aria-progressbar-name",
  "aria-prohibited-attr",
  "aria-valid-attr-value",
  "list",
  "listitem",
  "nested-interactive",
  "aria-required-children",
]

const contractor = {
  spectrum_id: "MEDRUNNER",
  name: "Medrunner Services",
  avatar: "",
  rating: {
    avg_rating: 50,
    rating_count: 3,
    streak: 3,
    total_orders: 3,
    total_rating: 150,
  },
  badges: { badge_ids: [] },
}

const reviews = [5, 5, 4].map((rating, i) => ({
  review_id: `r${i}`,
  rating,
  content: "Great",
  timestamp: "2026-11-01T00:00:00.000Z",
  user_author: { username: `user${i}`, avatar: "", display_name: `User ${i}` },
}))

describe("white-label storefront ARIA (axe)", () => {
  it("has no violations of the audited rules", async () => {
    const { container } = render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <ReviewSummaryArea
            reviews={reviews as never}
            target={contractor as never}
          />
          <BadgeDisplay
            badges={[
              BADGE_RATING_99_9,
              BADGE_VOLUME_PRO,
              BADGE_STREAK_PRO,
              BADGE_SPEED_PRO,
              BADGE_CONSISTENCY_PRO,
            ]}
          />
          <Tabs value={0} aria-label="Org">
            <Tab label="Store" {...a11yProps(0)} />
            <Tab label="About" {...a11yProps(1)} />
          </Tabs>
          {/* One of the sidebar's lists (the org's own links) */}
          <nav aria-label="Sidebar">
            <SidebarWhiteLabelTabs
              customTabs={[
                {
                  sort_order: 0,
                  custom_path: "https://staff.medrunner.space",
                  custom_label: "Staff Portal",
                } as never,
              ]}
              brandName="Medrunner Services"
              isActive={() => false}
              onNavigate={() => {}}
              itemSx={{} as never}
              sectionHeaderSx={{} as never}
            />
          </nav>
          <Table aria-label="Reviews">
            <TableBody>
              <ShopReviewRow
                row={{
                  review_id: "r1",
                  rating: 5,
                  comment: "Great",
                  created_at: "2026-11-01T00:00:00.000Z",
                  timestamp: 0,
                  author: {
                    avatar: null,
                    display_name: "User",
                    username: "user1",
                    user_id: "u1",
                  },
                }}
                index={0}
                isItemSelected={false}
                labelId="review-0"
              />
            </TableBody>
          </Table>
        </ThemeProvider>
      </MemoryRouter>,
    )
    const results = await axe(container, {
      runOnly: { type: "rule", values: RULES },
    })
    expect(results).toHaveNoViolations()
  })
})
