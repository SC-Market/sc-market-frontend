import React, { lazy, Suspense, ComponentType } from 'react'
import { SvgIconProps } from '@mui/material/SvgIcon'
import CircularProgress from '@mui/material/CircularProgress'

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { ButtonProps } from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { DialogProps } from '@mui/material/DialogProps';
import Menu from '@mui/material/Menu';
import { MenuProps } from '@mui/material/MenuProps';
import { MenuItemProps } from '@mui/material/MenuItemProps';
import Accordion from '@mui/material/Accordion';
import { AccordionProps } from '@mui/material/AccordionProps';
import Switch from '@mui/material/Switch';
import { SwitchProps } from '@mui/material/SwitchProps';
import Tab from '@mui/material/Tab';
import { TabProps } from '@mui/material/TabProps';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import InboxOutlined from '@mui/icons-material/InboxOutlined';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined';
import StarBorderOutlined from '@mui/icons-material/StarBorderOutlined';
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import ReportProblemRounded from '@mui/icons-material/ReportProblemRounded';

/**
 * Lazy load Material-UI icons for admin pages to reduce initial bundle size.
 * This wrapper provides a fallback while the icon loads.
 * 
 * Usage:
 * const AddIcon = lazyIcon(() => import('@mui/icons-material/AddRounded'))
 * <AddIcon />
 */
export function lazyIcon(
  importFunc: () => Promise<{ default: ComponentType<SvgIconProps> }>
): ComponentType<SvgIconProps> {
  const LazyIconComponent = lazy(importFunc)
  
  return function LazyIconWrapper(props: SvgIconProps) {
    return (
      <Suspense
        fallback={
          <CircularProgress
            size={props.fontSize === 'small' ? 16 : 24}
            sx={{ display: 'inline-block', verticalAlign: 'middle' }}
          />
        }
      >
        <LazyIconComponent {...props} />
      </Suspense>
    )
  }
}

/**
 * Pre-configured lazy-loaded admin icons.
 * These are commonly used in admin pages and can be lazy loaded to reduce initial bundle.
 */
export const AdminIcons = {
  Add: lazyIcon(() => import('@mui/icons-material/AddRounded')),
  Edit: lazyIcon(() => import('@mui/icons-material/EditRounded')),
  Delete: lazyIcon(() => import('@mui/icons-material/DeleteRounded')),
  CloudDownload: lazyIcon(() => import('@mui/icons-material/CloudDownloadRounded')),
  CheckCircle: lazyIcon(() => import('@mui/icons-material/CheckCircleRounded')),
  Error: lazyIcon(() => import('@mui/icons-material/ErrorRounded')),
  Warning: lazyIcon(() => import('@mui/icons-material/WarningRounded')),
  ExpandMore: lazyIcon(() => import('@mui/icons-material/ExpandMore')),
  ExpandLess: lazyIcon(() => import('@mui/icons-material/ExpandLess')),
}
