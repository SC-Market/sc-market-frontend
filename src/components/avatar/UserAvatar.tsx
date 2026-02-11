import { Stack } from "@mui/system"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../typography/UnderlineLink"
import React from "react"
import { MinimalUser } from "../../datatypes/User"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import useTheme1 from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';

export function UserAvatar(props: { user: MinimalUser }) {
  const { user } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      spacing={theme.layoutSpacing.compact}
      direction={"row"}
      justifyContent={"right"}
      alignItems={"center"}
    >
      <Avatar
        src={user.avatar}
        alt={t("accessibility.userAvatar", "Avatar of {{username}}", {
          username: user.username,
        })}
      />
      <Stack
        direction={"column"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <MaterialLink
          component={Link}
          to={`/user/${user.username}`}
          style={{ textDecoration: "none", color: "inherit" }}
          aria-label={t(
            "accessibility.viewUserProfile",
            "View profile of {{username}}",
            { username: user.username },
          )}
        >
          <UnderlineLink
            color={"text.secondary"}
            variant={"subtitle1"}
            fontWeight={"bold"}
          >
            {user.username}
          </UnderlineLink>
        </MaterialLink>
        <Typography variant={"subtitle2"}>{user.display_name}</Typography>
      </Stack>
    </Stack>
  )
}
