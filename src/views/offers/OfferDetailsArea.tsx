import type { GetOfferSessionV2Response } from "../../store/api/v2/market"
import {
  Chip,
  Grid,
  Link as MaterialLink,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Autocomplete,
  TextField,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material"
import React, { useEffect, useMemo } from "react"
import { OrgDetails, UserDetails } from "../../components/list/UserDetails"
import { Stack } from "@mui/system"
import { format } from "../../util/time"
import {
  Announcement,
  Cancel,
  CheckCircle,
  HourglassTop,
  Close,
} from "@mui/icons-material"
import { MarkdownRender } from "../../components/markdown/Markdown.lazy"
import { useCurrentChat, useGetChatByOfferIDQuery } from "../../features/chats"
import {
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
} from "../../features/notifications/api/notificationApi"
import { MessagesBody } from "../../features/chats"
import LoadingButton from "@mui/lab/LoadingButton"
import { Link } from "react-router-dom"
import { OrderSummarySectionV2 } from "../../components/orders/OrderSummarySectionV2"
import { ListingSellerRating } from "../../components/rating/ListingRating"
import { useTranslation } from "react-i18next"
import { PAYMENT_TYPE_MAP } from "../../util/constants"
import { useTheme } from "@mui/material/styles"
import { useMediaQuery } from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useOfferDetails } from "../../features/offers/hooks/useOfferDetails"

export function OfferMessagesArea(props: { session: GetOfferSessionV2Response }) {
  const { session } = props
  const [currentChat, setCurrentChat] = useCurrentChat()
  const { data: chatObj } = useGetChatByOfferIDQuery(session.session_id, {
    skip: !session,
  })

  const { data: notificationsData } = useGetNotificationsQuery({
    page: 0,
    pageSize: 100,
    action: "offer_message",
    entityId: session.session_id,
  })

  const notifications = notificationsData?.notifications || []
  const [deleteNotification] = useNotificationDeleteMutation()

  useEffect(() => {
    // Since we're already filtering by action and entityId, we can delete all matching notifications
    if (notifications && notifications.length > 0) {
      const notificationIds = notifications.map((n) => n.notification_id)
      deleteNotification(notificationIds)
    }
  }, [notifications, deleteNotification])

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

export function OfferDetailsArea(props: { session: GetOfferSessionV2Response }) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const { t, i18n } = useTranslation()
  const { session } = props

  const {
    profile, org, issueAlert, publicContract,
    selectedOfferIndex, setSelectedOfferIndex,
    currentOffer, previousOffer, offerChanges,
    isEditingAssigned, setIsEditingAssigned,
    target, setTarget, targetObject, setTargetObject,
    options, members,
    handleAssignSave, handleAssignCancel, handleUnassign, handleClaimOffer,
    amContractor, amContractorManager,
    statusKey, statusColor,
    showAccept, showCancel,
    isUpdatingStatus, updateStatusCallback,
    createThread, createThreadLoading,
  } = useOfferDetails(session)

  const v2SummaryItems = useMemo(() => {
    if (!currentOffer?.market_listings?.length) return []
    return currentOffer.market_listings.flatMap((ml) => {
      if (ml.v2_variants.length > 0) {
        return ml.v2_variants.map((v) => ({
          order_item_id: v.variant_id,
          listing_id: ml.listing_id,
          item_id: "",
          listing_title: ml.title,
          variant: {
            variant_id: v.variant_id,
            attributes: v.attributes,
            display_name: v.display_name,
            short_name: v.short_name,
          },
          quantity: v.quantity,
          price_per_unit: v.price_per_unit,
          subtotal: v.quantity * v.price_per_unit,
        }))
      }
      return [{
        order_item_id: ml.listing_id,
        listing_id: ml.listing_id,
        item_id: "",
        listing_title: ml.title,
        variant: {
          variant_id: "",
          attributes: {},
          display_name: "Standard",
          short_name: "STD",
        },
        quantity: ml.quantity,
        price_per_unit: ml.price,
        subtotal: ml.quantity * ml.price,
      }]
    })
  }, [currentOffer])

  return (
    <Grid item xs={12} lg={8} md={6} sx={{ minWidth: 0 }}>
      {session.offers.length > 1 && (
        <Box sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Offer Version</InputLabel>
            <Select
              value={selectedOfferIndex}
              label="Offer Version"
              onChange={(e) => setSelectedOfferIndex(Number(e.target.value))}
            >
              {session.offers.map((_, index) => (
                <MenuItem key={index} value={index}>
                  {index === 0
                    ? "Most Recent"
                    : `Offer ${session.offers.length - index}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
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
                      to={`/contracts/public/${publicContract?.id}`}
                      color={"text.secondary"}
                    >
                      {publicContract?.title}
                    </MaterialLink>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <Stack direction="row" alignItems="center" spacing={1}>
                  {t("OfferDetailsArea.seller")}
                  {amContractorManager &&
                    !["accepted", "rejected"].includes(session.status) && (
                      <Button
                        size="small"
                        variant="text"
                        startIcon={isEditingAssigned ? <Close /> : undefined}
                        onClick={() => setIsEditingAssigned(!isEditingAssigned)}
                        sx={{ textTransform: "none", fontSize: "0.75rem" }}
                      >
                        {isEditingAssigned ? "Cancel" : "Assign"}
                      </Button>
                    )}
                </Stack>
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent="right" alignItems="center" spacing={1}>
                  <Stack direction="column">
                    {session.assigned_to ? (
                      <>
                        <UserDetails user={session.assigned_to} />
                        <ListingSellerRating
                          user={session.assigned_to}
                          contractor={session.contractor}
                        />
                      </>
                    ) : (
                      <>
                        {session.contractor && (
                          <OrgDetails org={session.contractor} />
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {t("orderDetailsArea.none", "None")}
                        </Typography>
                      </>
                    )}
                  </Stack>
                  {!session.assigned_to && amContractor && !["accepted", "rejected"].includes(session.status) && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleClaimOffer}
                    >
                      {t("orderDetailsArea.claim", "Claim")}
                    </Button>
                  )}
                </Stack>

                {/* Assign Member Dialog */}
                <Dialog
                  open={isEditingAssigned}
                  onClose={handleAssignCancel}
                  maxWidth="xs"
                  fullWidth
                >
                  <DialogTitle>{t("memberAssignArea.assignMember", "Assign Member")}</DialogTitle>
                  <DialogContent>
                    <Autocomplete
                      filterOptions={(x) => x}
                      fullWidth
                      size="small"
                      sx={{ mt: 1 }}
                      options={
                        target
                          ? options
                          : members
                              .map((u) => ({
                                username: u.username,
                                display_name: u.username,
                              }))
                              .slice(0, 8)
                      }
                      getOptionLabel={(option) =>
                        `${option.username} (${option.display_name})`
                      }
                      disablePortal
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t("memberAssignArea.handle")}
                          SelectProps={{
                            IconComponent: KeyboardArrowDownRoundedIcon,
                          }}
                        />
                      )}
                      value={targetObject}
                      onChange={(_event: React.SyntheticEvent, newValue) => {
                        setTargetObject(newValue)
                      }}
                      inputValue={target}
                      onInputChange={(_event, newInputValue) => {
                        setTarget(newInputValue)
                      }}
                    />
                  </DialogContent>
                  <DialogActions>
                    {session.assigned_to && (
                      <Button color="error" onClick={handleUnassign}>
                        {t("memberAssignArea.unassign", "Unassign")}
                      </Button>
                    )}
                    <Box sx={{ flex: 1 }} />
                    <Button onClick={handleAssignCancel}>
                      {t("common.cancel", "Cancel")}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleAssignSave}
                      disabled={!targetObject}
                    >
                      {t("common.save", "Save")}
                    </Button>
                  </DialogActions>
                </Dialog>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {t("OfferDetailsArea.date")}
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent={"right"}>
                  {format(
                    new Date(currentOffer.created_at),
                    "MMMM do yyyy, h:mm:ss a",
                  )}
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {t("OfferDetailsArea.status")}
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent={"right"}>
                  <Chip
                    label={t(
                      `OffersViewPaginated.${statusKey}`,
                      session.status,
                    )}
                    color={statusColor}
                    icon={
                      statusKey === "waitingSeller" ? <Announcement /> :
                      statusKey === "waitingCustomer" ? <HourglassTop /> :
                      statusKey === "rejected" ? <Cancel /> :
                      <CheckCircle />
                    }
                  />
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
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
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
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
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
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
                    sx={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                  >
                    <MarkdownRender text={currentOffer.description} />
                  </Typography>
                  {v2SummaryItems.length > 0 && (
                    <OrderSummarySectionV2
                      items={v2SummaryItems}
                      total_cost={currentOffer.cost}
                      offerChanges={offerChanges}
                    />
                  )}
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {t("OfferDetailsArea.offer")}
              </TableCell>
              <TableCell
                align="right"
                sx={{ wordBreak: "break-word", overflowWrap: "break-word" }}
              >
                <Stack direction="row" justifyContent={"right"} spacing={1} alignItems="center">
                  <Typography
                    color={"text.secondary"}
                    variant={"subtitle2"}
                    sx={{
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      textAlign: "right",
                    }}
                  >
                    {(+currentOffer.cost).toLocaleString(undefined)}{" "}
                    <Typography
                      color={"text.primary"}
                      variant={"subtitle2"}
                      display={"inline"}
                      sx={{
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      aUEC{" "}
                      {t(
                        PAYMENT_TYPE_MAP.get(currentOffer.payment_type) ||
                          "",
                      )}
                    </Typography>
                  </Typography>
                  {offerChanges?.costChanged && (
                    <Chip label="NEW!" size="small" color="primary" />
                  )}
                </Stack>
              </TableCell>
            </TableRow>
            {session.discord_server_id && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("OfferDetailsArea.discordThread")}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent={"right"}>
                    <Typography color={"text.secondary"} variant={"subtitle2"}>
                      {session.discord_thread_id ? (
                        <MaterialLink
                          href={`https://discord.com/channels/${session.discord_server_id}/${session.discord_thread_id}`}
                          variant={"subtitle1"}
                          underline={"hover"}
                          color={"text.secondary"}
                        >
                          {t("OfferDetailsArea.threadLink")}
                        </MaterialLink>
                      ) : (
                        <LoadingButton
                          loading={createThreadLoading}
                          onClick={() => {
                            createThread(session.session_id)
                              .unwrap()
                              .then((result) => {
                                issueAlert({
                                  message: t("OfferDetailsArea.createdThread"),
                                  severity: "success",
                                })
                              })
                              .catch((err) => {
                                issueAlert(err)
                              })
                          }}
                        >
                          {t("OfferDetailsArea.createThread")}
                        </LoadingButton>
                      )}
                    </Typography>
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
            {showAccept && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
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
                      to={`/offer/${session.session_id}/counteroffer`}
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
            )}
            {showCancel && (
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
    </Grid>
  )
}
