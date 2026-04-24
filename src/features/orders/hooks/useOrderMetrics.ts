import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useGetContractorOrderMetricsQuery } from "../api/ordersApi"
import type { ContractorOrderMetrics } from "../domain/types"

export interface UseOrderMetricsResult {
  metrics: ContractorOrderMetrics | undefined
  isLoading: boolean
  error: unknown
}

export function useOrderMetrics(): UseOrderMetricsResult {
  const [contractor] = useCurrentOrg()
  const { data: metrics, isLoading, error } = useGetContractorOrderMetricsQuery(
    contractor?.spectrum_id!,
    { skip: !contractor?.spectrum_id },
  )
  return { metrics, isLoading, error }
}
