import { HeaderTitle } from "../../components/typography/HeaderTitle"
import React from "react"
import { CustomerList } from "../../views/people/Customers"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Page } from "../../components/metadata/Page"
import {
  AdminDailyActivity,
  AdminMembershipAnalytics,
  AdminUserList,
} from "../../views/people/AllUsers"
import { AdminExpressVerify } from "../../views/authentication/AdminExpressVerify"
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

export function CustomerPage(props: {
  contractors?: boolean
  members?: boolean
  customers?: boolean
  users?: boolean
}) {
  const { t } = useTranslation()

  return (
    <Page title={t("customerList.customers")}>
      <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
        <HeaderTitle>{t("people.title")}</HeaderTitle>

        <CustomerList {...props} />
      </ContainerGrid>
    </Page>
  )
}

export function AdminUserListPage() {
  const { t } = useTranslation()

  return (
    <Page title={t("customerList.customers")}>
      <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
        <HeaderTitle>{t("people.title")}</HeaderTitle>

        <AdminDailyActivity />
        <AdminMembershipAnalytics />
        <AdminUserList />
        <AdminExpressVerify />
      </ContainerGrid>
    </Page>
  )
}
