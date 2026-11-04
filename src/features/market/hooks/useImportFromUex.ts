import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useImportFromUexMutation,
  type ImportFromUexApiArg,
  type ImportFromUexApiResponse,
} from "../../../store/api/v2/market"
import { listingApiError } from "../domain/listingFormErrors"

type UexListing = NonNullable<ImportFromUexApiArg["body"]["listings"]>[number]

export type UexImportOutcome =
  | { ok: true; result: ImportFromUexApiResponse }
  | { ok: false; error: string }

/**
 * Import listings from a UEX account: preview what would be imported, then
 * import the chosen ones. Errors come back as text for the dialog to show.
 */
export function useImportFromUex(shopId: string) {
  const { t } = useTranslation()
  const [importFromUex, { isLoading }] = useImportFromUexMutation()

  const run = useCallback(
    async (
      body: ImportFromUexApiArg["body"],
      fallback: string,
    ): Promise<UexImportOutcome> => {
      try {
        return { ok: true, result: await importFromUex({ body }).unwrap() }
      } catch (e) {
        return { ok: false, error: listingApiError(e, fallback).message }
      }
    },
    [importFromUex],
  )

  const preview = useCallback(
    (username: string) =>
      run(
        { uex_username: username.trim(), shop_id: shopId },
        t(
          "ItemStock.importFromUexFetchError",
          "Couldn't fetch your UEX listings",
        ),
      ),
    [run, shopId, t],
  )

  const confirm = useCallback(
    (username: string, listings: UexListing[]) =>
      run(
        {
          uex_username: username.trim(),
          shop_id: shopId,
          listings,
          confirm: true,
        },
        t("ItemStock.importFromUexError", "The import failed"),
      ),
    [run, shopId, t],
  )

  return { preview, confirm, isLoading }
}
