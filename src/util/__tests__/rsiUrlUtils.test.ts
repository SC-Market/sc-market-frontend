import { describe, expect, it } from "vitest"
import {
  extractProfileIdFromUrl,
  isRsiUrl,
  sanitizeAlphanumeric,
} from "../rsiUrlUtils"

/** What the RSI verification field ends up with for a pasted value (AuthenticateRSI). */
function handleFrom(input: string): string {
  if (isRsiUrl(input)) {
    const id = extractProfileIdFromUrl(input)
    if (id) return sanitizeAlphanumeric(id)
  }
  return sanitizeAlphanumeric(input)
}

describe("RSI profile URL forms accepted by verification", () => {
  it.each([
    "https://robertsspaceindustries.com/citizens/Khuzdul",
    "https://robertsspaceindustries.com/en/citizens/Khuzdul",
    "https://robertsspaceindustries.com/de/citizens/Khuzdul",
    "https://robertsspaceindustries.com/fr/citizens/Khuzdul",
    "https://robertsspaceindustries.com/es-ES/citizens/Khuzdul",
    "https://robertsspaceindustries.com/zh-CN/citizens/Khuzdul",
    "https://robertsspaceindustries.com/citizens/Khuzdul/",
    "https://robertsspaceindustries.com/en/citizens/Khuzdul/",
    "https://robertsspaceindustries.com/en/citizens/Khuzdul?utm_source=x",
    "https://robertsspaceindustries.com/citizens/Khuzdul?foo=1&bar=2#about",
    "https://robertsspaceindustries.com/en/citizens/Khuzdul/organizations",
    "https://www.robertsspaceindustries.com/en/citizens/Khuzdul",
    "http://robertsspaceindustries.com/citizens/Khuzdul",
    "robertsspaceindustries.com/en/citizens/Khuzdul",
    "www.robertsspaceindustries.com/citizens/Khuzdul/",
    "https://robertsspaceindustries.com/EN/Citizens/Khuzdul",
    "Khuzdul",
    " Khuzdul ",
  ])("%s -> Khuzdul", (input) => {
    expect(handleFrom(input)).toBe("Khuzdul")
  })

  it("keeps _ and - in handles", () => {
    expect(
      handleFrom("https://robertsspaceindustries.com/en/citizens/some_user-01"),
    ).toBe("some_user-01")
  })
})
