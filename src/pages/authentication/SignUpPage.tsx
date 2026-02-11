import React from "react"
import { Navigate } from "react-router-dom"
import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { SignUpArea } from "../../views/authentication/SignUpArea"
import { useGetUserProfileQuery } from "../../store/profile"
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

export function SignUpPage() {
  const { t } = useTranslation()
  const profile = useGetUserProfileQuery()

  if (profile.data) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Page title={t("auth.signUpTitle", "Sign up for SC Market")}>
      <ContainerGrid
        maxWidth="sm"
        sidebarOpen={false}
        noFooter
        noTopSpacer
        GridProps={{
          sx: {
            minHeight: "calc(100vh - 64px)",
            alignItems: "center",
          },
        }}
        sx={{
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
        <SignUpArea />
      </ContainerGrid>
    </Page>
  )
}
