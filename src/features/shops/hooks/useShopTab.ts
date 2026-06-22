import { useMemo } from "react"
import { useParams } from "react-router-dom"

const NAME_TO_INDEX = new Map([
  ["", 0],
  ["listings", 0],
  ["services", 1],
  ["reviews", 2],
  ["about", 3],
  ["order", 4],
])

export function useShopTab() {
  const { tab } = useParams<{ tab?: string }>()
  const page = useMemo(() => NAME_TO_INDEX.get(tab || "") ?? 0, [tab])

  return page
}
