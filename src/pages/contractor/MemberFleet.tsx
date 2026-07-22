import React from "react"
import { ShipStatus } from "../../views/fleet/ShipStatus"
import { ActiveDeliveries } from "../../views/fleet/ActiveDeliveries"
import { Box, Button, Grid, Typography } from "@mui/material"
import { AddRounded, LocalShippingRounded } from "@mui/icons-material"
import { useGetMyShips } from "../../features/fleet/api/shipsApi"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { PATHS } from "../../routes/paths"

export function MemberFleet() {
  const { t } = useTranslation()
  const { data: ships } = useGetMyShips()

  const headerActions = (
    <Box display={"flex"} justifyContent={"flex-end"}>
      <Link
        to={PATHS.myFleetImport}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Button
          startIcon={<AddRounded />}
          color={"secondary"}
          variant={"outlined"}
          sx={{
            marginRight: 2,
            marginBottom: 2,
          }}
        >
          {t("fleet.addShips")}
        </Button>
      </Link>
      <Button
        startIcon={<LocalShippingRounded />}
        variant={"outlined"}
        sx={{
          marginRight: 2,
          marginBottom: 2,
        }}
      >
        {t("fleet.createDelivery")}
      </Button>
    </Box>
  )

  return (
    <StandardPageLayout
      title={t("fleet.myFleetTitle")}
      headerTitle={t("fleet.myFleetTitle")}
      headerActions={headerActions}
      sidebarOpen={true}
      maxWidth="lg"
    >
      <ActiveDeliveries />

      {(ships || []).map((ship, index) => (
        <ShipStatus ship={ship} key={ship.ship_id} index={index} />
      ))}
    </StandardPageLayout>
  )
}
