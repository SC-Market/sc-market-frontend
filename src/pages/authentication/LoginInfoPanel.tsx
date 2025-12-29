import React from "react"
import Screencap from "../../assets/screencap.png"
import Screencap2 from "../../assets/screencap2.png"
import { Grid } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function LoginInfoPanel() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <>
      <Grid item xs={12}>
        {/*This is the login info panel.*/}

        <img
          src={Screencap}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: `${theme.spacing(theme.borderRadius.image)}px`,
          }}
          alt={t("loginInfoPanel.dashboardScreenshot")}
          loading="lazy"
        />
      </Grid>
      <Grid item xs={12}>
        {/*This is the login info panel.*/}

        <img
          src={Screencap2}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: `${theme.spacing(theme.borderRadius.image)}px`,
          }}
          alt={t("loginInfoPanel.dashboardScreenshot")}
          loading="lazy"
        />
      </Grid>
    </>
  )
}
