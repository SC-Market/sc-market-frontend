/**
 * @deprecated Import from "features/orders/domain/types" instead.
 * This file re-exports for backward compatibility during migration.
 */
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

// Re-export all pure types from the new canonical location
export type {
  OrderStatus,
  OrderKind,
  PaymentType,
  Order,
  OrderAvailability,
  OrderApplicant,
  OrderComment,
  OrderReview,
  OrderBody,
  ServiceBody,
  Service,
  OrderStub,
  OrderSearchSortMethod,
  OrderSearchStatus,
  OrderSearchQuery,
  OrderTrendDatapoint,
  OrderAnalytics,
} from "../features/orders/domain/types"

export { makeOrderTrend } from "../features/orders/domain/formatters"

// Icon map stays here because it contains JSX (rendering concern)
// but is widely imported — will be moved to features/orders/components/ later
export const orderIcons = {
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
