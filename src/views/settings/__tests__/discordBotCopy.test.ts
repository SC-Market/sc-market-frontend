/**
 * The Discord help copy on the site (discord_bot.* i18n keys, shown by
 * DiscordBotDetails) must name the bot's real slash commands. Discord command
 * names are lowercase (/register server user, not /register Server User), and
 * a translated name (/register 服务器) is not a command at all.
 *
 * KNOWN_COMMANDS mirrors SC-Market/SCMarketBot cogs/registration.py,
 * cogs/setup.py, cogs/help.py and cogs/subscribe.py.
 */
import { describe, it, expect } from "vitest"

const KNOWN_COMMANDS = new Set([
  "/register server user",
  "/register server contractor",
  "/register channel user",
  "/register channel contractor",
  "/register server",
  "/register channel",
  "/register",
  "/setup",
  "/help",
  "/help alerts",
  "/subscribe alerts",
  "/subscribe alerts_user",
])

type LocaleFile = { discord_bot?: Record<string, string> }

const LOCALE_FILES = import.meta.glob<LocaleFile>("../../../locales/*/*.json", {
  import: "default",
  eager: true,
})

function discordCopy(): [string, string][] {
  const out: [string, string][] = []
  for (const [file, json] of Object.entries(LOCALE_FILES)) {
    for (const [key, value] of Object.entries(json.discord_bot ?? {})) {
      out.push([`${file.split("/").pop()} discord_bot.${key}`, String(value)])
    }
  }
  return out
}

/** Every `/command ...` in inline code, without option values like name:SCMARKET. */
function commandsIn(text: string): string[] {
  return [...text.matchAll(/`(\/[^`]+)`/g)].map((m) =>
    m[1]
      .split(/\s+/)
      .filter((word) => !word.includes(":") && !/^[A-ZА-Я]+$/.test(word))
      .join(" "),
  )
}

describe("discord_bot help copy", () => {
  it("finds the copy in every locale", () => {
    expect(discordCopy().length).toBeGreaterThanOrEqual(7 * 4)
  })

  it.each(discordCopy())("%s only names real bot commands", (_key, text) => {
    for (const command of commandsIn(text)) {
      expect(KNOWN_COMMANDS, command).toContain(command)
    }
  })

  it("English names the Discord and SC Market permissions /register needs", () => {
    const en = LOCALE_FILES["../../../locales/en/english.json"]
    const answer = en.discord_bot?.how_to_communicate_answer ?? ""
    expect(answer).toMatch(/\*\*Administrator\*\*/)
    expect(answer).toMatch(/\*\*Manage Webhooks\*\*/)
    expect(answer).toContain("`/register channel user`")
    expect(answer).toContain("`/setup`")
  })
})
