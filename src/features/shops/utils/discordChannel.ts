const DISCORD_ID = /^[0-9]{15,22}$/

/** Why a shop's Discord IDs can't be saved. The UI shows `shopsUi.discord.<reason>`. */
export type ShopDiscordChannelError = "bothRequired" | "notNumeric"

/** Why the shop's Discord IDs can't be saved, or null when they can (both set, or both empty). */
export function shopDiscordChannelError(
  serverId: string,
  channelId: string,
): ShopDiscordChannelError | null {
  const server = serverId.trim()
  const channel = channelId.trim()
  if (!server && !channel) return null
  if (!server || !channel) return "bothRequired"
  if (!DISCORD_ID.test(server) || !DISCORD_ID.test(channel)) return "notNumeric"
  return null
}
