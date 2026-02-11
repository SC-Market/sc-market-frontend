import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import React from "react"
import { ReceivedOffersArea } from "../../views/offers/ReceivedOffersArea"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MaterialLink from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';

export function ReceivedOffersPage() {
  const { t } = useTranslation()

  return (
    <Page title={t("offers.receivedOffers")}>
      <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
        <Grid item xs={12}>
          <Breadcrumbs>
            <MaterialLink
              component={Link}
              to={"/dashboard"}
              underline="hover"
              color={"text.primary"}
            >
              {t("offers.dashboard")}
            </MaterialLink>
            <MaterialLink
              component={Link}
              underline="hover"
              to={"/offers/received"}
              color={"text.primary"}
            >
              {t("offers.receivedOffers")}
            </MaterialLink>
          </Breadcrumbs>
        </Grid>
        <HeaderTitle lg={12} xl={12}>
          {t("offers.receivedOffers")}
        </HeaderTitle>

        <ReceivedOffersArea />
      </ContainerGrid>
    </Page>
  )
}
