import { useGetContractorOrderMetricsQuery } from "../api/ordersApi"
import type { ContractorOrderMetrics } from "../domain/types"

export interface UseOrderMetricsResult {
  metrics: ContractorOrderMetrics | undefined
  isLoading: boolean
  error: unknown
}

export function useOrderMetrics(spectrumId: string | undefined, shopId?: string): UseOrderMetricsResult {
  const { data: metrics, isLoading, error } = useGetContractorOrderMetricsQuery(
    { spectrumId: spectrumId!, shopId },
    { skip: !spectrumId },
  )
  return { metrics, isLoading, error }
}
