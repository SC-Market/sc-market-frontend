import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { useTranslation } from "react-i18next"
import { AvailabilitySelector } from "../../components/time/AvailabilitySelector"
import { BottomSheet } from "../../components/mobile/BottomSheet"

// Helper component for Availability Modal that uses BottomSheet on mobile
export function AvailabilityModalWrapper(props: {
  open: boolean
  onClose: () => void
  title: string
  onSave: (selections: boolean[]) => void
  initialSelections: boolean[]
}) {
  const isMobile = useIsMobile()
  const { t } = useTranslation()

  if (isMobile) {
    return (
      <BottomSheet
        open={props.open}
        onClose={props.onClose}
        title={props.title}
        maxHeight="90vh"
      >
        <Box sx={{ mt: 1 }}>
          <AvailabilitySelector
            onSave={props.onSave}
            initialSelections={props.initialSelections}
          />
        </Box>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={props.onClose}>
            {t("accessibility.cancel", "Cancel")}
          </Button>
        </Box>
      </BottomSheet>
    )
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="availability-modal-title"
    >
      <DialogTitle id="availability-modal-title">{props.title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <AvailabilitySelector
            onSave={props.onSave}
            initialSelections={props.initialSelections}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>
          {t("accessibility.cancel", "Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
