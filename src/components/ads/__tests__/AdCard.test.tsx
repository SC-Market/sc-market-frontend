/**
 * The ship image ads show their whole poster: the copy is baked into the
 * image near its edges, so cropping it to the card's shape (object-fit:
 * cover) cut it off. The image is contained, over a decorative blurred copy.
 */
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"
import { AdCard } from "../AdCard"
import { MARKET_ADS } from "../adConfig"
import type { ImageAdConfig } from "../types"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

const imageAds = MARKET_ADS.filter(
  (ad): ad is ImageAdConfig => ad.kind === "image",
)

describe("AdCard image ads", () => {
  it.each(imageAds.map((ad) => [ad.id, ad] as const))(
    "%s shows the whole poster, uncropped, over a decorative backdrop",
    (_id, ad) => {
      render(
        <ThemeProvider theme={mainTheme}>
          <AdCard ad={ad} index={0} noGridWrapper />
        </ThemeProvider>,
      )
      const poster = screen.getByRole("img", { name: `Ad: ${ad.title}` })
      expect(getComputedStyle(poster).objectFit).toBe("contain")
      expect(getComputedStyle(poster).width).toBe("100%")
      expect(getComputedStyle(poster).height).toBe("100%")

      // The backdrop is the same picture, hidden from assistive tech.
      const backdrop = screen.getByTestId("ad-image-backdrop")
      expect(backdrop.getAttribute("src")).toBe(poster.getAttribute("src"))
      expect(backdrop.getAttribute("alt")).toBe("")
      expect(backdrop.getAttribute("aria-hidden")).toBe("true")
      expect(screen.getAllByRole("img")).toHaveLength(1)

      // The card links to the ad.
      const link = screen.getByRole("link")
      expect(link.getAttribute("href")).toBe(ad.linkUrl)
    },
  )
})
