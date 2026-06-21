import { useMemo } from "react"
import { useParams } from "react-router-dom"

const NAME_TO_INDEX = new Map([
  ["", 0],
  ["store", 0],
  ["about", 1],
  ["order", 2],
  ["members", 3],
  ["recruiting", 4],
  ["reviews", 5],
])

export function useOrgTab() {
  const { tab } = useParams<{ tab?: string }>()
  const page = useMemo(() => NAME_TO_INDEX.get(tab || "") ?? 0, [tab])

  return page
}
