import type { GetOfferSessionV2Response } from "../../store/api/v2/market"
import { Chip, TableCell, TableRow, Typography } from "@mui/material"
import { useMemo } from "react"
import { Stack } from "@mui/system"
import {
  AnnouncementRounded,
  CancelRounded,
  CheckCircleRounded,
  HourglassTopRounded,
} from "@mui/icons-material"
import { MarkdownRender } from "../../components/markdown/Markdown.lazy"
import { OrderSummarySectionV2 } from "../../components/orders/OrderSummarySectionV2"
import { useTranslation } from "react-i18next"
import { PAYMENT_TYPE_MAP } from "../../util/constants"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import type { OfferDetailsState } from "../../features/offers/hooks/useOfferDetails"
import { offerSummaryItems } from "./offerSummaryItems"
import { useFormatters } from "../../util/format"

/** Date, status, title, kind, description and price rows of the offer details table. */
export function OfferTermsRows({
  session,
  details,
  currentOffer,
}: {
  session: GetOfferSessionV2Response
  details: OfferDetailsState
  currentOffer: NonNullable<OfferDetailsState["currentOffer"]>
}) {
  const fmt = useFormatters()
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const { offerChanges, statusKey, statusColor } = details
  const v2SummaryItems = useMemo(
    () => offerSummaryItems(currentOffer),
    [currentOffer],
  )
  return (
    <>
      <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
        <TableCell component="th" scope="row">
          {t("OfferDetailsArea.date")}
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" justifyContent={"right"}>
            {fmt.dateTime(currentOffer.created_at, {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
            })}
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
        <TableCell component="th" scope="row">
          {t("OfferDetailsArea.status")}
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" justifyContent={"right"}>
            <Chip
              label={t(`OffersViewPaginated.${statusKey}`, session.status)}
              color={statusColor}
              icon={
                statusKey === "waitingSeller" ? (
                  <AnnouncementRounded />
                ) : statusKey === "waitingCustomer" ? (
                  <HourglassTopRounded />
                ) : statusKey === "rejected" ? (
                  <CancelRounded />
                ) : (
                  <CheckCircleRounded />
                )
              }
            />
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
        <TableCell component="th" scope="row">
          {t("OfferDetailsArea.title")}
        </TableCell>
        <TableCell
          align="right"
          sx={{ wordBreak: "break-word", overflowWrap: "break-word" }}
        >
          <Stack direction="row" justifyContent={"right"}>
            <Typography
              color={"text.secondary"}
              variant={"subtitle2"}
              sx={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
                textAlign: "right",
              }}
            >
              {currentOffer.title}
            </Typography>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
        <TableCell component="th" scope="row">
          {t("OfferDetailsArea.kind")}
        </TableCell>
        <TableCell
          align="right"
          sx={{ wordBreak: "break-word", overflowWrap: "break-word" }}
        >
          <Stack direction="row" justifyContent={"right"}>
            <Typography
              color={"text.secondary"}
              variant={"subtitle2"}
              sx={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
                textAlign: "right",
              }}
            >
              {currentOffer.kind}
            </Typography>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
        {/*<TableCell component="th" scope="row">*/}
        {/*  Description*/}
        {/*</TableCell>*/}
        <TableCell
          colSpan={2}
          sx={{ wordBreak: "break-word", overflowWrap: "break-word" }}
        >
          <Stack direction="column" spacing={theme.layoutSpacing.compact}>
            {t("OfferDetailsArea.details")}
            <Typography
              color={"text.secondary"}
              variant={"subtitle2"}
              component="div"
              sx={{ wordBreak: "break-word", overflowWrap: "break-word" }}
            >
              <MarkdownRender text={currentOffer.description} />
            </Typography>
            {v2SummaryItems.length > 0 && (
              <OrderSummarySectionV2
                items={v2SummaryItems}
                offerChanges={offerChanges}
              />
            )}
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
        <TableCell component="th" scope="row">
          {t("OfferDetailsArea.offer")}
        </TableCell>
        <TableCell
          align="right"
          sx={{ wordBreak: "break-word", overflowWrap: "break-word" }}
        >
          <Stack
            direction="row"
            justifyContent={"right"}
            spacing={1}
            alignItems="center"
          >
            <Typography
              color={"text.secondary"}
              variant={"subtitle2"}
              sx={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
                textAlign: "right",
              }}
            >
              {fmt.number(+currentOffer.cost)}{" "}
              <Typography
                color={"text.primary"}
                variant={"subtitle2"}
                display={"inline"}
                sx={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                aUEC {t(PAYMENT_TYPE_MAP.get(currentOffer.payment_type) || "")}
              </Typography>
            </Typography>
            {offerChanges?.costChanged && (
              <Chip
                label={t("contractsUi.newBadge")}
                size="small"
                color="primary"
              />
            )}
          </Stack>
        </TableCell>
      </TableRow>
    </>
  )
}
