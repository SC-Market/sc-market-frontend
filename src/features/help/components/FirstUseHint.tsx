import React, { useId } from "react"
import {
  Box,
  IconButton,
  Paper,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material"
import { CloseRounded, LightbulbOutlined } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { HelpLink } from "./HelpLink"
import { HINTS, type HintId } from "../hints"
import { useHintDismissal } from "../hooks/useHintDismissal"

/**
 * A dismissible first-use hint: a short card (a title and 2-3 lines) that
 * explains a feature where it is used, with "Learn more" opening its guide.
 *
 * It sits in the page flow, never over controls, and once dismissed it
 * never shows again (on the account when signed in, in this browser when
 * signed out; see useHintDismissal). Nothing renders until that is known.
 */
export function FirstUseHint(props: {
  hint: HintId
  title: string
  /** The explanation: keep it to 2-3 lines. */
  children: React.ReactNode
  sx?: SxProps<Theme>
}) {
  const { t } = useTranslation()
  const { key, guide } = HINTS[props.hint]
  const { visible, dismiss } = useHintDismissal(key)
  const titleId = useId()
  if (!visible) return null

  return (
    <Paper
      component="aside"
      variant="outlined"
      aria-labelledby={titleId}
      data-hint={key}
      sx={[
        (theme) => ({
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          p: 2,
          borderColor: theme.palette.outline.main,
          borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
          borderRadius: theme.spacing(theme.borderRadius.topLevel),
          minWidth: 0,
        }),
        ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : []),
      ]}
    >
      <LightbulbOutlined
        color="primary"
        aria-hidden
        sx={{ mt: 0.25, flexShrink: 0 }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          id={titleId}
          variant="subtitle1"
          component="p"
          color="text.secondary"
          sx={{ fontWeight: 700 }}
        >
          {props.title}
        </Typography>
        <Typography
          variant="body2"
          component="div"
          color="text.primary"
          sx={{ mt: 0.5 }}
        >
          {props.children}
        </Typography>
        <HelpLink guide={guide} sx={{ mt: 1 }}>
          {t("help.hint.learnMore", "Learn more")}
        </HelpLink>
      </Box>
      <IconButton
        size="small"
        onClick={dismiss}
        aria-label={t("help.hint.dismiss", "Dismiss this tip")}
        sx={{ mt: -0.5, mr: -0.5, flexShrink: 0 }}
      >
        <CloseRounded fontSize="small" />
      </IconButton>
    </Paper>
  )
}
