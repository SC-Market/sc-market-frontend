import React, { Suspense } from "react"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Page, PageFallback } from "../../components/metadata/Page"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { DISCORD_INVITE } from "../../util/constants"
import { HookProvider } from "../../hooks/HookProvider"
import { Root } from "../../components/layout/Root"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
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
import Link from '@mui/material/Link';
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

export function FrontendErrorBody() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const target = searchParams.get("target")
  const message = searchParams.get("message")

  const handleGoBack = () => {
    // Navigate back to the errored page if target is available
    if (target) {
      navigate(target)
    }
  }

  return (
    <>
      <Grid item xs={12}>
        <Typography
          variant={"h3"}
          sx={{ fontWeight: "bold" }}
          color={"text.secondary"}
          align={"center"}
        >
          {t("frontendError.title")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant={"subtitle2"}
          color={"text.primary"}
          align={"center"}
        >
          {t("frontendError.subtitle")}{" "}
          <Link rel="noopener noreferrer" target="_blank" href={DISCORD_INVITE}>
            <UnderlineLink color={"text.secondary"}>Discord</UnderlineLink>
          </Link>{" "}
          {t("frontendError.afterRefresh")}
        </Typography>

        <Typography variant={"body2"} align={"center"}>
          {t("frontendError.page")}: <code>{target}</code>
        </Typography>
        <Typography variant={"body2"} align={"center"}>
          {t("frontendError.message")}: <code>{message}</code>
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={2} justifyContent="center">
          {target && (
            <Grid item xs={12} sm="auto">
              <Button
                color={"primary"}
                variant={"contained"}
                size={"large"}
                fullWidth
                startIcon={<ArrowBackRounded />}
                onClick={handleGoBack}
              >
                {t("frontendError.goBackToPage", "Go Back to Page")}
              </Button>
            </Grid>
          )}
          <Grid item xs={12} sm="auto">
            <a
              href={"/dashboard"}
              style={{
                color: "inherit",
                textDecoration: "none",
                width: "100%",
              }}
            >
              <Button
                color={"secondary"}
                variant={"outlined"}
                size={"large"}
                fullWidth
              >
                {t("frontendError.returnToDashboard")}
              </Button>
            </a>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export function FrontendErrorPage() {
  const { t } = useTranslation()
  return (
    <Page title={t("frontendError.pageTitle")}>
      <ContainerGrid maxWidth={"md"} sidebarOpen={true}>
        <FrontendErrorBody />
      </ContainerGrid>
    </Page>
  )
}

export function FrontendErrorElement() {
  return (
    <HookProvider>
      <Root>
        <Suspense fallback={<PageFallback />}>
          <FrontendErrorPage />
        </Suspense>
      </Root>
    </HookProvider>
  )
}
