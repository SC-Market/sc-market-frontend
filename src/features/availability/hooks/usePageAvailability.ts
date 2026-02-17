import { useProfileGetAvailabilityQuery } from '../../../store/profile'

interface UsePageAvailabilityResult {
  data: {
    selections: Array<{ start: number; finish: number }>
  } | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

export function usePageAvailability(
  spectrumId: string | undefined,
): UsePageAvailabilityResult {
  const availabilityQuery = useProfileGetAvailabilityQuery(spectrumId, {
    skip: !spectrumId,
  })

  return {
    data: availabilityQuery.data,
    isLoading: availabilityQuery.isLoading,
    isFetching: availabilityQuery.isFetching,
    error: availabilityQuery.error,
    refetch: availabilityQuery.refetch,
  }
}
