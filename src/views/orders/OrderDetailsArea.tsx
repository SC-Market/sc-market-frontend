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
import {
  OrgDetails,
  UserDetails,
  UserDetailsSkeleton,
} from "../../components/list/UserDetails"
import { Stack } from "@mui/system"
import { MarkdownRender } from "../../components/markdown/Markdown.lazy"
import { useCurrentChat, useGetChatByOrderIDQuery } from "../../features/chats"
import type { Order } from "../../features/orders/domain/types"
import { MessagesBody } from "../../features/chats"
import LoadingButton from "@mui/lab/LoadingButton"
import { DiscordThreadControl } from "../../components/orders/DiscordThreadControl"
import { OrderSummarySection } from "../../components/orders/OrderSummarySection"
import { OrderSummarySectionV2 } from "../../components/orders/OrderSummarySectionV2"
import {
  CancelRounded,
  DoneRounded,
  PlayArrowRounded,
  Close,
} from "@mui/icons-material"
import { PAYMENT_TYPE_MAP } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import {
  useIsMobile,
  useBreakpointDown,
} from "../../hooks/layout/useBreakpoint"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useOrderDetails } from "../../features/orders/hooks/useOrderDetails"
import { SHOP_PATHS } from "../../routes/paths"
import { useFormatters } from "../../util/format"
import { useClearEntityNotifications } from "../../features/notifications/hooks/useClearEntityNotifications"

export function OrderMessagesArea(props: { order: Order }) {
  const { order } = props
  const isMobile = useIsMobile()

  const [currentChat, setCurrentChat] = useCurrentChat()
  const { data: chatObj } = useGetChatByOrderIDQuery(order.order_id!, {
    skip: !order,
  })

  useClearEntityNotifications("order_message", order.order_id)

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
  const fmt = useFormatters()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useBreakpointDown("sm")
  const { order } = props
  const { t } = useTranslation()

  const {
    isEditingAssigned,
    setIsEditingAssigned,
    target,
    setTarget,
    targetObject,
    setTargetObject,
    options,
    members,
    handleAssignSave,
    handleAssignCancel,
    handleUnassign,
    handleClaimOrder,
    orderDetailV2,
    hasV2Items,
    statusColor,
    status,
    updateOrderStatus,
    contractor,
    assigned,
    customer,
    contractorLoading,
    assignedLoading,
    customerLoading,
    roles,
    actions,
    server_id,
    createThread,
    refetchOrder,
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
                  {customer ? (
                    <UserDetails user={customer} />
                  ) : (
                    customerLoading && <UserDetailsSkeleton />
                  )}
                </Stack>
              </TableCell>
            </TableRow>
            {(order.shop || contractor || contractorLoading) && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("orderDetailsArea.seller")}
                </TableCell>
                <TableCell align="right">
                  <Stack
                    direction="row"
                    justifyContent="right"
                    alignItems="center"
                    spacing={1}
                  >
                    {order.shop ? (
                      <MaterialLink
                        component={RouterLink}
                        to={SHOP_PATHS.profile(order.shop.slug)}
                        underline="hover"
                        color="text.secondary"
                        variant="subtitle2"
                      >
                        {order.shop.name}
                      </MaterialLink>
                    ) : contractor ? (
                      <OrgDetails org={contractor} />
                    ) : (
                      <UserDetailsSkeleton />
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            )}
            {/* While the user loads the row holds a same-size placeholder, so
                it doesn't appear or grow when the user arrives. */}
            {(assigned || assignedLoading || roles.orgMember) && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {t("orderDetailsArea.assigned")}
                    {actions.canAssign && (
                      <Button
                        size="small"
                        variant="text"
                        startIcon={isEditingAssigned ? <Close /> : undefined}
                        onClick={() => setIsEditingAssigned(!isEditingAssigned)}
                        sx={{ textTransform: "none", fontSize: "0.75rem" }}
                      >
                        {isEditingAssigned
                          ? t("common.cancel")
                          : t("memberAssignArea.assign")}
                      </Button>
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack
                    direction="row"
                    justifyContent="right"
                    alignItems="center"
                    spacing={1}
                  >
                    {assigned ? (
                      <UserDetails user={assigned} />
                    ) : assignedLoading ? (
                      <UserDetailsSkeleton />
                    ) : (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {t("orderDetailsArea.none", "None")}
                        </Typography>
                        {actions.canClaim && (
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
                    <DialogTitle>
                      {t("memberAssignArea.assignMember", "Assign Member")}
                    </DialogTitle>
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
                  {fmt.dateTime(order.timestamp, {
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
                    component="div"
                    sx={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                  >
                    <MarkdownRender text={order.description} />
                  </Typography>
                  {!hasV2Items && (
                    <OrderSummarySection
                      market_listings={order.market_listings}
                    />
                  )}
                  {hasV2Items && (
                    <OrderSummarySectionV2 items={orderDetailV2!.items} />
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
                    {fmt.number(+order.cost)}{" "}
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
                    <DiscordThreadControl
                      serverId={server_id}
                      threadId={order.discord_thread_id}
                      create={createThread}
                      refetch={refetchOrder}
                    />
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
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  )
}
