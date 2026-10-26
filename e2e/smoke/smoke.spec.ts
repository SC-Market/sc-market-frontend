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
      await directory.getByRole("link", { name: "Buying", exact: true }).click()
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

  test("settings tabs render", async ({ page }) => {
    await page.goto("/settings")
    await waitForReady(page)
    const tabs = page.getByRole("navigation", { name: "Settings sections" })
    for (const name of [
      "Profile",
      "Privacy",
      "Email Notifications",
      "Price Alerts",
      "Blocked Users",
    ]) {
      await tabs.getByRole("button", { name, exact: true }).click()
      await expect(main(page).getByRole("tabpanel")).toBeVisible()
    }
  })
})
