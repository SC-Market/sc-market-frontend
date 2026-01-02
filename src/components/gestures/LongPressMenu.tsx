import React, { ReactNode, useState } from "react"
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material"
import { useLongPress } from "../../hooks/gestures/useLongPress"
import { useHapticFeedback } from "../../hooks/gestures/useHapticFeedback"

export interface LongPressMenuAction {
  /**
   * Label for the menu item
   */
  label: string
  /**
   * Icon to display
   */
  icon?: ReactNode
  /**
   * Action to perform when clicked
   */
  onClick: () => void
  /**
   * Whether this action is destructive (e.g., delete)
   */
  destructive?: boolean
  /**
   * Whether this action is disabled
   */
  disabled?: boolean
}

export interface LongPressMenuProps {
  /**
   * Content that triggers the long press menu
   */
  children: ReactNode
  /**
   * Menu actions to display
   */
  actions: LongPressMenuAction[]
  /**
   * Delay in milliseconds before menu appears
   * Default: 500
   */
  delay?: number
  /**
   * Whether the menu is enabled
   * Default: true
   */
  enabled?: boolean
  /**
   * Callback when menu opens
   */
  onOpen?: () => void
  /**
   * Callback when menu closes
   */
  onClose?: () => void
  /**
   * Component to use as the wrapper element
   * Default: "div"
   * Use this to maintain Grid API compliance (e.g., component={Grid} with item prop)
   */
  component?: React.ElementType
  /**
   * Additional props to pass to the wrapper component
   */
  wrapperProps?: Record<string, any>
}

/**
 * Long-press menu component
 *
 * Displays a context menu when the user long-presses on the child element.
 * Provides haptic feedback on long-press trigger.
 *
 * @example
 * ```tsx
 * <LongPressMenu
 *   actions={[
 *     {
 *       label: "Edit",
 *       icon: <EditRounded />,
 *       onClick: () => handleEdit(item.id),
 *     },
 *     {
 *       label: "Delete",
 *       icon: <DeleteRounded />,
 *       onClick: () => handleDelete(item.id),
 *       destructive: true,
 *     },
 *   ]}
 * >
 *   <ListItem>
 *     <ListItemText primary={item.name} />
 *   </ListItem>
 * </LongPressMenu>
 * ```
 */
export function LongPressMenu({
  children,
  actions,
  delay = 500,
  enabled = true,
  onOpen,
  onClose,
  component: Component = "div",
  wrapperProps = {},
}: LongPressMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const { trigger: triggerHaptic } = useHapticFeedback()

  const handleLongPress = (event: React.MouseEvent | React.TouchEvent) => {
    if (!enabled || actions.length === 0) return

    // Get the target element
    const target = event.currentTarget as HTMLElement
    setAnchorEl(target)
    triggerHaptic("light")
    onOpen?.()
  }

  const handleClose = () => {
    setAnchorEl(null)
    onClose?.()
  }

  const handleActionClick = (action: LongPressMenuAction) => {
    action.onClick()
    handleClose()
    if (action.destructive) {
      triggerHaptic("error")
    } else {
      triggerHaptic("success")
    }
  }

  const longPressHandlers = useLongPress({
    onLongPress: handleLongPress,
    delay,
    enabled,
  })

  return (
    <>
      <Component {...longPressHandlers} {...wrapperProps}>
        {children}
      </Component>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        MenuListProps={{
          "aria-labelledby": "long-press-menu",
        }}
      >
        {actions.map((action, index) => {
          const menuItem = (
            <MenuItem
              key={index}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
              sx={{
                color: action.destructive
                  ? (theme) => theme.palette.error.main
                  : undefined,
              }}
            >
              {action.icon && <ListItemIcon>{action.icon}</ListItemIcon>}
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          )

          // Add divider before destructive actions
          if (action.destructive && index > 0) {
            return (
              <React.Fragment key={index}>
                <Divider />
                {menuItem}
              </React.Fragment>
            )
          }

          return menuItem
        })}
      </Menu>
    </>
  )
}
