import React from "react"
import { Fab } from "@mui/material"
import { RefreshRounded } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { Contractor } from "../domain/types"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useRefetchContractorDetailsMutation } from "../api/contractorApi"
import {
  DarkBannerContainer,
  LightBannerContainer,
} from "../../profile/components/BannerContainers"
import { isSiteAdmin } from "../../../util/siteRole"
import { useTranslation } from "react-i18next"

function OrgRefetchButton(props: { org: Contractor }) {
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const [refetch] = useRefetchContractorDetailsMutation()

  return (
    <>
      {isSiteAdmin(profile) && (
        <Fab
          aria-label={t("orgBanner.refetch", "Refresh org details from RSI")}
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
