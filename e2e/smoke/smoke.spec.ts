/**
 * Read-only smoke flows against the production build with the fake API
 * (e2e/support/fakeApi.ts). Waits use the page-ready signal, never sleeps.
 */
import { expect, main, test, waitForReady } from "../support/test"
import { LISTINGS } from "../support/marketFixtures"

const [RIFLE, PEN] = LISTINGS

test.describe("logged out", () => {
  test("home loads with recent listings", async ({ page }) => {
    await page.goto("/")
    await waitForReady(page)
    await expect(page).toHaveTitle(/SC Market/)
    await expect(main(page).getByText(RIFLE.title).first()).toBeVisible()
  })

  test("market search auto-applies text and filters", async ({ page, api }) => {
    await page.goto("/market")
    await waitForReady(page)
    const cards = main(page).getByTestId("listing-card")
    await expect(cards).toHaveCount(LISTINGS.length)

    // Typing applies the search on its own (debounced, no submit button).
    await main(page)
      .getByRole("combobox", { name: "Search", exact: true })
      .fill("rifle")
    await expect(page).toHaveURL(/[?&]text=rifle/)
    await waitForReady(page)
    await expect(cards).toHaveCount(1)
    await expect(cards.first()).toHaveAttribute("data-id", RIFLE.id)

    // A sidebar filter goes into the URL and the request.
    await main(page).getByRole("textbox", { name: "Min Quantity" }).fill("5")
    await expect(page).toHaveURL(/quantity_?[mM]in|quantityAvailable/)
    await waitForReady(page)
    await expect
      .poll(() =>
        api.requests.some((r) => /listings\/search\?.*quantity_min=5/.test(r)),
      )
      .toBe(true)
  })

  test("market grid scrolls with the page, in one full-height scroller", async ({
    page,
  }) => {
    await page.goto("/market")
    await waitForReady(page)
    await expect(main(page).getByTestId("listing-card").first()).toBeVisible()
    const layout = await page.evaluate(() => {
      const scroller = document.querySelector<HTMLElement>(
        "main#main-content [data-page-scroll]",
      )!
      const area = scroller.parentElement!
      const card = document.querySelector('[data-testid="listing-card"]')!
      // Every element between the first card and the scroller
      const clipping: string[] = []
      for (let el = card.parentElement; el && el !== scroller; ) {
        const { overflowY } = getComputedStyle(el)
        if (overflowY === "auto" || overflowY === "scroll") {
          clipping.push(el.className)
        }
        el = el.parentElement
      }
      return {
        scrollerHeight: scroller.getBoundingClientRect().height,
        areaHeight: area.getBoundingClientRect().height,
        areaScrolls: area.scrollHeight > area.clientHeight,
        clipping,
      }
    })
    // The page's scroller fills the page area (nothing pads it shorter)
    expect(layout.scrollerHeight).toBe(layout.areaHeight)
    // ...and is the only scroller: no nested scroll box around the grid
    expect(layout.areaScrolls).toBe(false)
    expect(layout.clipping).toEqual([])
  })

  test("listing detail", async ({ page }) => {
    await page.goto(`/market/${RIFLE.id}`)
    await waitForReady(page)
    await expect(
      main(page).getByRole("heading", { level: 1, name: RIFLE.title }),
    ).toBeVisible()
  })

  test("guides directory and a guide", async ({ page }) => {
    await page.goto("/guides")
    await waitForReady(page)
    const directory = page.getByRole("navigation", { name: "All guides" })
    await expect(directory).toBeVisible()
    // After a navigation: wait for the new URL, then for ready (the signal
    // goes busy together with the URL change). Under heavy
    // parallel load a click on the directory occasionally didn't navigate;
    // retry the click rather than fail the whole flow on it.
    await expect(async () => {
      await directory.getByRole("link", { name: /^Buying\b/ }).click()
      await expect(page).toHaveURL(/\/guides\/buying$/, { timeout: 2000 })
    }).toPass({ timeout: 15_000 })
    await waitForReady(page)
    // A guide in the category, then its content.
    await main(page)
      .getByRole("link", { name: /buy an item/i })
      .first()
      .click()
    await expect(page).toHaveURL(/\/guides\/buying\/[^/]+$/)
    await waitForReady(page)
    await expect(main(page).getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("unknown route shows the 404 page", async ({ page }) => {
    await page.goto("/this/route/does/not/exist")
    await waitForReady(page)
    await expect(main(page).getByRole("heading", { name: /404/ })).toBeVisible()
  })
})

test.describe("logged in (fake session)", () => {
  test.use({ session: "user" })

  test("add to cart, then remove it", async ({ page, api }) => {
    await page.goto(`/market/${PEN.id}`)
    await waitForReady(page)
    await main(page).getByRole("button", { name: /^Add/ }).first().click()
    const drawer = page.getByRole("dialog", { name: "Add to Cart" })
    await drawer.getByRole("button", { name: "Add to Cart" }).click()
    await expect.poll(() => api.cart.size).toBe(1)

    await page.goto("/market/cart")
    await waitForReady(page)
    const item = main(page).getByTestId("cart-item")
    await expect(item).toHaveCount(1)
    await item
      .getByRole("button", { name: `Remove ${PEN.title} from cart` })
      .click()
    await expect.poll(() => api.cart.size).toBe(0)
    await expect(
      main(page).getByRole("heading", { name: "Your cart is empty" }),
    ).toBeVisible()
  })

  test("org-only route without a current org explains what to do", async ({
    page,
  }) => {
    await page.goto("/org/fleet")
    await waitForReady(page)
    await expect(
      main(page).getByRole("heading", {
        name: "Select or join an organization to use this page",
      }),
    ).toBeVisible()
    await expect(
      main(page).getByRole("link", { name: "Choose an organization" }),
    ).toHaveAttribute("href", "/my-orgs")
    await main(page).getByRole("link", { name: "Browse organizations" }).click()
    await expect(page).toHaveURL(/\/contractors$/)
    await waitForReady(page)
  })

  test("settings tabs render", async ({ page }) => {
    await page.goto("/settings")
    await waitForReady(page)
    const tabs = page.getByRole("navigation", { name: "Settings sections" })
    for (const name of [
      "Profile",
      "Privacy",
      "Notifications",
      "Price Alerts",
      "Blocked Users",
    ]) {
      await tabs.getByRole("button", { name, exact: true }).click()
      await expect(main(page).getByRole("tabpanel")).toBeVisible()
    }
  })
})
