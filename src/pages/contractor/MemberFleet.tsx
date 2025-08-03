import React from "react"
import { ShipStatus } from "../../views/fleet/ShipStatus"
import { RegisterShip } from "../../views/fleet/RegisterShip"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { ActiveDeliveries } from "../../views/fleet/ActiveDeliveries"
import { Box, Button, Grid, Typography } from "@mui/material"
import { AddRounded, LocalShippingRounded } from "@mui/icons-material"
import { useGetMyShips } from "../../store/ships"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

export function MemberFleet() {
  const { t } = useTranslation()
  const { data: ships } = useGetMyShips()

  return (
    <ContainerGrid maxWidth={"lg"} sidebarOpen={true}>
      <Grid item xs={12}>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Typography
            variant={"h4"}
            sx={{ fontWeight: "bold" }}
            color={"text.secondary"}
          >
            {t("fleet.myFleetTitle")}
          </Typography>

          <Box display={"flex"} justifyContent={"flex-end"}>
            <Link
              to={`/myfleet/import`}
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
        </Box>
      </Grid>

      <ActiveDeliveries />
      {/*<RegisterShip/>*/}

      {(ships || []).map((ship, index) => (
        <ShipStatus ship={ship} key={ship.ship_id} index={index} />
      ))}
    </ContainerGrid>
  )
}
