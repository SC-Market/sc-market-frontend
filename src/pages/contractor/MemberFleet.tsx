import React from "react"
import { ShipStatus } from "../../views/fleet/ShipStatus"
import { RegisterShip } from "../../views/fleet/RegisterShip"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { ActiveDeliveries } from "../../views/fleet/ActiveDeliveries"
import { useGetMyShips } from "../../store/ships"
import { Link } from "react-router-dom"
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
import CreateRounded from '@mui/icons-material/CreateRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import LocalShippingRounded from '@mui/icons-material/LocalShippingRounded';

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
