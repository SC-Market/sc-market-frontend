import { useEffect, useMemo, useState } from "react"
import { useGetPriceStatsQuery } from "../../../store/api/v2/market"
import { getQualityMode } from "../../../util/qualityMode"
import {
  emptyQuickListForm,
  marketPriceHint,
  quickListTotal,
  suggestedQuickListPrice,
  type QuickListBatch,
  type QuickListForm,
  type QuickListItem,
} from "../domain/quickList"
import {
  newBatch,
  type QuickListError,
  type QuickListField,
} from "./quickListFields"

/**
 * The Quick List form state: the fields, the field errors, the item and its
 * market price hint, and the stock batch editors.
 */
export function useQuickListForm(pageItem: QuickListItem | null) {
  const [form, setForm] = useState<QuickListForm>(() =>
    emptyQuickListForm(pageItem),
  )
  const [itemPicked, setItemPicked] = useState(!!pageItem)
  const [priceTouched, setPriceTouched] = useState(false)
  const [error, setError] = useState<QuickListError | null>(null)
  const item = form.item
  const qualityMode = getQualityMode(item?.type)
  const update = (patch: Partial<QuickListForm>) =>
    setForm((prev) => ({ ...prev, ...patch }))
  const clearError = (field: QuickListField) =>
    setError((prev) =>
      prev?.field === field || prev?.field === "form" ? null : prev,
    )

  // The market price: the hint under Price, and the price to start from
  // currentData: never the previous item's numbers while the new ones load
  const { currentData: priceStats } = useGetPriceStatsQuery(
    { id: item?.id ?? "" },
    { skip: !item },
  )
  const hint = useMemo(
    () => (item ? marketPriceHint(priceStats) : null),
    [item, priceStats],
  )
  const suggested = item ? suggestedQuickListPrice(priceStats) : null
  useEffect(() => {
    if (!priceTouched && suggested != null)
      setForm((prev) => ({ ...prev, price: suggested }))
  }, [suggested, priceTouched])

  const pickItem = (next: QuickListItem | null) => {
    clearError("item")
    setPriceTouched(false)
    setForm((prev) => ({
      ...prev,
      item: next,
      price: 0,
      qualityTier: undefined,
    }))
  }

  const total = quickListTotal(form)
  const perBatch = form.stockMode === "batches" && form.pricePerBatch

  const fieldError = (field: QuickListField) =>
    error?.field === field ? error.message : undefined

  const updateBatch = (key: string, patch: Partial<QuickListBatch>) => {
    clearError("batches")
    setForm((prev) => ({
      ...prev,
      batches: prev.batches.map((b) =>
        b.key === key ? { ...b, ...patch } : b,
      ),
    }))
  }

  const setStockMode = (mode: QuickListForm["stockMode"]) => {
    clearError("quantity")
    clearError("batches")
    setForm((prev) => ({
      ...prev,
      stockMode: mode,
      // Splitting starts with one batch holding the whole quantity
      batches:
        mode === "batches" && prev.batches.length === 0
          ? [
              {
                ...newBatch(),
                quantity: prev.quantity > 0 ? prev.quantity : 1,
                quality_tier: prev.qualityTier,
              },
            ]
          : prev.batches,
    }))
  }

  return {
    form,
    setForm,
    itemPicked,
    setItemPicked,
    setPriceTouched,
    error,
    setError,
    item,
    qualityMode,
    update,
    clearError,
    hint,
    pickItem,
    total,
    perBatch,
    fieldError,
    updateBatch,
    setStockMode,
  }
}
