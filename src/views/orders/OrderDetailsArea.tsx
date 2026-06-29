import {
  ButtonGroup,
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
} from "@mui/material"
import React, { useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"
import { OrgDetails, UserDetails } from "../../components/list/UserDetails"
import { Stack } from "@mui/system"
import { format } from "../../util/time"
import { MarkdownRender } from "../../components/markdown/Markdown.lazy"
import { useCurrentChat, useGetChatByOrderIDQuery } from "../../features/chats"
import type { Order } from "../../features/orders/domain/types"
import { MessagesBody } from "../../features/chats"
import LoadingButton from "@mui/lab/LoadingButton"
import { statusColors, statusNames } from "../../features/orders/domain/constants"
import { OrderSummarySection } from "../../components/orders/OrderSummarySection"
import { OrderSummarySectionV2 } from "../../components/orders/OrderSummarySectionV2"
import {
  CancelRounded,
  DoneRounded,
  PlayArrowRounded,
  Edit,
  Close,
  Check,
} from "@mui/icons-material"
import { PAYMENT_TYPE_MAP } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { useMediaQuery } from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import {
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
} from "../../features/notifications/api/notificationApi"
import { useOrderDetails } from "../../features/orders/hooks/useOrderDetails"

export function OrderMessagesArea(props: { order: Order }) {
  const { order } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [currentChat, setCurrentChat] = useCurrentChat()
  const { data: chatObj } = useGetChatByOrderIDQuery(order.order_id!, {
    skip: !order,
  })

  const { data: notificationsData } = useGetNotificationsQuery({
    page: 0,
    pageSize: 100,
    action: "order_message",
    entityId: order.order_id,
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
    <Paper
      sx={{
        height: isMobile ? "calc(100vh - 200px)" : 600,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {currentChat && (
        <MessagesBody key={currentChat.chat_id} forceDesktop={true} />
      )}
    </Paper>
  )
}

export function OrderDetailsArea(props: { order: Order }) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const { order } = props
  const { t } = useTranslation()

  const {
    profile, issueAlert,
    isEditingAssigned, setIsEditingAssigned,
    target, setTarget, targetObject, setTargetObject,
    options, members,
    handleAssignSave, handleAssignCancel, handleUnassign, handleClaimOrder,
    orderDetailV2, hasV2Items,
    statusColor, status, updateOrderStatus,
    contractor, assigned, customer,
    amCustomer, amAssigned, amContractor, amRelated, amContractorManager,
    privateContractCustomer, publicContractCustomer, isComplete,
    server_id,
    createThread, createThreadLoading,
  } = useOrderDetails(order)

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
          aria-label={t("orderDetailsArea.details_table")}
          sx={{ tableLayout: "auto" }}
        >
          <TableBody>
            <TableRow
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell component="th" scope="row">
                {t("orderDetailsArea.customer")}
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent={"right"}>
                  {customer && <UserDetails user={customer} />}
                </Stack>
              </TableCell>
            </TableRow>
            {(order.shop || contractor) && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("orderDetailsArea.seller")}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent="right" alignItems="center" spacing={1}>
                    {order.shop ? (
                      <MaterialLink
                        component={RouterLink}
                        to={`/shops/${order.shop.slug}`}
                        underline="hover"
                        color="text.secondary"
                        variant="subtitle2"
                      >
                        {order.shop.name}
                      </MaterialLink>
                    ) : (
                      contractor && <OrgDetails org={contractor} />
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            )}
            {(assigned || amContractor) && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {t("orderDetailsArea.assigned")}
                    {amContractorManager &&
                      !["cancelled", "fulfilled"].includes(order.status) && (
                        <Button
                          size="small"
                          variant="text"
                          startIcon={isEditingAssigned ? <Close /> : undefined}
                          onClick={() =>
                            setIsEditingAssigned(!isEditingAssigned)
                          }
                          sx={{ textTransform: "none", fontSize: "0.75rem" }}
                        >
                          {isEditingAssigned ? "Cancel" : "Assign"}
                        </Button>
                      )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent="right" alignItems="center" spacing={1}>
                    {assigned ? (
                      <UserDetails user={assigned} />
                    ) : (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {t("orderDetailsArea.none", "None")}
                        </Typography>
                        {amContractor && !["cancelled", "fulfilled"].includes(order.status) && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleClaimOrder}
                          >
                            {t("orderDetailsArea.claim", "Claim")}
                          </Button>
                        )}
                      </>
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
                      {order.assigned_to && (
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
            )}
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {t("orderDetailsArea.date")}
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent={"right"}>
                  {format(new Date(order.timestamp), "MMMM do yyyy, h:mm:ss a")}
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {t("orderDetailsArea.status")}
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent={"right"}>
                  <Chip label={t(status)} color={statusColor} />
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {t("orderDetailsArea.title")}
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
                    {order.title}
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {t("orderDetailsArea.kind")}
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
                    {order.kind}
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
                  {t("orderDetailsArea.details")}
                  <Typography
                    color={"text.secondary"}
                    variant={"subtitle2"}
                    sx={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                  >
                    <MarkdownRender text={order.description} />
                  </Typography>
                  {!hasV2Items && (
                    <OrderSummarySection
                      market_listings={order.market_listings}
                      total_cost={+order.cost}
                    />
                  )}
                  {hasV2Items && (
                    <OrderSummarySectionV2
                      items={orderDetailV2!.items}
                      total_cost={orderDetailV2!.total_price}
                    />
                  )}
                </Stack>
              </TableCell>
            </TableRow>

            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {t("orderDetailsArea.order")}
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
                    {(+order.cost).toLocaleString(undefined)}{" "}
                    <Typography
                      color={"text.primary"}
                      variant={"subtitle2"}
                      display={"inline"}
                      sx={{
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      aUEC {t(PAYMENT_TYPE_MAP.get(order.payment_type) || "")}
                    </Typography>
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
            {server_id && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("orderDetailsArea.discord_thread")}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent={"right"}>
                    <Typography color={"text.secondary"} variant={"subtitle2"}>
                      {order.discord_thread_id ? (
                        <MaterialLink
                          href={`https://discord.com/channels/${server_id}/${order.discord_thread_id}`}
                          variant={"subtitle1"}
                          underline={"hover"}
                          color={"text.secondary"}
                        >
                          {t("orderDetailsArea.thread_link")}
                        </MaterialLink>
                      ) : (
                        <LoadingButton
                          loading={createThreadLoading}
                          onClick={() => {
                            createThread(order.order_id)
                              .unwrap()
                              .then((result) => {
                                issueAlert({
                                  message: t("orderDetailsArea.created_thread"),
                                  severity: "success",
                                })
                              })
                              .catch((err) => {
                                issueAlert(err)
                              })
                          }}
                        >
                          {t("orderDetailsArea.create_thread")}
                        </LoadingButton>
                      )}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
            {order.discord_invite && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("orderDetailsArea.discord_server_invite", {
                    defaultValue: "Discord Server Invite",
                  })}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent={"right"}>
                    <MaterialLink
                      href={order.discord_invite}
                      variant={"subtitle1"}
                      underline={"hover"}
                      color={"text.secondary"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("orderDetailsArea.join_server", {
                        defaultValue: "Join Server",
                      })}
                    </MaterialLink>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
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
                  {privateContractCustomer && !isComplete && (
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
                  {publicContractCustomer && !isComplete && (
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
                  {(profile?.role === "admin" ||
                    amContractorManager ||
                    amAssigned) &&
                    (isMobile ? (
                      <Stack
                        direction="column"
                        spacing={theme.layoutSpacing.compact}
                        sx={{ width: "100%" }}
                      >
                        {(profile?.role === "admin" ||
                          order.status === "not-started" ||
                          order.status === "in-progress") && (
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
                        {(profile?.role === "admin" ||
                          order.status === "not-started") && (
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
                        {profile?.role === "admin" && (
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
                        {(profile?.role === "admin" || !isComplete) && (
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
                        aria-label={t("ui.aria.loadingButtonGroup")}
                      >
                        {(profile?.role === "admin" ||
                          order.status === "not-started" ||
                          order.status === "in-progress") && (
                          <LoadingButton
                            variant={"contained"}
                            color={"success"}
                            startIcon={<DoneRounded />}
                            onClick={() => updateOrderStatus("fulfilled")}
                          >
                            {t("orderDetailsArea.complete_order")}
                          </LoadingButton>
                        )}
                        {(profile?.role === "admin" ||
                          order.status === "not-started") && (
                          <LoadingButton
                            variant={"contained"}
                            color={"warning"}
                            startIcon={<PlayArrowRounded />}
                            onClick={() => updateOrderStatus("in-progress")}
                          >
                            {t("orderDetailsArea.begin_work")}
                          </LoadingButton>
                        )}
                        {profile?.role === "admin" && (
                          <LoadingButton
                            variant={"contained"}
                            color={"info"}
                            startIcon={<PlayArrowRounded />}
                            onClick={() => updateOrderStatus("not-started")}
                          >
                            {t("orderDetailsArea.not_started")}
                          </LoadingButton>
                        )}
                        {(profile?.role === "admin" || !isComplete) && (
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
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  )
}
