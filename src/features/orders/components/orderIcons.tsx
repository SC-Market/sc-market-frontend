import HandymanRoundedIcon from "@mui/icons-material/HandymanRounded"
import GppGoodRoundedIcon from "@mui/icons-material/GppGoodRounded"
import FlightRoundedIcon from "@mui/icons-material/FlightRounded"
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded"
import PublicRoundedIcon from "@mui/icons-material/PublicRounded"
import {
  CarRentalRounded,
  InfoRounded,
  LocalHospitalRounded,
} from "@mui/icons-material"
import MiscellaneousServicesRoundedIcon from "@mui/icons-material/MiscellaneousServicesRounded"
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded"
import React from "react"
import type { OrderKind } from "../domain/types"

export const orderIcons: Record<OrderKind, React.ReactElement> = {
  Support: <HandymanRoundedIcon />,
  Escort: <GppGoodRoundedIcon />,
  Transport: <FlightRoundedIcon />,
  Construction: <ConstructionRoundedIcon />,
  "Resource Acquisition": <PublicRoundedIcon />,
  Rental: <CarRentalRounded />,
  Delivery: <LocalShippingRoundedIcon />,
  Medical: <LocalHospitalRounded />,
  "Intelligence Services": <InfoRounded />,
  Misc: <MiscellaneousServicesRoundedIcon />,
  Custom: <MiscellaneousServicesRoundedIcon />,
}
