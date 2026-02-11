import { Avatar, Box, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { Link } from "react-router-dom"
import {
  useGetUserByUsernameQuery,
  useGetUserProfileQuery,
} from "../../../../store/profile"
import { getRelativeTime } from "../../../../util/time"
import SCMarketLogo from "../../../../assets/scmarket-logo.webp"
import { useMemo } from "react"
import type { Message } from "../../domain/types"
import { replaceDiscordTimestamps } from "../utils/timestampFormatter"
import { MsgPaper } from "./MsgPaper"

export function MessageEntry(props: { message: Message }) {
  const { message } = props
  const { data: profile } = useGetUserProfileQuery()
  const { data: author } = useGetUserByUsernameQuery(message.author!, {
    skip: !message.author,
  })
  const theme = useTheme<ExtendedTheme>()
  const convertedContent = useMemo(
    () => replaceDiscordTimestamps(message.content),
    [message.content],
  )

  if (message.author === profile?.username) {
    return (
      <Stack
        direction={"row"}
        spacing={theme.layoutSpacing.compact}
        justifyContent={"flex-end"}
        sx={{ marginBottom: 1 }}
      >
        <Box
          sx={{
            flexGrow: 1,
            maxWidth: { xs: "75%", sm: "80%" },
            minWidth: 0,
          }}
        >
          <MsgPaper author={author}>
            <Typography
              color={theme.palette.secondary.contrastText}
              align={"left"}
              width={"100%"}
              sx={{
                fontWeight: 400,
                overflowWrap: "break-word",
                fontSize: ".9em",
              }}
            >
              {convertedContent}
            </Typography>
          </MsgPaper>
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
        </Box>

        <Link to={`/user/${message.author}`}>
          <Avatar
            variant="rounded"
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              flexShrink: 0,
            }}
            src={author?.avatar}
          />
        </Link>
      </Stack>
    )
  } else if (!message.author) {
    return (
      <Stack
        direction={"row"}
        spacing={theme.layoutSpacing.compact}
        justifyContent={"flex-start"}
        sx={{ marginBottom: 1 }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: { xs: 32, sm: 36 },
            height: { xs: 32, sm: 36 },
            flexShrink: 0,
          }}
          src={SCMarketLogo}
        />
        <Box
          sx={{
            flexGrow: 1,
            maxWidth: { xs: "85%", sm: "90%" },
            minWidth: 0,
          }}
        >
          <MsgPaper other author={author}>
            <Typography
              color={theme.palette.text.secondary}
              align={"left"}
              width={"100%"}
              sx={{
                fontWeight: 400,
                overflowWrap: "break-word",
                fontSize: ".9em",
              }}
            >
              {convertedContent}
            </Typography>
          </MsgPaper>
          <Typography
            align={"left"}
            color={"text.primary"}
            variant={"subtitle2"}
            sx={{
              marginTop: 0.5,
              marginLeft: 2,
              fontSize: "0.75em",
              lineHeight: 1.66,
            }}
          >
            {getRelativeTime(new Date(message.timestamp))}
          </Typography>
        </Box>
      </Stack>
    )
  } else {
    return (
      <Stack
        direction={"row"}
        spacing={theme.layoutSpacing.compact}
        justifyContent={"flex-end"}
        sx={{ marginBottom: 1 }}
      >
        <Link to={`/user/${message.author}`}>
          <Avatar
            variant="rounded"
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              flexShrink: 0,
            }}
            src={author?.avatar}
          />
        </Link>
        <Box
          sx={{
            flexGrow: 1,
            maxWidth: { xs: "85%", sm: "90%" },
            minWidth: 0,
          }}
        >
          <MsgPaper other author={author}>
            <Typography
              color={theme.palette.text.secondary}
              align={"left"}
              width={"100%"}
              sx={{
                fontWeight: 400,
                overflowWrap: "break-word",
                fontSize: ".9em",
              }}
            >
              {convertedContent}
            </Typography>
          </MsgPaper>
          <Typography
            align={"left"}
            color={"text.primary"}
            variant={"subtitle2"}
            sx={{
              marginTop: 0.5,
              marginLeft: 2,
              fontSize: "0.75em",
              lineHeight: 1.66,
            }}
          >
            {getRelativeTime(new Date(message.timestamp))}
          </Typography>
        </Box>
      </Stack>
    )
  }
}
