import { useMemo } from "react"
import { useParams } from "react-router-dom"

const NAME_TO_INDEX = new Map([
  ["", 0],
  ["store", 0],
  ["services", 1],
  ["about", 2],
  ["order", 3],
  ["members", 4],
  ["recruiting", 5],
  ["reviews", 6],
])

export function useOrgTab() {
  const { tab } = useParams<{ tab?: string }>()
  const page = useMemo(() => NAME_TO_INDEX.get(tab || "") ?? 0, [tab])

  return page
}
