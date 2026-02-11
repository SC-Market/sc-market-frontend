import {
  OfferSession,
  useCreateOfferThreadMutation,
  useUpdateOfferStatusMutation,
  useAssignOfferMutation,
  useUnassignOfferMutation,
} from "../../store/offer"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { OrgDetails, UserDetails } from "../../components/list/UserDetails"
import { Stack } from "@mui/system"
import moment from "moment/moment"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { useCurrentChat, useGetChatByOfferIDQuery } from "../../features/chats"
import {
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
} from "../../store/notification"
import { Order } from "../../datatypes/Order"
import { MessagesBody } from "../../features/chats"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../store/profile"
import LoadingButton from "@mui/lab/LoadingButton"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { Link, useNavigate } from "react-router-dom"
import { useGetPublicContractQuery } from "../../store/public_contracts"
import { ListingSellerRating } from "../../components/rating/ListingRating"
import { useTranslation } from "react-i18next"
import { PAYMENT_TYPE_MAP } from "../../util/constants"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import {
  useGetContractorMembersQuery,
  contractorsApi,
} from "../../store/contractor"
import { store } from "../../store/store"
import { MinimalUser } from "../../datatypes/User"
import throttle from "lodash/throttle"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { has_permission } from "../contractor/OrgRoles"

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import useMediaQuery from '@mui/material/useMediaQuery';
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Announcement from '@mui/icons-material/Announcement';
import Cancel from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import HourglassTop from '@mui/icons-material/HourglassTop';
import Edit from '@mui/icons-material/Edit';
import Close from '@mui/icons-material/Close';
import Check from '@mui/icons-material/Check';

// Status map for unified translation and colour coding
const statusTextToKey: Record<string, string> = {
  "Waiting for Seller": "waitingSeller",
  "Waiting for Customer": "waitingCustomer",
  Accepted: "accepted",
  Rejected: "rejected",
}

export function OfferMessagesArea(props: { offer: OfferSession }) {
  const { offer } = props
  const [currentChat, setCurrentChat] = useCurrentChat()
  const { data: chatObj } = useGetChatByOfferIDQuery(offer.id!, {
    skip: !offer,
  })

  const { data: notificationsData } = useGetNotificationsQuery({
    page: 0,
    pageSize: 100,
    action: "offer_message",
    entityId: offer.id,
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

export function OfferDetailsArea(props: { session: OfferSession }) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const { t, i18n } = useTranslation()
  const { session } = props
  const [org] = useCurrentOrg()
  const { data: profile } = useGetUserProfileQuery()
  const { data: publicContract } = useGetPublicContractQuery(
    session?.contract_id!,
    { skip: !session?.contract_id },
  )

  const [isEditingAssigned, setIsEditingAssigned] = useState(false)
  const [target, setTarget] = useState("")
  const [targetObject, setTargetObject] = useState<{
    username: string
    display_name: string
  } | null>(null)
  const [options, setOptions] = useState<MinimalUser[]>([])

  const issueAlert = useAlertHook()

  const { data: membersData } = useGetContractorMembersQuery({
    spectrum_id: org?.spectrum_id || "",
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
          spectrum_id: org?.spectrum_id!,
          query: query,
        }),
      )

      setOptions(data || [])
    },
    [org?.spectrum_id],
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

  const [assignUser] = useAssignOfferMutation()
  const [unassignUser] = useUnassignOfferMutation()

  const amContractorManager = useMemo(
    () =>
      session.contractor &&
      org?.spectrum_id === session.contractor.spectrum_id &&
      has_permission(org, profile, "manage_orders", profile?.contractors),
    [org, profile, session],
  )

  // Generate a status key for translation and icons/colours
  const statusKey = statusTextToKey[session.status] || session.status

  const [statusColor, icon] = useMemo(() => {
    if (statusKey === "waitingSeller") {
      return ["warning" as const, <Announcement key={"warning"} />] as const
    } else if (statusKey === "waitingCustomer") {
      return ["info" as const, <HourglassTop key={"info"} />] as const
    } else if (statusKey === "rejected") {
      return ["error" as const, <Cancel key={"error"} />] as const
    } else {
      return ["success" as const, <CheckCircle key={"success"} />] as const
    }
  }, [statusKey])

  const showAccept = useMemo(() => {
    if (
      [
        t("OffersViewPaginated.rejected"),
        t("OffersViewPaginated.accepted"),
      ].includes(statusKey)
    ) {
      return false
    }

    if (session.contractor) {
      if (org?.spectrum_id === session.contractor.spectrum_id) {
        return statusKey === "waitingSeller"
      }
    }

    if (session.assigned_to) {
      if (profile?.username === session.assigned_to.username) {
        return statusKey === "waitingSeller"
      }
    }

    if (profile?.username === session.customer.username) {
      return statusKey === "waitingCustomer"
    }

    return false
  }, [profile, org, session, statusKey, t])

  const showCancel =
    !showAccept && statusKey !== "rejected" && statusKey !== "accepted"

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateOfferStatusMutation()
  const navigate = useNavigate()

  const updateStatusCallback = useCallback(
    (status: "accepted" | "rejected" | "cancelled") => {
      updateStatus({ session_id: session.id, status: status })
        .unwrap()
        .then((result) => {
          if (result.order_id) navigate(`/contract/${result.order_id}`)
        })
        .catch((err) => {
          issueAlert(err)
        })
    },
    [session.id, updateStatus, navigate, issueAlert],
  )

  const handleAssignSave = useCallback(async () => {
    if (!targetObject) {
      return
    }

    const res: { data?: any; error?: any } = await assignUser({
      session_id: session.id,
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
  }, [assignUser, session.id, issueAlert, targetObject, t])

  const handleAssignCancel = useCallback(() => {
    setIsEditingAssigned(false)
    setTarget("")
    setTargetObject(null)
  }, [])

  const handleUnassign = useCallback(async () => {
    const res: { data?: any; error?: any } = await unassignUser({
      session_id: session.id,
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
  }, [unassignUser, session.id, issueAlert, t])

  const [createThread, { isLoading: createThreadLoading }] =
    useCreateOfferThreadMutation()

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
                      <IconButton
                        size="small"
                        onClick={() => setIsEditingAssigned(!isEditingAssigned)}
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
                      {session.assigned_to && (
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
                    <Stack direction={"column"}>
                      {session.assigned_to && (
                        <UserDetails user={session.assigned_to} />
                      )}
                      {session.contractor && (
                        <OrgDetails org={session.contractor} />
                      )}
                      <ListingSellerRating
                        user={session.assigned_to}
                        contractor={session.contractor}
                      />
                    </Stack>
                  </Stack>
                )}
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
                  {moment(session.offers[0].timestamp)
                    .locale(i18n.language)
                    .format("MMMM Do YYYY, h:mm:ss a")}
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
                    icon={icon}
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
                    {session.offers[0].title}
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
                    {session.offers[0].kind}
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
                    <MarkdownRender text={session.offers[0].description} />
                  </Typography>
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
                    {(+session.offers[0].cost).toLocaleString(undefined)}{" "}
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
                        PAYMENT_TYPE_MAP.get(session.offers[0].payment_type) ||
                          "",
                      )}
                    </Typography>
                  </Typography>
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
                            createThread(session.id)
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
                      to={`/offer/${session.id}/counteroffer`}
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
