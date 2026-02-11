import { ExtendedTheme } from "../../hooks/styles/Theme"
import React from "react"
import { useTheme } from "@mui/material/styles"

import Box from '@mui/material/Box';
import { BoxProps } from '@mui/material/BoxProps';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import useTheme1 from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import { FabProps } from '@mui/material/FabProps';
import Drawer from '@mui/material/Drawer';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import TextField from '@mui/material/TextField';
import { TextFieldProps } from '@mui/material/TextFieldProps';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Badge from '@mui/material/Badge';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { BreadcrumbsProps } from '@mui/material/BreadcrumbsProps';
import Link from '@mui/material/Link';
import { TypographyProps } from '@mui/material/TypographyProps';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import Popover from '@mui/material/Popover';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { GridProps } from '@mui/material/Grid';
import { PaperProps } from '@mui/material/PaperProps';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import FilterList from '@mui/icons-material/FilterList';
import AddRounded from '@mui/icons-material/AddRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import MessageRounded from '@mui/icons-material/MessageRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import MenuRounded from '@mui/icons-material/MenuRounded';
import ShoppingCartRounded from '@mui/icons-material/ShoppingCartRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import CloudUploadRounded from '@mui/icons-material/CloudUploadRounded';
import Info from '@mui/icons-material/Info';
import Warning from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';

export const Section = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    fill?: boolean
    h?: number
    outline?: boolean
    pad?: boolean
    title?: string | React.ReactElement
    element_title?: React.ReactElement
    subtitle?: React.ReactElement
    disablePadding?: boolean
    innerJustify?: string
  } & GridProps
>((props, ref) => {
  const theme: ExtendedTheme = useTheme()

  const {
    fill,
    h,
    outline,
    pad,
    title,
    disablePadding,
    children,
    innerJustify,
    subtitle,
    element_title,
    ...gridprops
  } = props

  return (
    <Grid item {...gridprops} ref={ref}>
      <Paper
        sx={{
          height: fill ? "100%" : h,
          width: "100%",
        }}
      >
        <Grid container direction={"column"}>
          {(!!title || !!element_title) && (
            <>
              <Grid item sx={{ padding: 2 }}>
                <Box display={"flex"} justifyContent={"space-between"}>
                  <Typography
                    variant={"h6"}
                    align={"left"}
                    color={"text.secondary"}
                    sx={{ fontWeight: "bold" }}
                  >
                    {title}
                    {element_title}
                  </Typography>

                  {subtitle}
                </Box>
              </Grid>

              <Grid item>
                <Divider light />
              </Grid>
            </>
          )}
          <Grid item>
            <Grid
              container
              spacing={theme.layoutSpacing.component}
              justifyContent={innerJustify || "center"}
              height={"100%"}
              sx={{
                boxSizing: "border-box",
                padding: disablePadding ? 0 : 2,
              }}
            >
              {children}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  )
})

Section.displayName = "Section"

export function FlatSection(props: {
  title: React.ReactNode
  children: React.ReactNode
}) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Section xs={12}>
      <Grid item xs={12} lg={4}>
        <Typography
          variant={"h6"}
          align={"left"}
          color={"text.secondary"}
          sx={{ fontWeight: "bold" }}
        >
          {props.title}
        </Typography>
      </Grid>
      <Grid item xs={12} lg={8} sx={{ pr: 2 }}>
        <Grid
          container
          spacing={theme.layoutSpacing.component}
          justifyContent={"right"}
        >
          {props.children}
        </Grid>
      </Grid>
    </Section>
  )
}
