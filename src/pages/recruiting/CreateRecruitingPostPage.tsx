import { HeaderTitle } from "../../components/typography/HeaderTitle"
import React from "react"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Page } from "../../components/metadata/Page"
import { CreateRecruitingPost } from "../../views/recruiting/CreateRecruitingPost"
import { Navigate, useParams } from "react-router-dom"
import { useRecruitingGetPostByIDQuery } from "../../store/recruiting"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
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

export function CreateRecruitingPostPage() {
  const { t } = useTranslation()

  return (
    <Page title={t("recruiting_post.page.createPost")}>
      <ContainerGrid maxWidth={"md"} sidebarOpen={true}>
        <HeaderTitle>{t("recruiting_post.page.createPost")}</HeaderTitle>

        <Grid item xs={12}>
          <Divider light />
        </Grid>

        <CreateRecruitingPost />
      </ContainerGrid>
    </Page>
  )
}

export function UpdateRecruitingPostPage() {
  const { post_id } = useParams<{ post_id: string }>()
  const { t } = useTranslation()

  const { data: post, error, isError } = useRecruitingGetPostByIDQuery(post_id!)
  const [currentOrg] = useCurrentOrg()

  return (
    <Page title={t("recruiting_post.page.updatePost")}>
      {shouldRedirectTo404(error) && <Navigate to={"/404"} />}
      {shouldShowErrorPage(error) && <ErrorPage />}

      <ContainerGrid maxWidth={"md"} sidebarOpen={true}>
        <HeaderTitle>{t("recruiting_post.page.updatePost")}</HeaderTitle>

        <Grid item xs={12}>
          <Divider light />
        </Grid>

        {currentOrg && <CreateRecruitingPost post={post} />}
      </ContainerGrid>
    </Page>
  )
}
