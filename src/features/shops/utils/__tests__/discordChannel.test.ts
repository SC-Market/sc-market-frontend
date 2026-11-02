/**
 * Shop Settings › Discord saves both IDs or neither: a shop either has its own
 * order-thread channel, or uses its owner's (set with /setup threads).
 */
import { describe, it, expect } from "vitest"
import { shopDiscordChannelError } from "../discordChannel"

const SERVER = "1003056231591727264"
const CHANNEL = "1072580369251041330"

describe("shopDiscordChannelError", () => {
  it("accepts both IDs, or both empty", () => {
    expect(shopDiscordChannelError(SERVER, CHANNEL)).toBeNull()
    expect(shopDiscordChannelError(` ${SERVER} `, `${CHANNEL}\n`)).toBeNull()
    expect(shopDiscordChannelError("", "  ")).toBeNull()
  })

  it("refuses only one of the two", () => {
    expect(shopDiscordChannelError(SERVER, "")).toBe("bothRequired")
    expect(shopDiscordChannelError("", CHANNEL)).toBe("bothRequired")
  })

  it("refuses anything that isn't a Discord ID", () => {
    expect(shopDiscordChannelError(SERVER, "#orders")).toBe("notNumeric")
    expect(shopDiscordChannelError("https://discord.com/channels/1/2", CHANNEL)).toBe("notNumeric")
    expect(shopDiscordChannelError("123", CHANNEL)).toBe("notNumeric")
  })
})
