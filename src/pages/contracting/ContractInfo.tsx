import { ContainerGrid } from "../../components/layout/ContainerGrid"
import React, { useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { ViewContract } from "../../views/contracts/ViewContract"
import { ContractAppOpenContext } from "../../hooks/contract/ContractApp"
import { ContractApp } from "../../views/contracts/ContractApp"
import { useGetOrderByIdQuery } from "../../store/orders"
import { useTranslation } from "react-i18next"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../errors/ErrorPage"
import { ContractDetailSkeleton } from "../../components/skeletons"
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
import MaterialLink from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Fade from '@mui/material/Fade';
import Grid2 from '@mui/material/Grid2';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
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
import HowToRegRounded from '@mui/icons-material/HowToRegRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ArrowBack from '@mui/icons-material/ArrowBack';

export function ContractInfo(props: {}) {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const { data, error, isLoading, isFetching } = useGetOrderByIdQuery(id!)

  const [appOpen, setAppOpen] = useState(false)

  return (
    <ContractAppOpenContext.Provider value={[appOpen, setAppOpen]}>
      <ContainerGrid sidebarOpen={true} maxWidth={appOpen ? "lg" : "md"}>
        <HeaderTitle>{t("contracts.contractTitle")}</HeaderTitle>
        {shouldRedirectTo404(error) && <Navigate to={"/404"} />}
        {shouldShowErrorPage(error) && <ErrorPage />}
        {isLoading || isFetching ? (
          <Grid item xs={12} lg={appOpen ? 8 : 12}>
            <ContractDetailSkeleton />
          </Grid>
        ) : (
          <ViewContract listing={data!} />
        )}
        {appOpen && <ContractApp />}
      </ContainerGrid>
    </ContractAppOpenContext.Provider>
  )
}
