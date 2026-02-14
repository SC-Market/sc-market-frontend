import {
  Avatar,
  Box,
  Link as MaterialLink,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded"
import { Link } from "react-router-dom"
import { useGetUserByUsernameQuery } from "../../../../store/profile"
import { getRelativeTime } from "../../../../util/time"
import { MarkdownRender } from "../../../../components/markdown/Markdown.lazy"
import { LongPressMenu } from "../../../../components/gestures"
import SCMarketLogo from "../../../../assets/scmarket-logo.webp"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import type { Message } from "../../domain/types"
import { replaceDiscordTimestamps } from "../utils/timestampFormatter"

export function MessageEntry2(props: { message: Message }) {
  const { message } = props
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { t } = useTranslation()
  const { data: author } = useGetUserByUsernameQuery(message.author!, {
    skip: !message.author,
  })
  const convertedContent = useMemo(
    () => replaceDiscordTimestamps(message.content),
    [message.content],
  )

  const longPressActions = useMemo(() => {
    if (!message.content) return []
    return [
      {
        label: t("messages.copy", { defaultValue: "Copy" }),
        icon: <ContentCopyRounded />,
        onClick: () => {
          navigator.clipboard.writeText(message.content || "")
        },
      },
    ]
  }, [message.content, t])

  const messageContent = (
    <Stack
      direction={"row"}
      spacing={theme.layoutSpacing.compact}
      justifyContent={"flex-start"}
    >
      {message.author ? (
        <Link to={`/user/${author?.username}`}>
          <Avatar
            variant="rounded"
            sx={{
              width: { xs: 36, sm: 42 },
              height: { xs: 36, sm: 42 },
              flexShrink: 0,
            }}
            src={author?.avatar || SCMarketLogo}
          />
        </Link>
      ) : (
        <Avatar
          variant="rounded"
          sx={{
            width: { xs: 36, sm: 42 },
            height: { xs: 36, sm: 42 },
            flexShrink: 0,
          }}
          src={SCMarketLogo}
        />
      )}

      <Stack direction={"column"}>
        <Stack
          direction={"row"}
          spacing={theme.layoutSpacing.compact}
          alignItems={"flex-end"}
        >
          {message.author ? (
            <MaterialLink
              component={Link}
              to={`/user/${author?.username}`}
              color={"text.secondary"}
            >
              <Typography variant={"subtitle2"}>{author?.username}</Typography>
            </MaterialLink>
          ) : (
            <Typography variant={"subtitle2"}>
              {t("MessagesBody.system")}
            </Typography>
          )}
          <Typography
            align={"right"}
            color={"text.primary"}
            variant={"subtitle2"}
            sx={{
              marginTop: 0.5,
              marginRight: 4,
              fontSize: "0.75em",
              lineHeight: 1.66,
            }}
          >
            {getRelativeTime(new Date(message.timestamp))}
          </Typography>
        </Stack>
        <Box
          sx={{
            "& p": {
              margin: 0,
              marginBottom: 0.5,
              "&:last-child": { marginBottom: 0 },
            },
          }}
        >
          <MarkdownRender text={convertedContent} />
        </Box>
      </Stack>
    </Stack>
  )

  if (isMobile && longPressActions.length > 0) {
    return (
      <LongPressMenu actions={longPressActions} enabled={isMobile}>
        {messageContent}
      </LongPressMenu>
    )
  }

  return messageContent
}
