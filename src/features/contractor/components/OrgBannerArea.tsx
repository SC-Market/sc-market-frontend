import React from "react"
import { useTheme } from "@mui/material/styles"
import { Contractor } from "../../../datatypes/Contractor"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useGetUserProfileQuery } from "../../../store/profile"
import { useRefetchContractorDetailsMutation } from "../../../store/contractor"
import {
  DarkBannerContainer,
  LightBannerContainer,
} from "../../profile/components/BannerContainers"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme1 from '@mui/material/styles';
import Breakpoint from '@mui/material/Breakpoint';
import Fab from '@mui/material/Fab';
import RefreshRounded from '@mui/icons-material/RefreshRounded';

function OrgRefetchButton(props: { org: Contractor }) {
  const { data: profile } = useGetUserProfileQuery()
  const [refetch] = useRefetchContractorDetailsMutation()

  return (
    <>
      {profile?.role === "admin" && (
        <Fab
          color={"warning"}
          sx={{ left: 8, top: 8, position: "absolute" }}
          onClick={() => refetch(props.org.spectrum_id)}
        >
          <RefreshRounded />
        </Fab>
      )}
    </>
  )
}

export function OrgBannerArea(props: { org: Contractor }) {
  const { org } = props
  const theme = useTheme<ExtendedTheme>()

  return theme.palette.mode === "dark" ? (
    <DarkBannerContainer profile={org}>
      <OrgRefetchButton org={org} />
    </DarkBannerContainer>
  ) : (
    <LightBannerContainer profile={org}>
      <OrgRefetchButton org={org} />
    </LightBannerContainer>
  )
}
