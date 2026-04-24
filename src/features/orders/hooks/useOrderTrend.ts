import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import {
  useGetContractorOrderDataQuery,
  useGetUserOrderDataQuery,
} from "../api/ordersApi"
import type { ContractorOrderData } from "../domain/types"

export interface UseOrderTrendResult {
  orderData: ContractorOrderData | undefined
}

export function useOrgOrderTrend(): UseOrderTrendResult {
  const [contractor] = useCurrentOrg()
  const { data: orderData } = useGetContractorOrderDataQuery(
    {
      spectrum_id: contractor?.spectrum_id!,
      include_trends: true,
      assigned_only: false,
    },
    { skip: !contractor?.spectrum_id },
  )
  return { orderData }
}

export function useUserOrderTrend(): UseOrderTrendResult {
  const [contractor] = useCurrentOrg()

  const { data: contractorOrderData } = useGetContractorOrderDataQuery(
    {
      spectrum_id: contractor?.spectrum_id!,
      include_trends: true,
      assigned_only: true,
    },
    { skip: !contractor?.spectrum_id },
  )

  const { data: userOrderData } = useGetUserOrderDataQuery(
    { include_trends: true },
    { skip: !!contractor?.spectrum_id },
  )

  return { orderData: contractorOrderData || userOrderData }
}
