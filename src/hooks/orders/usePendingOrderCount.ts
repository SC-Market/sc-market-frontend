import { useGetNotificationsQuery } from "../../store/notification"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

/**
 * Hook to get count of pending orders requiring attention
 * Uses unread_count from notifications API
 */
export function usePendingOrderCount(): number {
  // Get unread count for order assignments
  const { data: assignmentData } = useGetNotificationsQuery({
    action: "order_assigned",
  })

  // Get unread count for order status changes
  const { data: statusData } = useGetNotificationsQuery({
    action: "order_status",
  })

  const assignmentCount = assignmentData?.unread_count ?? 0
  const statusCount = statusData?.unread_count ?? 0

  return assignmentCount + statusCount
}
