// OrdersAssigned page doesn't need a data fetching hook
// The MemberAssignments and OrderMetrics components handle their own data fetching
export function usePageOrdersAssigned() {
  return {
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: undefined,
    refetch: () => {},
  }
}
