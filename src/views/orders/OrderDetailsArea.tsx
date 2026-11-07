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
} from "@mui/material"
import { useEffect } from "react"
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
import { DiscordThreadControl } from "../../components/orders/DiscordThreadControl"
import { OrderSummarySection } from "../../components/orders/OrderSummarySection"
import { OrderSummarySectionV2 } from "../../components/orders/OrderSummarySectionV2"
import { PAYMENT_TYPE_MAP } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useOrderDetails } from "../../features/orders/hooks/useOrderDetails"
import { OrderAssignedRow } from "./OrderAssignedRow"
import { OrderStatusRow } from "./OrderStatusRow"
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
  const { order } = props
  const { t } = useTranslation()

  const details = useOrderDetails(order)
  const {
    orderDetailV2,
    hasV2Items,
    statusColor,
    status,
    contractor,
    customer,
    contractorLoading,
    customerLoading,
    server_id,
    createThread,
    refetchOrder,
  } = details

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
            <OrderAssignedRow order={order} details={details} />
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
            <OrderStatusRow details={details} />
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  )
}
