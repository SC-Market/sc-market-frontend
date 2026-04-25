import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Chip, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Notification } from "../../../hooks/login/UserProfile"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"
import { formatPrice } from "../../../util/formatPrice"

interface OrderEntity {
  order_id: string
  customer: string
  cost: string | number
  title: string
  market_listings?: Array<{ listing_id: string; quantity: number; listing?: { details?: { title?: string } } }>
  service?: { title: string } | null
}

export function NotificationOrderCreate(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const order = useMemo(() => notif.entity as OrderEntity, [notif.entity])
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/contract/${order.order_id}`}
      notif={notif}
    >
      {t("notifications.new_order_placed_by")}{" "}
      <Link
        to={`/user/${order.customer}`}
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>{order.customer}</UnderlineLink>
      </Link>
      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}>
        {order.cost && (
          <Chip
            label={formatPrice(Number(order.cost))}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
        {order.title && (
          <Chip label={order.title} size="small" variant="outlined" />
        )}
        {order.service && (
          <Chip label={order.service.title} size="small" variant="outlined" />
        )}
        {order.market_listings?.map((ml, i) => (
          <Chip
            key={i}
            label={`${ml.listing?.details?.title || "Item"} ×${ml.quantity}`}
            size="small"
            variant="outlined"
          />
        ))}
      </Stack>
    </NotificationBase>
  )
}
