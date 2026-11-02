import React, { useEffect, useState } from "react"
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material"
import { useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  type LinkedDiscordServer,
  useGetLinkedDiscordServersQuery,
  useUnlinkDiscordServerMutation,
  useUpdateLinkedDiscordServerMutation,
} from "../../store/api/v2/market"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import {
  type DiscordInstallOwner,
  type DiscordInstallSource,
  discordInstallPath,
} from "./installLinks"

/** Select value meaning "no channel". */
const NONE = ""

function ServerSetup(props: {
  server: LinkedDiscordServer
  owner: DiscordInstallOwner
}) {
  const { server, owner } = props
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [update, { isLoading: saving }] = useUpdateLinkedDiscordServerMutation()
  const [unlink, { isLoading: unlinking }] = useUnlinkDiscordServerMutation()
  const [thread, setThread] = useState(server.thread_channel_id ?? NONE)
  const [alerts, setAlerts] = useState<string[]>(server.alert_channel_ids)

  useEffect(() => {
    setThread(server.thread_channel_id ?? NONE)
    setAlerts(server.alert_channel_ids)
  }, [server])

  const threadChannels = server.channels.filter(
    (c) => c.kind !== "announcement",
  )
  const alertChannels = server.channels.filter((c) => c.kind !== "forum")
  const name = server.name ?? server.guild_id

  const save = async () => {
    try {
      await update({
        guildId: server.guild_id,
        updateLinkedDiscordServerRequest: {
          ...owner,
          thread_channel_id: thread || null,
          alert_channel_ids: alerts,
        },
      }).unwrap()
      issueAlert({
        message: t(
          "linkedDiscord.saved",
          "Saved. New orders and offers go to the channels you picked.",
        ),
        severity: "success",
      })
    } catch (err) {
      issueAlert(err as { status: number; data: { message?: string } })
    }
  }

  const remove = async () => {
    try {
      await unlink({ guildId: server.guild_id, ...owner }).unwrap()
    } catch (err) {
      issueAlert(err as { status: number; data: { message?: string } })
    }
  }

  return (
    <Stack
      spacing={1.5}
      data-testid={`linked-discord-server-${server.guild_id}`}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {server.icon_url && (
          <Box
            component="img"
            src={server.icon_url}
            alt={name}
            sx={{ width: 32, height: 32, borderRadius: "50%" }}
          />
        )}
        <Typography variant="subtitle1" color="text.secondary">
          {name}
        </Typography>
      </Stack>
      {!server.bot_in_server ? (
        <Alert severity="warning">
          {t(
            "linkedDiscord.botGone",
            "The SC Market bot isn't in this server any more. Add it again, or unlink the server.",
          )}
        </Alert>
      ) : (
        <>
          <FormControl size="small" fullWidth>
            <InputLabel id={`thread-${server.guild_id}`}>
              {t("linkedDiscord.threadChannel", "Order threads channel")}
            </InputLabel>
            <Select
              labelId={`thread-${server.guild_id}`}
              label={t("linkedDiscord.threadChannel", "Order threads channel")}
              value={thread}
              onChange={(e) => setThread(String(e.target.value))}
              data-testid="linked-discord-thread"
            >
              <MenuItem value={NONE}>
                {t(
                  "linkedDiscord.noThreads",
                  "No order threads in this server",
                )}
              </MenuItem>
              {threadChannels.map((c) => (
                <MenuItem key={c.channel_id} value={c.channel_id}>
                  #{c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel id={`alerts-${server.guild_id}`}>
              {t("linkedDiscord.alertChannels", "Order alert channels")}
            </InputLabel>
            <Select
              labelId={`alerts-${server.guild_id}`}
              label={t("linkedDiscord.alertChannels", "Order alert channels")}
              multiple
              value={alerts}
              onChange={(e) =>
                setAlerts(
                  typeof e.target.value === "string"
                    ? e.target.value.split(",")
                    : e.target.value,
                )
              }
              renderValue={(ids) =>
                ids
                  .map(
                    (id) =>
                      `#${server.channels.find((c) => c.channel_id === id)?.name ?? id}`,
                  )
                  .join(", ")
              }
              data-testid="linked-discord-alerts"
            >
              {alertChannels.map((c) => (
                <MenuItem key={c.channel_id} value={c.channel_id}>
                  #{c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.primary">
            {t(
              "linkedDiscord.channelHelp",
              "Threads: a private thread with the buyer for each new order and offer (a post in a forum channel). Alerts: a post for each new order and offer with a Claim button. The bot needs to see and post in the channels you pick.",
            )}
          </Typography>
        </>
      )}
      <Box display="flex" gap={1} justifyContent="flex-end">
        <Button color="error" onClick={remove} disabled={unlinking}>
          {t("linkedDiscord.unlink", "Unlink server")}
        </Button>
        {server.bot_in_server && (
          <Button variant="contained" onClick={save} disabled={saving}>
            {t("linkedDiscord.save", "Save channels")}
          </Button>
        )}
      </Box>
    </Stack>
  )
}

/**
 * Discord servers linked to a shop or org, and the button that links one:
 * "Add the bot to a server" runs the install flow with this shop or org, so
 * the server comes back linked (?discord=linked) and its channels can be
 * picked here for order threads and alerts, without /setup in Discord.
 */
export function LinkedDiscordServers(props: {
  owner: DiscordInstallOwner
  src: DiscordInstallSource
}) {
  const { owner, src } = props
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const { data, isError } = useGetLinkedDiscordServersQuery(owner)
  const servers = data?.servers ?? []
  const justLinked = params.get("discord") === "linked"
  // Not allowed to manage this Discord integration (or it can't load): the
  // page's other ways to set up Discord still show.
  if (isError) return null

  return (
    <Stack spacing={2} data-testid="linked-discord-servers">
      {justLinked && (
        <Alert severity="success" data-testid="linked-discord-just-linked">
          {t(
            "linkedDiscord.justLinked",
            "The bot is in your server and the server is linked. Pick the channels for order threads and alerts below.",
          )}
        </Alert>
      )}
      <Box>
        <Button
          variant="outlined"
          href={discordInstallPath("server", src, owner)}
          data-testid="linked-discord-add"
        >
          {t("linkedDiscord.add", "Add the bot to a server")}
        </Button>
        <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
          {t(
            "linkedDiscord.addHelp",
            "Discord asks which server to add it to (you need Manage Server there). You come back here with the server linked, ready to pick channels.",
          )}
        </Typography>
      </Box>
      {servers.map((server) => (
        <ServerSetup key={server.guild_id} server={server} owner={owner} />
      ))}
    </Stack>
  )
}
