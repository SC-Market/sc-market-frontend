/**
 * Haptic Feedback Components
 *
 * Thin wrappers around MUI components that add haptic feedback on interaction.
 * Use these instead of standard MUI components for better mobile UX.
 *
 * Haptic patterns:
 * - light() - Buttons, IconButtons, Drawer/Dialog/Menu open
 * - selection() - Tabs, Checkboxes, Switches, MenuItem, Pagination
 */
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
import { DialogProps } from '@mui/material/Dialog';
import Menu from '@mui/material/Menu';
import { MenuProps } from '@mui/material/Menu';
import { MenuItemProps } from '@mui/material/MenuItem';
import Accordion from '@mui/material/Accordion';
import { AccordionProps } from '@mui/material/Accordion';
import Switch from '@mui/material/Switch';
import { SwitchProps } from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import { TabProps } from '@mui/material/Tab';
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

export { HapticButton } from "./HapticButton";
export { HapticIconButton } from "./HapticIconButton"
export { HapticCheckbox } from "./HapticCheckbox"
export { HapticSwitch } from "./HapticSwitch"
export { HapticTab } from "./HapticTab"
export { HapticAccordion } from "./HapticAccordion"
export { HapticTablePagination } from "./HapticTablePagination"
export { HapticMenu } from "./HapticMenu"
export { HapticMenuItem } from "./HapticMenuItem"
export { HapticDrawer } from "./HapticDrawer"
export { HapticDialog } from "./HapticDialog"
