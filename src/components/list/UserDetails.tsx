import { MinimalUser, User } from "../../datatypes/User"
import { Avatar, Typography, Link as MaterialLink } from "@mui/material"
import { Stack } from "@mui/system"
import React from "react"
import { MinimalContractor } from "../../datatypes/Contractor"
import { UniqueListing } from "../../datatypes/MarketListing"
import { Link } from "react-router-dom"
import { formatCompleteListingUrl, formatMarketUrl } from "../../util/urls"
import { FALLBACK_IMAGE_URL } from "../../util/constants"
import {
  MarketListingSearchResult,
  MarketSearchResult,
} from "../../store/market.ts"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

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

export function MarketListingDetails(props: {
  listing: MarketListingSearchResult
}) {
  const { listing } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"row"}
      spacing={theme.layoutSpacing.compact}
      alignItems={"center"}
    >
      <Avatar
        src={listing.photo || FALLBACK_IMAGE_URL}
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
            {listing.title}
          </Typography>
        </MaterialLink>
      </Stack>
    </Stack>
  )
}
