import {
  useCreateOrderThreadMutation,
  useSetOrderStatusMutation,
  useAssignOrderMutation,
  useUnassignOrderMutation,
} from "../../store/orders"
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
  IconButton,
  Autocomplete,
  TextField,
  Box,
  Button,
} from "@mui/material"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { OrgDetails, UserDetails } from "../../components/list/UserDetails"
import { Stack } from "@mui/system"
import moment from "moment/moment"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { useCurrentChat, useGetChatByOrderIDQuery } from "../../features/chats"
import {
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
} from "../../store/notification"
import { Order } from "../../datatypes/Order"
import { MessagesBody } from "../../features/chats"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import {
  useGetUserByUsernameQuery,
  useGetUserProfileQuery,
} from "../../store/profile"
import LoadingButton from "@mui/lab/LoadingButton"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { statusColors, statusNames } from "./OrderList"
import {
  useGetContractorBySpectrumIDQuery,
  useGetContractorMembersQuery,
  contractorsApi,
} from "../../store/contractor"
import {
  CancelRounded,
  DoneRounded,
  PlayArrowRounded,
  Edit,
  Close,
  Check,
} from "@mui/icons-material"
import { has_permission } from "../contractor/OrgRoles"
import { PAYMENT_TYPE_MAP } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { useMediaQuery } from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { store } from "../../store/store"
import { MinimalUser } from "../../datatypes/User"
import throttle from "lodash/throttle"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"

export function OrderMessagesArea(props: { order: Order }) {
  const { order } = props
  const { t } = useTranslation()

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
        maxHeight: 600,
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
  )
}

export function OrderDetailsArea(props: { order: Order }) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const { order } = props
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()

  const [isEditingAssigned, setIsEditingAssigned] = useState(false)
  const [target, setTarget] = useState("")
  const [targetObject, setTargetObject] = useState<{
    username: string
    display_name: string
  } | null>(null)
  const [options, setOptions] = useState<MinimalUser[]>([])

  const issueAlert = useAlertHook()
  const [currentOrg] = useCurrentOrg()

  const { data: membersData } = useGetContractorMembersQuery({
    spectrum_id: currentOrg?.spectrum_id || "",
    page: 0,
    page_size: 100,
    search: "",
    role_filter: "",
    sort: "username",
  })

  const members = membersData?.members || []

  const fetchOptions = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        return
      }

      const { data } = await store.dispatch(
        contractorsApi.endpoints.searchContractorMembers.initiate({
          spectrum_id: currentOrg?.spectrum_id!,
          query: query,
        }),
      )

      setOptions(data || [])
    },
    [currentOrg?.spectrum_id],
  )

  const retrieve = useMemo(
    () =>
      throttle((query: string) => {
        fetchOptions(query)
      }, 400),
    [fetchOptions],
  )

  useEffect(() => {
    retrieve(target)
  }, [target, retrieve])

  const [assignUser] = useAssignOrderMutation()
  const [unassignUser] = useUnassignOrderMutation()

  const statusColor = useMemo(
    () => statusColors.get(order.status),
    [order.status],
  )
  const status = useMemo(
    () => statusNames.get(order.status) || statusNames.get("not-started")!,
    [order.status],
  )

  const [setOrderStatus] = useSetOrderStatusMutation()
  const updateOrderStatus = useCallback(
    async (status: string) => {
      setOrderStatus({
        order_id: order.order_id,
        status: status,
      })
        .unwrap()
        .then(() => {
          issueAlert({
            message: t("orderDetailsArea.updated_status"),
            severity: "success",
          })
        })
        .catch((error) => {
          issueAlert(error)
        })
    },
    [order.order_id, issueAlert, setOrderStatus, t],
  )

  const handleAssignSave = useCallback(async () => {
    if (!targetObject) {
      return
    }

    const res: { data?: any; error?: any } = await assignUser({
      order_id: order.order_id,
      user_id: targetObject.username!,
    })

    if (res?.data && !res?.error) {
      issueAlert({
        message: t("memberAssignArea.assigned"),
        severity: "success",
      })
      setIsEditingAssigned(false)
      setTarget("")
      setTargetObject(null)
    } else {
      issueAlert({
        message: `${t("memberAssignArea.failed_assign")} ${
          res.error?.error || res.error?.data?.error || res.error
        }`,
        severity: "error",
      })
    }
  }, [assignUser, order.order_id, issueAlert, targetObject, t])

  const handleAssignCancel = useCallback(() => {
    setIsEditingAssigned(false)
    setTarget("")
    setTargetObject(null)
  }, [])

  const handleUnassign = useCallback(async () => {
    const res: { data?: any; error?: any } = await unassignUser({
      order_id: order.order_id,
    })

    if (res?.data && !res?.error) {
      issueAlert({
        message: t("memberAssignArea.unassigned"),
        severity: "success",
      })
      setIsEditingAssigned(false)
    } else {
      issueAlert({
        message: `${t("memberAssignArea.failed_unassign")} ${
          res.error?.error || res.error?.data?.error || res.error
        }`,
        severity: "error",
      })
    }
  }, [unassignUser, order.order_id, issueAlert, t])

  const { data: contractor } = useGetContractorBySpectrumIDQuery(
    order.contractor!,
    { skip: !order.contractor },
  )
  const { data: assigned } = useGetUserByUsernameQuery(order.assigned_to!, {
    skip: !order.assigned_to,
  })
  const { data: customer } = useGetUserByUsernameQuery(order.customer!, {
    skip: !order.customer,
  })

  const amCustomer = useMemo(
    () => order.customer === profile?.username,
    [order, profile],
  )
  const amAssigned = useMemo(
    () => order.assigned_to === profile?.username,
    [order, profile],
  )
  const amContractor = useMemo(
    () => currentOrg?.spectrum_id === order?.contractor,
    [currentOrg?.spectrum_id, order?.contractor],
  )
  const amRelated = useMemo(
    () => amCustomer || amAssigned || amContractor,
    [amCustomer, amAssigned, amContractor],
  )
  const amContractorManager = useMemo(
    () =>
      amContractor &&
      has_permission(
        currentOrg,
        profile,
        "manage_orders",
        profile?.contractors,
      ),
    [currentOrg, profile, amContractor],
  )

  const privateContractCustomer = useMemo(
    () =>
      amCustomer && // I am the customer
      !(amContractorManager || amAssigned) && // I am not assigned or an org admin
      (order.contractor || order.assigned_to), // This is either assigned to someone or has a contractor
    [
      order.contractor,
      order.assigned_to,
      amAssigned,
      amContractorManager,
      amCustomer,
    ],
  )

  const publicContractCustomer = useMemo(
    () => amCustomer && !order.assigned_to && !order.contractor,
    [amCustomer, order],
  )

  const isComplete = useMemo(
    () => ["cancelled", "fulfilled"].includes(order.status),
    [order.status],
  )

  const server_id = useMemo(
    () => order.discord_server_id || contractor?.official_server_id,
    [contractor?.official_server_id, order.discord_server_id],
  )

  const [createThread, { isLoading: createThreadLoading }] =
    useCreateOrderThreadMutation()

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
            {contractor && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("orderDetailsArea.seller")}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent={"right"}>
                    {order.contractor && <OrgDetails org={contractor} />}
                  </Stack>
                </TableCell>
              </TableRow>
            )}
            {(assigned || amContractorManager) && (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {t("orderDetailsArea.assigned")}
                    {amContractorManager &&
                      !["cancelled", "fulfilled"].includes(order.status) && (
                        <IconButton
                          size="small"
                          onClick={() =>
                            setIsEditingAssigned(!isEditingAssigned)
                          }
                        >
                          {isEditingAssigned ? <Close /> : <Edit />}
                        </IconButton>
                      )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  {isEditingAssigned ? (
                    <Stack spacing={1}>
                      <Autocomplete
                        filterOptions={(x) => x}
                        fullWidth
                        size="small"
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
                        onChange={(event: any, newValue) => {
                          setTargetObject(newValue)
                        }}
                        inputValue={target}
                        onInputChange={(event, newInputValue) => {
                          setTarget(newInputValue)
                        }}
                      />
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        {order.assigned_to && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={handleUnassign}
                          >
                            {t("memberAssignArea.unassign")}
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleAssignCancel}
                        >
                          {t("ui.cancel")}
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={handleAssignSave}
                          disabled={!targetObject}
                          startIcon={<Check />}
                        >
                          {t("ui.save")}
                        </Button>
                      </Box>
                    </Stack>
                  ) : (
                    <Stack direction="row" justifyContent={"right"}>
                      {order.assigned_to && <UserDetails user={assigned!} />}
                    </Stack>
                  )}
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
                  {moment(order.timestamp).format("MMMM Do YYYY, h:mm:ss a")}
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
