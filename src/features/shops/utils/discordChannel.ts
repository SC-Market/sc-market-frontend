const DISCORD_ID = /^[0-9]{15,22}$/

/** Why the shop's Discord IDs can't be saved, or null when they can (both set, or both empty). */
export function shopDiscordChannelError(
  serverId: string,
  channelId: string,
): string | null {
  const server = serverId.trim()
  const channel = channelId.trim()
  if (!server && !channel) return null
  if (!server || !channel) {
    return "Enter both the server ID and the channel ID, or leave both empty"
  }
  if (!DISCORD_ID.test(server) || !DISCORD_ID.test(channel)) {
    return "Discord IDs are numbers, e.g. 123456789012345678"
  }
  return null
}
