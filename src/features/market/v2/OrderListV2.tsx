/**
 * OrderListV2 Component
 *
 * Displays a list of orders with quality tier information visible in the preview.
 * Supports filtering by quality tier, status, and role (buyer/seller).
 * Maintains visual parity with V1 OrderList component.
 *
 * Requirements:
 * - 45.1: Provide OrderListV2 React component
 * - 45.2: Maintain visual parity with V1 OrderList component
 * - 45.3: Use RTK_Query_Client for API calls
 * - 45.4: Show quality tier in order preview
 * - 45.5: Filter orders by quality tier
 */

import React, { useMemo } from "react"
import {
  Avatar,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Box,
  Chip,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material"
import { Link } from "react-router-dom"
import { useGetOrdersQuery } from "../../../store/api/v2/market"
import { ORDER_PATHS } from "../../../routes/paths"

/**
 * Props for OrderListV2 component
 */
interface OrderListV2Props {
  /** Optional title for the list */
  title?: string | null
  
  /** Filter by order status */
  status?: "pending" | "completed" | "cancelled"
  
  /** Filter by role (buyer or seller) */
  role?: "buyer" | "seller"
  
  /** Minimum quality tier filter (1-5) */
  qualityTierMin?: number
  
  /** Maximum quality tier filter (1-5) */
  qualityTierMax?: number
  
  /** Page number for pagination */
  page?: number
  
  /** Number of results per page */
  pageSize?: number
}

/**
 * Individual order list item with quality tier display
 */
function OrderListItemV2(props: {
  order: {
    order_id: string
    title: string
    buyer_username: string
    shop_name: string
    shop_slug: string
    buyer_avatar?: string | null
    shop_logo?: string | null
    quality_tier_min?: number
    quality_tier_max?: number
    status: string
    created_at: string
  }
  role?: "buyer" | "seller"
}) {
  const { order, role } = props

  // Determine which avatar/name to show based on role
  // If user is buyer, show shop info; if seller, show buyer info
  const displayAvatar = role === "buyer" ? order.shop_logo : order.buyer_avatar
  const displayUsername = role === "buyer" ? order.shop_name : order.buyer_username

  // Format quality tier display
  const qualityTierDisplay = useMemo(() => {
    if (order.quality_tier_min === undefined && order.quality_tier_max === undefined) {
      return null
    }

    if (order.quality_tier_min === order.quality_tier_max) {
      return `Tier ${order.quality_tier_min}`
    }

    return `Tier ${order.quality_tier_min}-${order.quality_tier_max}`
  }, [order.quality_tier_min, order.quality_tier_max])

  return (
    <ListItemButton component={Link} to={ORDER_PATHS.contract(order.order_id)}>
      <ListItemAvatar>
        <Avatar
          variant="rounded"
          src={displayAvatar || undefined}
          alt={`Avatar of ${displayUsername}`}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body1">{order.title}</Typography>
            {qualityTierDisplay && (
              <Chip
                label={qualityTierDisplay}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        }
        secondary={
          <Typography variant="caption" color="text.secondary">
            {role === "buyer" ? `Shop: ${order.shop_name}` : `Buyer: ${order.buyer_username}`}
          </Typography>
        }
      />
    </ListItemButton>
  )
}

/**
 * OrderListV2 Component
 *
 * Displays orders with quality tier information and filtering.
 * Maintains visual parity with V1 OrderList component while adding
 * quality tier display and filtering capabilities.
 *
 * Requirement 45.2: Maintain visual parity with V1 OrderList component
 * Requirement 45.3: Use RTK_Query_Client for API calls
 * Requirement 45.4: Show quality tier in order preview
 * Requirement 45.5: Filter orders by quality tier
 */
export function OrderListV2(props: OrderListV2Props) {
  const {
    title,
    status,
    role,
    qualityTierMin,
    qualityTierMax,
    page = 1,
    pageSize = 20,
  } = props

  // Requirement 45.3: Use RTK_Query_Client for API calls
  const { data, isLoading, error } = useGetOrdersQuery({
    status,
    role,
    qualityTierMin,
    qualityTierMax,
    page,
    pageSize,
  })

  // Filter out null/undefined orders
  const orders = useMemo(() => {
    return data?.orders?.filter((o) => o) || []
  }, [data?.orders])

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load orders. Please try again.
      </Alert>
    )
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No orders found
        </Typography>
      </Box>
    )
  }

  // Requirement 45.2: Maintain visual parity with V1 OrderList component
  return (
    <List
      subheader={
        title ? <ListSubheader>{title}</ListSubheader> : undefined
      }
      sx={{ width: "100%" }}
    >
      {orders.map((order, i) => (
        <OrderListItemV2 order={order} role={role} key={i} />
      ))}
    </List>
  )
}
