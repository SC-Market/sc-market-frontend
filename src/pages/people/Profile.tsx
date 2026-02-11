import { ContainerGrid } from "../../components/layout/ContainerGrid"
import React from "react"
import { Navigate, useParams } from "react-router-dom"
import { ProfileSkeleton} from "../../features/profile/index"
import { ViewProfile } from "../../features/profile/components/ViewProfile"
import { useGetUserByUsernameQuery } from "../../store/profile"
import { Page } from "../../components/metadata/Page"
import { useTranslation } from "react-i18next"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../errors/ErrorPage"

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

export function Profile() {
  const { t } = useTranslation()
  const { username } = useParams<{ username: string }>()
  // const myProfile = useGetUserProfileQuery()

  const user = useGetUserByUsernameQuery(username!, {
    skip: !username,
  })

  return (
    <Page
      title={
        user.data?.display_name
          ? `${user.data?.display_name} - ${t("viewProfile.store_tab")}`
          : null
      }
    >
      {/*{myProfile?.data?.username && myProfile?.data?.username === username ? <Navigate to={'/profile'}/> : null}*/}
      {shouldRedirectTo404(user.error) ? <Navigate to={"/404"} /> : null}
      {shouldShowErrorPage(user.error) ? <ErrorPage /> : null}
      {shouldRedirectTo404(user.error) ? <Navigate to={"/404"} /> : null}
      {shouldShowErrorPage(user.error) ? <ErrorPage /> : null}
      {user.isLoading || user.isFetching ? (
        <ContainerGrid sidebarOpen={true} maxWidth={"lg"}>
          <ProfileSkeleton />
        </ContainerGrid>
      ) : user.data ? (
        <ViewProfile profile={user.data} />
      ) : null}
    </Page>
  )
}
