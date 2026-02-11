import React from "react"
import { useTheme } from "@mui/material/styles"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Contractor } from "../../../datatypes/Contractor"
import { contractorKindIcons } from "../../../views/contractor/ContractorList"
import { useTranslation } from "react-i18next"
import { ShareButton } from "../../../components/buttons/ShareButton"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme1 from '@mui/material/styles';
import { Breakpoint } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';

interface OrgHeaderProps {
  contractor: Contractor
}

export function OrgHeader({ contractor }: OrgHeaderProps) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap">
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
          <Typography color="text.secondary" variant="h6" fontWeight={600}>
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
          <ShareButton title={`${contractor.name} - SC Market`} />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <PeopleAltRoundedIcon style={{ color: theme.palette.text.primary }} />
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
