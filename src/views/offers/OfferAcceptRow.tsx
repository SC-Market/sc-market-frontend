import type { GetOfferSessionV2Response } from "../../store/api/v2/market"
import { TableCell, TableRow } from "@mui/material"
import { Stack } from "@mui/system"
import LoadingButton from "@mui/lab/LoadingButton"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import type { OfferDetailsState } from "../../features/offers/hooks/useOfferDetails"
import { ORDER_PATHS } from "../../routes/paths"

/** Accept / counter-offer / reject row of the offer details table. */
export function OfferAcceptRow({
  session,
  details,
  isLatestOffer,
}: {
  session: GetOfferSessionV2Response
  details: OfferDetailsState
  isLatestOffer: boolean
}) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useBreakpointDown("sm")
  const { t } = useTranslation()
  const { showAccept, isUpdatingStatus, updateStatusCallback } = details
  return (
    showAccept &&
    isLatestOffer && (
      <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
        <TableCell component="th" scope="row">
          {t("OfferDetailsArea.acceptOrDecline")}
        </TableCell>
        <TableCell
          align="right"
          sx={{ wordBreak: "break-word", overflowWrap: "break-word" }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent={{ xs: "stretch", sm: "right" }}
            spacing={theme.layoutSpacing.compact}
            sx={{ gap: theme.layoutSpacing.compact }}
          >
            <LoadingButton
              color={"success"}
              variant={"contained"}
              loading={isUpdatingStatus}
              onClick={() => updateStatusCallback("accepted")}
              fullWidth={isMobile}
            >
              {t("OfferDetailsArea.accept")}
            </LoadingButton>
            <Link
              to={ORDER_PATHS.counterOffer(session.session_id)}
              style={{ width: isMobile ? "100%" : "auto" }}
            >
              <LoadingButton
                color={"warning"}
                variant={"contained"}
                fullWidth={isMobile}
                sx={{ width: isMobile ? "100%" : "auto" }}
              >
                {t("OfferDetailsArea.counterOffer")}
              </LoadingButton>
            </Link>
            <LoadingButton
              color={"error"}
              variant={"contained"}
              loading={isUpdatingStatus}
              onClick={() => updateStatusCallback("rejected")}
              fullWidth={isMobile}
            >
              {t("OfferDetailsArea.reject")}
            </LoadingButton>
          </Stack>
        </TableCell>
      </TableRow>
    )
  )
}
