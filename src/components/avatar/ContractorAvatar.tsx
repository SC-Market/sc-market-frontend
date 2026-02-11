import { Stack } from "@mui/system"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../typography/UnderlineLink"
import React from "react"
import { MinimalContractor } from "../../datatypes/Contractor"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import useTheme1 from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';

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
