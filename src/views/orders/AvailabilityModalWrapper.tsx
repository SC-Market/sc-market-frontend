import { Box, Button } from "@mui/material"
import { useTranslation } from "react-i18next"
import { AvailabilitySelector } from "../../components/time/AvailabilitySelector"
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"

/**
 * The availability picker of the order form: a large week grid, so full
 * screen on phones and a wide dialog on desktop. The selector has its own
 * Save; Cancel closes without saving.
 */
export function AvailabilityModalWrapper(props: {
  open: boolean
  onClose: () => void
  title: string
  onSave: (selections: boolean[]) => void
  initialSelections: boolean[]
}) {
  const { t } = useTranslation()

  return (
    <ResponsiveDialog
      open={props.open}
      onClose={props.onClose}
      title={props.title}
      maxWidth="lg"
      mobile="fullScreen"
      disableBackdropClose
      actions={
        <Button onClick={props.onClose}>
          {t("accessibility.cancel", "Cancel")}
        </Button>
      }
    >
      <Box sx={{ mt: 1 }}>
        <AvailabilitySelector
          onSave={props.onSave}
          initialSelections={props.initialSelections}
        />
      </Box>
    </ResponsiveDialog>
  )
}
