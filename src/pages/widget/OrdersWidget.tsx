import React, { useEffect } from "react"
import { Box, Typography, ThemeProvider } from "@mui/material"
import { useGetUserOrderDataQuery } from "../../features/orders/api/ordersApi"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Link } from "react-router-dom"
import { HookProvider } from "../../hooks/HookProvider"
import { lightTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ORDER_PATHS } from "../../routes/paths"
import { statusNames } from "../../features/orders/domain/constants"
import { useTranslation } from "react-i18next"
import { useFormatters, useNow } from "../../util/format"

/**
 * Widget view for recent orders
 * This is a simplified, standalone view designed for PWA widgets
 * Uses existing backend API and frontend components
 */
function OrdersWidgetContent() {
  const fmt = useFormatters()
  const now = useNow()
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const { data, isLoading, error, refetch } = useGetUserOrderDataQuery({
    include_trends: false,
  })

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [refetch])

  // Widget-specific styling - minimal, focused layout
  const widgetStyles = {
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing(2),
      paddingBottom: theme.spacing(1),
      borderBottom: `1px solid ${theme.palette.outline.main}`,
    },
    orderItem: {
      padding: theme.spacing(1.5),
      marginBottom: theme.spacing(1),
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.spacing(1),
      borderLeft: `3px solid ${theme.palette.primary.main}`,
      textDecoration: "none",
      display: "block",
      color: "inherit",
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
    },
    orderHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing(0.5),
    },
    orderTitle: {
      fontWeight: 600,
      flex: 1,
      marginRight: theme.spacing(1),
    },
    statusBadge: {
      padding: theme.spacing(0.25, 1),
      borderRadius: theme.spacing(0.5),
      fontSize: "0.75rem",
      textTransform: "uppercase",
      fontWeight: 600,
    },
    orderDetails: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "0.875rem",
      color: theme.palette.text.secondary,
      marginTop: theme.spacing(0.5),
    },
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      "not-started": theme.palette.info.main,
      "in-progress": theme.palette.warning.main,
      fulfilled: theme.palette.success.main,
      cancelled: theme.palette.error.main,
    }
    return statusColors[status] || theme.palette.text.secondary
  }

  const formatCost = (cost: number | string) => fmt.integer(cost)

  const recentOrders = data?.recent_orders || []
  const maxOrders = 5

  return (
    <StandardPageLayout
      title={t("recentOrders.title")}
      noFooter
      noSidebar
      noMobilePadding
      maxWidth="sm"
      isLoading={isLoading}
      error={error}
    >
      <Box sx={widgetStyles.header}>
        <Typography variant="h6" fontWeight={600}>
          {t("recentOrders.title")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t("ordersUi.widget.orderCount", { count: recentOrders.length })}
        </Typography>
      </Box>

      {recentOrders.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
          {t("ordersUi.widget.noRecentOrders")}
        </Typography>
      ) : (
        <Box>
          {recentOrders.slice(0, maxOrders).map((order) => (
            <Link
              key={order.order_id}
              to={ORDER_PATHS.detail(order.order_id)}
              style={{ textDecoration: "none" }}
            >
              <Box sx={widgetStyles.orderItem}>
                <Box sx={widgetStyles.orderHeader}>
                  <Typography sx={widgetStyles.orderTitle}>
                    {order.title || t("ordersUi.widget.untitledOrder")}
                  </Typography>
                  <Box
                    sx={{
                      ...widgetStyles.statusBadge,
                      backgroundColor: getStatusColor(order.status),
                      color: theme.palette.getContrastText(
                        getStatusColor(order.status),
                      ),
                    }}
                  >
                    {(() => {
                      const key = statusNames.get(
                        order.status as Parameters<typeof statusNames.get>[0],
                      )
                      return key ? t(key) : order.status
                    })()}
                  </Box>
                </Box>
                <Box sx={widgetStyles.orderDetails}>
                  <Typography component="span" fontWeight={600} color="primary">
                    {formatCost(order.cost)} aUEC
                  </Typography>
                  <Typography component="span">
                    {fmt.relative(new Date(order.timestamp), now)}
                  </Typography>
                </Box>
              </Box>
            </Link>
          ))}
        </Box>
      )}
    </StandardPageLayout>
  )
}

/**
 * Standalone widget component with providers
 * Can be used in PWA widgets or embedded views
 *
 * This component is wrapped in HookProvider and ThemeProvider to work standalone
 */
export function OrdersWidget() {
  return (
    <HookProvider>
      <ThemeProvider theme={lightTheme}>
        <OrdersWidgetContent />
      </ThemeProvider>
    </HookProvider>
  )
}
