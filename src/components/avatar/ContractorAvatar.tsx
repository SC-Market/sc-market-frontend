import { Avatar, Link as MaterialLink, Typography } from "@mui/material"
import { Stack } from "@mui/system"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../typography/UnderlineLink"
import React from "react"
import { MinimalContractor } from "../../datatypes/Contractor"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function ContractorAvatar(props: { contractor: MinimalContractor }) {
  const { contractor } = props
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
        src={contractor.avatar}
        alt={t("accessibility.contractorAvatar", "Avatar of {{name}}", {
          name: contractor.name,
        })}
      />
      <Stack
        direction={"column"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <MaterialLink
          component={Link}
          to={`/contractor/${contractor.spectrum_id}`}
          style={{ textDecoration: "none", color: "inherit" }}
          aria-label={t(
            "accessibility.viewContractorProfile",
            "View profile of {{name}}",
            { name: contractor.name },
          )}
        >
          <UnderlineLink
            color={"text.secondary"}
            variant={"subtitle1"}
            fontWeight={"bold"}
          >
            {contractor.spectrum_id}
          </UnderlineLink>
        </MaterialLink>
        <Typography variant={"subtitle2"}>{contractor.name}</Typography>
      </Stack>
    </Stack>
  )
}
