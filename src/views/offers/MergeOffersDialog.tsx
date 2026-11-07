import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import type { OfferSearchResult } from "../../features/offers/hooks/useOfferSearch"

// Map for all statuses
import { useFormatters } from "../../util/format"

/** Confirm dialog for merging the selected offers into one. */
export function MergeOffersDialog({ search }: { search: OfferSearchResult }) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const {
    selectedOfferIds,
    mergeModalOpen,
    setMergeModalOpen,
    isMerging,
    handleMergeOffers,
    totalCost,
  } = search
  return (
    <Dialog
      open={mergeModalOpen}
      onClose={() => {
        if (!isMerging) {
          setMergeModalOpen(false)
        }
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {t("OffersViewPaginated.merge_offers_confirm_title")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {t("OffersViewPaginated.merge_offers_confirm_body", {
            count: selectedOfferIds.length,
          })}
        </DialogContentText>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t("OffersViewPaginated.merge_offers_selected_count", {
            count: selectedOfferIds.length,
          })}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t("OffersViewPaginated.merge_offers_combined_cost", {
            cost: fmt.number(totalCost),
          })}
        </Typography>
        <DialogContentText variant="body2" color="warning.main">
          {t("OffersViewPaginated.merge_offers_warning")}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (!isMerging) {
              setMergeModalOpen(false)
            }
          }}
          disabled={isMerging}
        >
          {t("OffersViewPaginated.merge_offers_confirm_cancel")}
        </Button>
        <Button
          onClick={handleMergeOffers}
          color="primary"
          variant="contained"
          disabled={isMerging || selectedOfferIds.length < 2}
        >
          {t("OffersViewPaginated.merge_offers_confirm_button")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
