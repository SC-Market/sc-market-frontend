import { DialogContentText, Typography } from "@mui/material"
import { ConfirmDialog } from "../../components/dialog/ConfirmDialog"
import { useTranslation } from "react-i18next"
import type { OfferSearchResult } from "../../features/offers/hooks/useOfferSearch"
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
    <ConfirmDialog
      open={mergeModalOpen}
      onClose={() => setMergeModalOpen(false)}
      maxWidth="sm"
      title={t("OffersViewPaginated.merge_offers_confirm_title")}
      message={t("OffersViewPaginated.merge_offers_confirm_body", {
        count: selectedOfferIds.length,
      })}
      cancelLabel={t("OffersViewPaginated.merge_offers_confirm_cancel")}
      confirmLabel={t("OffersViewPaginated.merge_offers_confirm_button")}
      loading={isMerging}
      confirmDisabled={selectedOfferIds.length < 2}
      onConfirm={handleMergeOffers}
    >
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
    </ConfirmDialog>
  )
}
