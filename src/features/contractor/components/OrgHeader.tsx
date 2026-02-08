import React from "react"
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Link as MaterialLink,
  Stack,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import { LinkRounded } from "@mui/icons-material"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Contractor } from "../../../datatypes/Contractor"
import { contractorKindIcons } from "../../../views/contractor/ContractorList"
import { useTranslation } from "react-i18next"

interface OrgHeaderProps {
  contractor: Contractor
}

export function OrgHeader({ contractor }: OrgHeaderProps) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="flex-start"
      flexWrap="wrap"
    >
      <Avatar
        src={contractor.avatar}
        aria-label={t("contractors.contractor")}
        variant="rounded"
        sx={{
          height: theme.spacing(12),
          width: theme.spacing(12),
          flexShrink: 0,
          objectFit: "cover",
        }}
      />
      <Stack spacing={0.5}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexWrap: "wrap",
          }}
        >
          <Typography
            color="text.secondary"
            variant="h6"
            fontWeight={600}
          >
            {contractor.name}
          </Typography>
          {!contractor.spectrum_id.startsWith("~") && (
            <MaterialLink
              component="a"
              href={`https://robertsspaceindustries.com/orgs/${contractor.spectrum_id}`}
              target="_blank"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <IconButton color="primary" size="small">
                <LinkRounded />
              </IconButton>
            </MaterialLink>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <PeopleAltRoundedIcon
            style={{ color: theme.palette.text.primary }}
          />
          <Typography color="text.primary" fontWeight="bold">
            {contractor.size}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {contractor.fields.map((field) => (
            <Chip
              key={field}
              color="primary"
              label={field}
              sx={{
                padding: 0.5,
                textTransform: "capitalize",
              }}
              size="small"
              variant="outlined"
              icon={contractorKindIcons[field]}
              onClick={(event) => event.stopPropagation()}
            />
          ))}
        </Box>
      </Stack>
    </Stack>
  )
}
