import { describe, it, expect } from "vitest"
import { deploymentStage } from "../deploymentStage"

describe("deploymentStage", () => {
  it.each(["localhost", "app.localhost", "127.0.0.1", "192.168.88.2", "[::1]"])(
    "%s is development",
    (host) => {
      expect(deploymentStage(host, false)).toBe("development")
    },
  )

  it("the dev server is development on any host", () => {
    expect(deploymentStage("sc-market.space", true)).toBe("development")
  })

  it("Cloudflare branch previews are preview", () => {
    expect(deploymentStage("feat-x.sc-market-frontend.pages.dev", false)).toBe(
      "preview",
    )
  })

  it.each(["sc-market.space", "www.sc-market.space", "shop.example-org.com"])(
    "%s is production",
    (host) => {
      expect(deploymentStage(host, false)).toBe("production")
    },
  )
})
