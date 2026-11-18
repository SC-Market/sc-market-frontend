/**
 * Custom listings (no game item): the pieces the create form and Quick List
 * share. The item picker's own 'List "<typed>" as a custom item' row is in
 * GameItemSearchAutocomplete (onCustomItem).
 */
import { Alert, Button, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"

/** "Can't find your item…? Create a custom listing", under the item picker. */
export function CustomListingLink({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <Button
      size="small"
      variant="text"
      onClick={onClick}
      sx={{ mt: 0.5, textTransform: "none" }}
    >
      {t(
        "market.customItem.link",
        "Can't find your item, or not selling an in-game item? Create a custom listing",
      )}
    </Button>
  )
}

/** What a custom listing means, with the way back to picking a game item. */
export function CustomListingNotice({
  onPickGameItem,
}: {
  onPickGameItem: () => void
}) {
  const { t } = useTranslation()
  return (
    <Alert
      severity="info"
      action={
        <Button color="inherit" size="small" onClick={onPickGameItem}>
          {t("market.customItem.pickGameItem", "Pick a game item")}
        </Button>
      }
    >
      <Typography variant="body2" fontWeight="bold">
        {t("market.customItem.title", "Custom listing")}
      </Typography>
      <Typography variant="body2">
        {t(
          "market.customItem.explainer",
          "Not linked to an in-game item. Buyers find it by its title and description. It won't appear on item pages or in price history, and won't match buy orders.",
        )}
      </Typography>
    </Alert>
  )
}
