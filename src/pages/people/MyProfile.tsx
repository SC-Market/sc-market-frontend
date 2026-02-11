import { ContainerGrid } from "../../components/layout/ContainerGrid"
import React from "react"
import { Navigate } from "react-router-dom"
import { ProfileSkeleton} from "../../features/profile/index"
import { ViewProfile } from "../../features/profile/components/ViewProfile"
import {
  useGetUserByUsernameQuery,
  useGetUserProfileQuery,
} from "../../store/profile"
import { Page } from "../../components/metadata/Page"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"

import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme1 from '@mui/material/styles';
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

export function MyProfile() {
  const {
    data: profile,
    error,
    isLoading,
    isFetching,
  } = useGetUserProfileQuery()
  const {
    data: user,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
  } = useGetUserByUsernameQuery(profile?.username ?? "", {
    skip: !profile?.username,
  })
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Page title={t("viewProfile.myProfile")}>
      {error && <Navigate to={"/"} />}
      {isLoading || isFetching || isLoadingUser || isFetchingUser ? (
        <ContainerGrid
          sidebarOpen={true}
          maxWidth={"xxl"}
          sx={{ paddingTop: theme.spacing(4) }}
        >
          <ProfileSkeleton />
        </ContainerGrid>
      ) : user ? (
        <ViewProfile profile={user} />
      ) : null}
    </Page>
  )
}
