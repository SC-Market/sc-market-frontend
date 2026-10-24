import { MinimalUser } from "../../datatypes/User"
import { Avatar, Typography, Link as MaterialLink } from "@mui/material"
import { Stack } from "@mui/system"
import React from "react"
import { MinimalContractor } from "../../features/contractor/domain/types"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { ORG_PATHS, USER_PATHS } from "../../routes/paths"

export function UserDetails(props: { user: MinimalUser }) {
  const { user } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"row"}
      spacing={theme.layoutSpacing.compact}
      alignItems={"center"}
    >
      <Avatar src={user.avatar} />
      <Stack direction={"column"} justifyContent={"left"}>
        <MaterialLink
          component={Link}
          to={USER_PATHS.profile(user.username)}
          underline={"hover"}
        >
          <Typography
            variant={"subtitle1"}
            color={"text.secondary"}
            fontWeight={"bold"}
          >
            {user.display_name}
          </Typography>
        </MaterialLink>
        <Typography variant={"subtitle2"}>{user.username}</Typography>
      </Stack>
    </Stack>
  )
}

export function OrgDetails(props: { org: MinimalContractor }) {
  const { org } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"row"}
      spacing={theme.layoutSpacing.compact}
      alignItems={"center"}
    >
      <Avatar src={org.avatar} />
      <Stack direction={"column"} justifyContent={"left"}>
        <MaterialLink
          component={Link}
          to={ORG_PATHS.profile(org.spectrum_id)}
          underline={"hover"}
        >
          <Typography
            variant={"subtitle1"}
            color={"text.secondary"}
            fontWeight={"bold"}
          >
            {org.name}
          </Typography>
        </MaterialLink>
        <Typography variant={"subtitle2"}>{org.spectrum_id}</Typography>
      </Stack>
    </Stack>
  )
}
