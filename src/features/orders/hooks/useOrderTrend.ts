import {
  useGetContractorOrderDataQuery,
  useGetUserOrderDataQuery,
} from "../api/ordersApi"
import type { ContractorOrderData } from "../domain/types"

export interface UseOrderTrendResult {
  orderData: ContractorOrderData | undefined
}

export function useOrgOrderTrend(spectrumId: string | undefined, shopId?: string): UseOrderTrendResult {
  const { data: orderData } = useGetContractorOrderDataQuery(
    {
      spectrum_id: spectrumId!,
      include_trends: true,
      assigned_only: false,
      shop_id: shopId,
    },
    { skip: !spectrumId },
  )
  return { orderData }
}

export function useUserOrderTrend(spectrumId: string | undefined, shopId?: string): UseOrderTrendResult {
  const { data: contractorOrderData } = useGetContractorOrderDataQuery(
    {
      spectrum_id: spectrumId!,
      include_trends: true,
      assigned_only: true,
      shop_id: shopId,
    },
    { skip: !spectrumId },
  )

  const { data: userOrderData } = useGetUserOrderDataQuery(
    { include_trends: true },
    { skip: !!spectrumId },
  )

  return { orderData: contractorOrderData || userOrderData }
}
