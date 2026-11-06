import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useCreateLocationMutation } from "../../../store/api/stockLotsApi"

/**
 * Create a custom stock location from a typed name (blank names are
 * ignored, over 255 characters is refused). `onCreated` gets the new
 * location's id; alerts the outcome.
 */
export function useCreateStockLocation() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [createLocation, { isLoading: isCreating }] =
    useCreateLocationMutation()

  const create = useCallback(
    async (name: string, onCreated: (locationId: string) => void) => {
      if (!name || name.trim().length === 0) {
        return
      }

      if (name.length > 255) {
        issueAlert({
          message: t(
            "LocationSelector.nameTooLong",
            "Location name must be 255 characters or less",
          ),
          severity: "error",
        })
        return
      }

      try {
        const result = await createLocation({ name: name.trim() }).unwrap()
        onCreated(result.location.location_id)
        issueAlert({
          message: t(
            "LocationSelector.createSuccess",
            "Custom location created",
          ),
          severity: "success",
        })
      } catch {
        issueAlert({
          message: t(
            "LocationSelector.createError",
            "Failed to create location",
          ),
          severity: "error",
        })
      }
    },
    [createLocation, issueAlert, t],
  )

  return { create, isCreating }
}
