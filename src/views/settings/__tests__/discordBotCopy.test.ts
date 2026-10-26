/**
 * The Discord help copy on the site (discord_bot.* and ConfigureDiscord.*
 * i18n keys, shown by DiscordBotDetails and ConfigureDiscord) must name the
 * bot's real slash commands. Discord command names are lowercase, and a
 * translated name is not a command at all.
 *
 * KNOWN_COMMANDS mirrors SC-Market/SCMarketBot tests/test_command_tree.py.
 */
import { describe, it, expect } from "vitest"

const KNOWN_COMMANDS = new Set([
  "/setup threads",
  "/setup alerts",
  "/setup webhook",
  "/setup status",
  "/setup remove",
  "/order status",
  "/listing create",
  "/listing price",
  "/listing stock",
  "/listing view",
  "/listing import",
  "/search",
  "/watchlist add",
  "/watchlist list",
  "/watchlist remove",
  "/help",
  "/help alerts",
])

type LocaleFile = {
  discord_bot?: Record<string, string>
  ConfigureDiscord?: Record<string, string>
}

const LOCALE_FILES = import.meta.glob<LocaleFile>("../../../locales/*/*.json", {
  import: "default",
  eager: true,
})

function discordCopy(): [string, string][] {
  const out: [string, string][] = []
  for (const [file, json] of Object.entries(LOCALE_FILES)) {
    for (const section of ["discord_bot", "ConfigureDiscord"] as const) {
      for (const [key, value] of Object.entries(json[section] ?? {})) {
        out.push([`${file.split("/").pop()} ${section}.${key}`, String(value)])
      }
    }
  }
  return out
}

/**
 * Every `/command ...` in inline code (or plain text, like the
 * ConfigureDiscord hint), without option values like org:SCMARKET.
 */
function commandsIn(text: string): string[] {
  const quoted = [...text.matchAll(/`(\/[^`]+)`/g)].map((m) => m[1])
  const plain = [...text.replace(/`[^`]*`/g, "").matchAll(/(?:^|\s)(\/[a-z]+(?: [a-z]+)?)/g)].map(
    (m) => m[1],
  )
  return [...quoted, ...plain].map((command) =>
    command
      .split(/\s+/)
      .filter((word) => !word.includes(":") && !/^[A-ZА-Я]+$/.test(word))
      .join(" "),
  )
}

describe("discord_bot help copy", () => {
  it("finds the copy in every locale", () => {
    expect(discordCopy().length).toBeGreaterThanOrEqual(8 * (5 + 8))
  })

  it.each(discordCopy())("%s only names real bot commands", (_key, text) => {
    for (const command of commandsIn(text)) {
      expect(KNOWN_COMMANDS, command).toContain(command)
    }
  })

  it("English names the Discord and SC Market permissions /setup needs", () => {
    const en = LOCALE_FILES["../../../locales/en/english.json"]
    const answer = en.discord_bot?.how_to_communicate_answer ?? ""
    expect(answer).toMatch(/\*\*Manage Channels\*\*/)
    expect(answer).toMatch(/\*\*Manage Webhooks\*\*/)
    expect(answer).toContain("`/setup threads`")
    expect(answer).toContain("`/setup alerts`")
    expect(answer).not.toMatch(/Administrator/)
  })

  it.each(Object.entries(LOCALE_FILES))(
    "%s tells sellers to run /setup threads, not a removed command",
    (_file, json) => {
      const text = JSON.stringify([json.discord_bot, json.ConfigureDiscord])
      expect(text).toContain("/setup threads")
      expect(text).not.toMatch(/\/(register|subscribe|unsubscribe|lookup|stock|price)\b/)
    },
  )
})
