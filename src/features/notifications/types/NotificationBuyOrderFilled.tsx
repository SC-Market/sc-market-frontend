import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Chip, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Notification } from "../../../hooks/login/UserProfile"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { NotificationBase } from "../components/NotificationBase"
import { formatPrice } from "../../../util/formatPrice"
import { ORDER_PATHS, USER_PATHS } from "../../../routes/paths"

interface OrderEntity {
  order_id: string
  cost?: string | number
}

/**
 * A seller filled one of the user's buy orders and an order now exists
 * (buy_order_filled; entity: the order, actor: the seller).
 */
export function NotificationBuyOrderFilled(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const order = useMemo(
    () => (notif.entity ?? {}) as OrderEntity,
    [notif.entity],
  )
  const seller = notif.actors?.[0]?.username
  const to = ORDER_PATHS.contract(order.order_id)

  return (
    <NotificationBase
      icon={<ShoppingCartCheckoutRoundedIcon />}
      to={to}
      notif={notif}
    >
      {t("notifications.buy_order_filled_by", "Your buy order was filled by")}{" "}
      {seller ? (
        <Link
          to={USER_PATHS.profile(seller)}
          style={{
            textDecoration: "none",
            color: theme.palette.secondary.main,
          }}
        >
          <UnderlineLink>{seller}</UnderlineLink>
        </Link>
      ) : (
        "..."
      )}
      {order.cost ? (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}
        >
          <Chip
            label={formatPrice(Number(order.cost))}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>
      ) : null}
    </NotificationBase>
  )
}
