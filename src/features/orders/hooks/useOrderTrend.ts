import {
  useGetContractorOrderDataQuery,
  useGetUserOrderDataQuery,
} from "../api/ordersApi"
import type { ContractorOrderData } from "../domain/types"

export interface UseOrderTrendResult {
  orderData: ContractorOrderData | undefined
}

export function useOrgOrderTrend(spectrumId: string | undefined): UseOrderTrendResult {
  const { data: orderData } = useGetContractorOrderDataQuery(
    {
      spectrum_id: spectrumId!,
      include_trends: true,
      assigned_only: false,
    },
    { skip: !spectrumId },
  )
  return { orderData }
}

export function useUserOrderTrend(spectrumId: string | undefined): UseOrderTrendResult {
  const { data: contractorOrderData } = useGetContractorOrderDataQuery(
    {
      spectrum_id: spectrumId!,
      include_trends: true,
      assigned_only: true,
    },
    { skip: !spectrumId },
  )

  const { data: userOrderData } = useGetUserOrderDataQuery(
    { include_trends: true },
    { skip: !!spectrumId },
  )

  return { orderData: contractorOrderData || userOrderData }
}
