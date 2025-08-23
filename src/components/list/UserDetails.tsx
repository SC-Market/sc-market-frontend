import { MinimalUser, User } from "../../datatypes/User"
import { Avatar, Typography, Link as MaterialLink } from "@mui/material"
import { Stack } from "@mui/system"
import React from "react"
import { MinimalContractor } from "../../datatypes/Contractor"
import { UniqueListing } from "../../datatypes/MarketListing"
import { Link } from "react-router-dom"
import { formatMarketUrl } from "../../util/urls"
import { FALLBACK_IMAGE_URL } from "../../util/constants"

export function UserDetails(props: { user: MinimalUser }) {
  const { user } = props

  return (
    <Stack direction={"row"} spacing={1} alignItems={"center"}>
      <Avatar src={user.avatar} />
      <Stack direction={"column"} justifyContent={"left"}>
        <MaterialLink
          component={Link}
          to={`/user/${user.username}`}
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

  return (
    <Stack direction={"row"} spacing={1} alignItems={"center"}>
      <Avatar src={org.avatar} />
      <Stack direction={"column"} justifyContent={"left"}>
        <MaterialLink
          component={Link}
          to={`/contractor/${org.spectrum_id}`}
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

export function MarketListingDetails(props: { listing: UniqueListing }) {
  const { listing } = props

  return (
    <Stack direction={"row"} spacing={1} alignItems={"center"}>
      <Avatar
        src={listing.photos[0] || FALLBACK_IMAGE_URL}
        variant={"rounded"}
        imgProps={{
          onError: ({ currentTarget }) => {
            currentTarget.onerror = null
            currentTarget.src = FALLBACK_IMAGE_URL
          },
        }}
      />
      <Stack direction={"column"} justifyContent={"left"}>
        <MaterialLink
          component={Link}
          to={formatMarketUrl(listing)}
          underline={"hover"}
        >
          <Typography variant={"subtitle2"} color={"text.secondary"}>
            {listing.details.title}
          </Typography>
        </MaterialLink>
      </Stack>
    </Stack>
  )
}
