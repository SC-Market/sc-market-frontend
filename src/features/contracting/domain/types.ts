import type { MinimalUser } from "../../../datatypes/User"
import type { OrderKind, PaymentType } from "../../orders/domain/types"

export interface PublicContract {
  id: string
  title: string
  customer: MinimalUser
  description: string
  kind: OrderKind
  collateral: number
  cost: number
  payment_type: PaymentType
  timestamp: Date
  status: string
  expiration: Date
}

export interface ContractOfferBody {
  contract_id: string
  contractor: string | null
  title: string
  description: string
  kind: string
  collateral: number
  cost: number
  payment_type: PaymentType
}

export interface PublicContractBody {
  title: string
  description: string
  kind: string
  collateral: number
  cost: number
  payment_type: PaymentType
}
