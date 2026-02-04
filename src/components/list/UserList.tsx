import { Contractor, MinimalContractor } from "../../datatypes/Contractor"
import {
  Avatar,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material"
import React, { useMemo } from "react"
import { MinimalUser } from "../../datatypes/User"
import { Link } from "react-router-dom"
import { Discord } from "../icon/DiscordIcon"

function format_discord(u: MinimalUser) {
  return `@${u.discord_profile?.username}${
    u.discord_profile?.discriminator && +u.discord_profile.discriminator
      ? `#${u.discord_profile.discriminator}`
      : ""
  }`
}

export function UserList(props: {
  title?: string
  users: (MinimalUser | MinimalContractor | null | undefined)[]
}) {
  const users = useMemo(() => props.users.filter((u) => u), [props.users])

  return (
    <List
      subheader={
        props.title ? <ListSubheader>{props.title}</ListSubheader> : null
      }
      sx={{ width: "100%" }}
    >
      {users.map((u, i) => (
        <ListItemButton
          component={Link}
          key={i}
          to={
            (u as MinimalUser).username
              ? `/user/${(u as MinimalUser).username}`
              : `/contractor/${(u as MinimalContractor).spectrum_id}`
          }
        >
          <ListItemAvatar>
            <Avatar
              variant={"rounded"}
              src={u?.avatar}
              alt={`Avatar of ${
                (u as MinimalUser).username ||
                (u as MinimalContractor).spectrum_id
              }`}
            />
          </ListItemAvatar>
          <ListItemText>
            <Typography>
              {(u as MinimalUser).display_name || (u as Contractor).name}
            </Typography>
            <Typography
              alignItems={"center"}
              color={"secondary"}
              display={"flex"}
            >
              {(u as MinimalUser).discord_profile ? (
                <>
                  <Discord />
                  &nbsp;{format_discord(u as MinimalUser)}
                </>
              ) : null}
            </Typography>
          </ListItemText>
        </ListItemButton>
      ))}
    </List>
  )
}

export function UserSubtitleList(props: {
  title?: string
  users: [MinimalUser | MinimalContractor | null | undefined, string][]
}) {
  const users = useMemo(() => props.users.filter((u) => u[0]), [props.users])

  return (
    <List
      subheader={
        props.title ? <ListSubheader>{props.title}</ListSubheader> : null
      }
      sx={{ width: "100%" }}
    >
      {users.map(([u, subtitle], i) => (
        <ListItemButton
          component={Link}
          key={i}
          to={
            (u as MinimalUser).username
              ? `/user/${(u as MinimalUser).username}`
              : `/contractor/${(u as MinimalContractor).spectrum_id}`
          }
        >
          <ListItemAvatar>
            <Avatar
              variant={"rounded"}
              src={u?.avatar}
              alt={`Avatar of ${
                (u as MinimalUser).username ||
                (u as MinimalContractor).spectrum_id
              }`}
            />
          </ListItemAvatar>
          <ListItemText>
            <Typography variant={"subtitle1"} color={"text.secondary"}>
              {(u as MinimalUser).display_name || (u as Contractor).name}
            </Typography>
            <Typography variant={"subtitle2"}>{subtitle}</Typography>
          </ListItemText>
        </ListItemButton>
      ))}
    </List>
  )
}
