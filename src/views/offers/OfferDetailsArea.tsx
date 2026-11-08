import type { GetOfferSessionV2Response } from "../../store/api/v2/market"
import { useGetShopQuery } from "../../store/api/v2/market"
import {
  Grid,
  Link as MaterialLink,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material"
import { ConfirmDialog } from "../../components/dialog/ConfirmDialog"
import { useEffect, useState } from "react"
import { UserDetails } from "../../components/list/UserDetails"
import { Stack } from "@mui/system"
import {} from "@mui/icons-material"
import { useCurrentChat, useGetChatByOfferIDQuery } from "../../features/chats"
import { MessagesBody } from "../../features/chats"
import LoadingButton from "@mui/lab/LoadingButton"
import { DiscordThreadControl } from "../../components/orders/DiscordThreadControl"
import { Link, useSearchParams } from "react-router-dom"
import { ListingSellerRating } from "../../components/rating/ListingRating"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useOfferDetails } from "../../features/offers/hooks/useOfferDetails"
import { OfferAcceptRow } from "./OfferAcceptRow"
import { OfferAssignedRow } from "./OfferAssignedRow"
import { OfferTermsRows } from "./OfferTermsRows"
import { SHOP_PATHS, ORDER_PATHS } from "../../routes/paths"
import { useClearEntityNotifications } from "../../features/notifications/hooks/useClearEntityNotifications"

export function OfferMessagesArea(props: {
  session: GetOfferSessionV2Response
}) {
  const { session } = props
  const [currentChat, setCurrentChat] = useCurrentChat()
  const { data: chatObj } = useGetChatByOfferIDQuery(session.session_id, {
    skip: !session,
  })

  useClearEntityNotifications("offer_message", session.session_id)

  useEffect(() => {
    setCurrentChat(chatObj)

    return () => {
      setCurrentChat(null)
    }
  }, [chatObj, setCurrentChat])

  return (
    <Grid item xs={12} lg={4} md={6}>
      <Paper
        sx={{
          maxHeight: 650,
          display: "flex",
          alignItems: "space-between",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {currentChat && (
          <MessagesBody key={currentChat.chat_id} forceDesktop={true} />
        )}
      </Paper>
    </Grid>
  )
}

export function OfferDetailsArea(props: {
  session: GetOfferSessionV2Response
  selectedOfferIndex?: number
}) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useBreakpointDown("sm")
  const { t } = useTranslation()
  const { session } = props

  const details = useOfferDetails(session, props.selectedOfferIndex)
  const {
    profile,
    publicContract,
    currentOffer,
    statusKey,
    showCancel,
    isUpdatingStatus,
    updateStatusCallback,
    createThread,
    refetchOffer,
  } = details

  const { data: shop } = useGetShopQuery(
    { slug: session.shop_slug! },
    { skip: !session.shop_slug },
  )

  const isLatestOffer = (props.selectedOfferIndex ?? 0) === 0

  // ?action=withdraw (the "Withdraw the offer" link in a still-waiting
  // reminder): open the withdraw confirmation for the customer. Nothing is
  // withdrawn until they confirm.
  const [searchParams, setSearchParams] = useSearchParams()
  const isCustomer =
    !!profile && profile.username === session.customer?.username
  const canWithdraw = isCustomer && showCancel && isLatestOffer
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  useEffect(() => {
    if (searchParams.get("action") !== "withdraw" || !profile) return
    if (canWithdraw) setWithdrawOpen(true)
    const next = new URLSearchParams(searchParams)
    next.delete("action")
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, canWithdraw, profile])

  if (!currentOffer) {
    return (
      <Grid item xs={12} lg={8} md={6} sx={{ minWidth: 0 }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            {t("OfferDetailsArea.noOffer", "No offer details available")}
          </Typography>
        </Paper>
      </Grid>
    )
  }

  return (
    <Grid item xs={12} lg={8} md={6} sx={{ minWidth: 0 }}>
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          overflowX: "auto",
          overflowY: "visible",
        }}
      >
        <Table
          aria-label={t("offers.details_table")}
          sx={{ tableLayout: "auto" }}
        >
          <TableBody>
            <TableRow
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell component="th" scope="row">
                {t("OfferDetailsArea.customer")}
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent={"right"}>
                  <Stack direction={"column"}>
                    <UserDetails user={session.customer} />
                    <ListingSellerRating user={session.customer} />
                  </Stack>
                </Stack>
              </TableCell>
            </TableRow>
            {session.contract_id && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("OfferDetailsArea.associatedContract")}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent={"right"}>
                    <MaterialLink
                      component={Link}
                      underline="hover"
                      to={ORDER_PATHS.publicContract(session.contract_id)}
                      color={"text.secondary"}
                    >
                      {publicContract?.title}
                    </MaterialLink>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
            {/* Seller (shop) row */}
            {session.shop_slug && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("OfferDetailsArea.seller")}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent="right">
                    <Stack direction="column" alignItems="flex-end">
                      <MaterialLink
                        component={Link}
                        to={SHOP_PATHS.profile(session.shop_slug!)}
                        underline="hover"
                        color="text.secondary"
                        variant="subtitle2"
                      >
                        {shop?.name || session.shop_slug}
                      </MaterialLink>
                      <ListingSellerRating
                        shop={{
                          name: shop?.name || session.shop_slug,
                          slug: session.shop_slug,
                          rating: shop?.rating ?? undefined,
                          rating_count: shop?.rating_count,
                        }}
                      />
                    </Stack>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {/* Assigned row */}
            <OfferAssignedRow session={session} details={details} />
            <OfferTermsRows
              session={session}
              details={details}
              currentOffer={currentOffer}
            />
            {session.discord_server_id && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("OfferDetailsArea.discordThread")}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent={"right"}>
                    <DiscordThreadControl
                      serverId={session.discord_server_id}
                      threadId={session.discord_thread_id}
                      create={createThread}
                      refetch={refetchOffer}
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            )}
            {session.discord_invite && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("OfferDetailsArea.discordServerInvite", {
                    defaultValue: "Discord Server Invite",
                  })}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent={"right"}>
                    <MaterialLink
                      href={session.discord_invite}
                      variant={"subtitle1"}
                      underline={"hover"}
                      color={"text.secondary"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("OfferDetailsArea.joinServer", {
                        defaultValue: "Join Server",
                      })}
                    </MaterialLink>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
            <OfferAcceptRow
              session={session}
              details={details}
              isLatestOffer={isLatestOffer}
            />
            {showCancel && isLatestOffer && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("OfferDetailsArea.cancelOrder")}
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
                      color={"error"}
                      variant={"contained"}
                      loading={isUpdatingStatus}
                      onClick={() => updateStatusCallback("cancelled")}
                      disabled={statusKey === "rejected"}
                      fullWidth={isMobile}
                    >
                      {t("OfferDetailsArea.cancel")}
                    </LoadingButton>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <ConfirmDialog
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        title={t("OfferDetailsArea.withdrawTitle", "Withdraw this offer?")}
        message={t(
          "OfferDetailsArea.withdrawBody",
          "The seller won't be able to accept it any more. To keep waiting instead, close this.",
        )}
        cancelLabel={t("OfferDetailsArea.keepWaiting", "Keep waiting")}
        confirmLabel={t("OfferDetailsArea.withdraw", "Withdraw the offer")}
        destructive
        loading={isUpdatingStatus}
        onConfirm={() => {
          setWithdrawOpen(false)
          updateStatusCallback("cancelled")
        }}
      />
    </Grid>
  )
}
