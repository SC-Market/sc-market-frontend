import { useGetMyShips } from "../../../store/ships"

export interface FleetPageData {
  ships: ReturnType<typeof useGetMyShips>["data"]
}

export function usePageFleet() {
  const shipsQuery = useGetMyShips()

  return {
    data: shipsQuery.data
      ? {
          ships: shipsQuery.data,
        }
      : undefined,
    isLoading: shipsQuery.isLoading,
    isFetching: shipsQuery.isFetching,
    error: shipsQuery.error,
    refetch: () => {
      shipsQuery.refetch()
    },
  }
}
