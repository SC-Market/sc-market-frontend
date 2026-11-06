import {
  Paper,
  PaperProps,
  Link as MaterialLink,
  Typography,
} from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { USER_PATHS } from "../../../../routes/paths"

export function MsgPaper(
  props: PaperProps & {
    other?: boolean
    author:
      | {
          username: string
          avatar: string
        }
      | null
      | undefined
  },
) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const { author, other, ...paperProps } = props

  if (author) {
    return (
      <Paper
        {...paperProps}
        sx={{
          // Your own messages: a green-tinted surface (the accent at 16%)
          bgcolor: other
            ? theme.palette.background.paper
            : alpha(theme.palette.primary.main, 0.16),
          padding: 1,
          paddingRight: 2,
          paddingLeft: 2,
          marginRight: 2,
          display: "inline-block",
          whiteSpace: "pre-line",
          borderRadius: theme.spacing(theme.borderRadius.button),
          width: "100%",
        }}
      >
        <MaterialLink
          component={Link}
          to={USER_PATHS.profile(author.username)}
          color="text.secondary"
        >
          <Typography variant={"subtitle2"}>{author?.username}</Typography>
        </MaterialLink>

        {props.children}
      </Paper>
    )
  } else {
    return (
      <Paper
        {...paperProps}
        sx={{
          // Your own messages: a green-tinted surface (the accent at 16%)
          bgcolor: other
            ? theme.palette.background.paper
            : alpha(theme.palette.primary.main, 0.16),
          padding: 1,
          paddingRight: 2,
          paddingLeft: 2,
          marginRight: 2,
          display: "inline-block",
          whiteSpace: "pre-line",
          maxWidth: 400,
          flexGrow: 1,
          borderRadius: theme.spacing(theme.borderRadius.button),
        }}
      >
        <Typography variant={"subtitle2"}>
          {t("MessagesBody.system")}
        </Typography>
        {props.children}
      </Paper>
    )
  }
}
