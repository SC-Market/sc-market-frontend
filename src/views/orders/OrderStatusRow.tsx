import { ButtonGroup, TableCell, TableRow } from "@mui/material"
import { Stack } from "@mui/system"
import LoadingButton from "@mui/lab/LoadingButton"
import {
  CancelRounded,
  DoneRounded,
  PlayArrowRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import type { OrderDetailsState } from "../../features/orders/hooks/useOrderDetails"

/** Status buttons (complete, begin, reset, cancel) for the order details table. */
export function OrderStatusRow({ details }: { details: OrderDetailsState }) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useBreakpointDown("sm")
  const { t } = useTranslation()
  const { updateOrderStatus, actions } = details
  return (
    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      <TableCell component="th" scope="row">
        {t("orderDetailsArea.update_status")}
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
          {/* The customer (not working on it) may only cancel */}
          {actions.canCancel && !actions.canSetStatus && (
            <LoadingButton
              variant={"contained"}
              color={"error"}
              startIcon={<CancelRounded />}
              onClick={() => updateOrderStatus("cancelled")}
              fullWidth={isMobile}
            >
              {t("orderDetailsArea.cancel")}
            </LoadingButton>
          )}
          {actions.canSetStatus &&
            (isMobile ? (
              <Stack
                direction="column"
                spacing={theme.layoutSpacing.compact}
                sx={{ width: "100%" }}
              >
                {actions.canComplete && (
                  <LoadingButton
                    variant={"contained"}
                    color={"success"}
                    startIcon={<DoneRounded />}
                    onClick={() => updateOrderStatus("fulfilled")}
                    fullWidth
                  >
                    {t("orderDetailsArea.complete_order")}
                  </LoadingButton>
                )}
                {actions.canStart && (
                  <LoadingButton
                    variant={"contained"}
                    color={"warning"}
                    startIcon={<PlayArrowRounded />}
                    onClick={() => updateOrderStatus("in-progress")}
                    fullWidth
                  >
                    {t("orderDetailsArea.begin_work")}
                  </LoadingButton>
                )}
                {actions.canResetToNotStarted && (
                  <LoadingButton
                    variant={"contained"}
                    color={"info"}
                    startIcon={<PlayArrowRounded />}
                    onClick={() => updateOrderStatus("not-started")}
                    fullWidth
                  >
                    {t("orderDetailsArea.not_started")}
                  </LoadingButton>
                )}
                {actions.canCancel && (
                  <LoadingButton
                    variant={"contained"}
                    color={"error"}
                    startIcon={<CancelRounded />}
                    onClick={() => updateOrderStatus("cancelled")}
                    fullWidth
                  >
                    {t("orderDetailsArea.cancel")}
                  </LoadingButton>
                )}
              </Stack>
            ) : (
              <ButtonGroup
                variant="contained"
                aria-label={t("orderDetailsArea.update_status")}
              >
                {actions.canComplete && (
                  <LoadingButton
                    variant={"contained"}
                    color={"success"}
                    startIcon={<DoneRounded />}
                    onClick={() => updateOrderStatus("fulfilled")}
                  >
                    {t("orderDetailsArea.complete_order")}
                  </LoadingButton>
                )}
                {actions.canStart && (
                  <LoadingButton
                    variant={"contained"}
                    color={"warning"}
                    startIcon={<PlayArrowRounded />}
                    onClick={() => updateOrderStatus("in-progress")}
                  >
                    {t("orderDetailsArea.begin_work")}
                  </LoadingButton>
                )}
                {actions.canResetToNotStarted && (
                  <LoadingButton
                    variant={"contained"}
                    color={"info"}
                    startIcon={<PlayArrowRounded />}
                    onClick={() => updateOrderStatus("not-started")}
                  >
                    {t("orderDetailsArea.not_started")}
                  </LoadingButton>
                )}
                {actions.canCancel && (
                  <LoadingButton
                    variant={"contained"}
                    color={"error"}
                    startIcon={<CancelRounded />}
                    onClick={() => updateOrderStatus("cancelled")}
                  >
                    {t("orderDetailsArea.cancel")}
                  </LoadingButton>
                )}
              </ButtonGroup>
            ))}
        </Stack>
      </TableCell>
    </TableRow>
  )
}
