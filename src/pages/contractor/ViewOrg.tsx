import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { Navigate, useParams } from "react-router-dom"
import { Contractor } from "../../datatypes/Contractor"
import { OrgInfo, OrgInfoSkeleton } from "../../features/contractor"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { useGetContractorBySpectrumIDQuery } from "../../store/contractor"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { Page } from "../../components/metadata/Page"
import { PageBreadcrumbs } from "../../components/navigation"
import { useTranslation } from "react-i18next"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../errors/ErrorPage"

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import CreateRounded from '@mui/icons-material/CreateRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import LocalShippingRounded from '@mui/icons-material/LocalShippingRounded';
import AccountBoxRounded from '@mui/icons-material/AccountBoxRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import Block from '@mui/icons-material/Block';
import HistoryRounded from '@mui/icons-material/HistoryRounded';

export function ViewOrg() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const contractor = useGetContractorBySpectrumIDQuery(id!)

  return (
    <Page
      title={
        contractor.data?.name
          ? `${contractor.data?.name} - ${t("org.orgTitle")}`
          : null
      }
    >
      {contractor.isLoading || contractor.isFetching ? (
        <OrgInfoSkeleton />
      ) : shouldRedirectTo404(contractor.error) ? (
        <Navigate to={"/404"} />
      ) : shouldShowErrorPage(contractor.error) ? (
        <ErrorPage />
      ) : (
        <OrgInfo contractor={contractor.data!} />
      )}
    </Page>
  )
}

export function MyOrg() {
  const [contractor] = useCurrentOrg()
  const { t } = useTranslation()

  return (
    <Page title={t("org.myOrgTitle")}>
      {!contractor ? (
        <Navigate to={"/404"} />
      ) : (
        <OrgInfo contractor={contractor} />
      )}
    </Page>
  )
}

export function OrgSectionSkeleton() {
  return (
    <React.Fragment>
      <HeaderTitle>
        <Skeleton width={500} variant={"text"} />
      </HeaderTitle>
      <OrgInfoSkeleton />
    </React.Fragment>
  )
}
