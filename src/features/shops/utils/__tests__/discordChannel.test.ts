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
    expect(shopDiscordChannelError(SERVER, "")).toBe(
      "Enter both the server ID and the channel ID, or leave both empty",
    )
    expect(shopDiscordChannelError("", CHANNEL)).toMatch(/both/)
  })

  it("refuses anything that isn't a Discord ID", () => {
    expect(shopDiscordChannelError(SERVER, "#orders")).toBe(
      "Discord IDs are numbers, e.g. 123456789012345678",
    )
    expect(shopDiscordChannelError("https://discord.com/channels/1/2", CHANNEL)).toMatch(/numbers/)
    expect(shopDiscordChannelError("123", CHANNEL)).toMatch(/numbers/)
  })
})
