import { useGetOrderByIdQuery } from "../../../store/orders"

export interface UsePageContractResult {
  data:
    | {
        contract: ReturnType<typeof useGetOrderByIdQuery>["data"]
      }
    | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

/**
 * Page hook for ContractInfo page
 * Composes contract-related queries
 */
export function usePageContract(contractId: string): UsePageContractResult {
  const contractQuery = useGetOrderByIdQuery(contractId)

  return {
    data: contractQuery.data
      ? {
          contract: contractQuery.data,
        }
      : undefined,
    isLoading: contractQuery.isLoading,
    isFetching: contractQuery.isFetching,
    error: contractQuery.error,
    refetch: () => {
      contractQuery.refetch()
    },
  }
}
