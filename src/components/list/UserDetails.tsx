import { MinimalUser } from "../../datatypes/User"
import { Avatar, Skeleton, Typography, Link as MaterialLink } from "@mui/material"
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

/**
 * Placeholder with the size of UserDetails / OrgDetails (40px avatar, a
 * subtitle1 name line and a subtitle2 handle line), for a row whose user or
 * org is still loading, so the row doesn't grow when it arrives.
 */
export function UserDetailsSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"row"}
      spacing={theme.layoutSpacing.compact}
      alignItems={"center"}
      aria-hidden
    >
      <Skeleton variant="circular" width={40} height={40} />
      <Stack direction={"column"} justifyContent={"left"}>
        <Typography variant={"subtitle1"}>
          <Skeleton width={110} />
        </Typography>
        <Typography variant={"subtitle2"}>
          <Skeleton width={80} />
        </Typography>
      </Stack>
    </Stack>
  )
}
