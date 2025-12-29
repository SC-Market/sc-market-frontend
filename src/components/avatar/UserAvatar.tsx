import { Avatar, Link as MaterialLink, Typography } from "@mui/material"
import { Stack } from "@mui/system"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../typography/UnderlineLink"
import React from "react"
import { MinimalUser } from "../../datatypes/User"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

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
