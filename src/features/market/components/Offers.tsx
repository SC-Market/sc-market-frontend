import { MouseEventHandler } from "react"
import { HeadCell } from "../../../components/table/PaginatedTable"
import { MarketOffer } from "../domain/types"

export interface OfferRowProps {
  row: MarketOffer & { total: number }
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}

export const OffersHeadCells: readonly HeadCell<
  MarketOffer & { total: number }
>[] = [
  {
    id: "user",
    numeric: false,
    disablePadding: false,
    label: "MarketOffers.user",
    minWidth: 135,
  },
  {
    id: "timestamp",
    numeric: false,
    disablePadding: false,
    label: "",
  },
  {
    id: "offer",
    numeric: true,
    disablePadding: false,
    label: "MarketOffers.offer",
    minWidth: 135,
  },
  {
    id: "quantity",
    numeric: true,
    disablePadding: false,
    label: "MarketOffers.quantity",
    minWidth: 135,
  },
  {
    id: "total",
    numeric: true,
    disablePadding: false,
    label: "MarketOffers.total",
  },
  {
    id: "offer_id",
    numeric: false,
    disablePadding: false,
    label: "",
  },
]
