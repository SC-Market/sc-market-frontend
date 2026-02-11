import { ImagePreviewModal } from "../modal/ImagePreviewModal"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Box from '@mui/material/Box';
import { BoxProps } from '@mui/material/Box';
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
import { useTheme } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import { FabProps } from '@mui/material/Fab';
import Drawer from '@mui/material/Drawer';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import TextField from '@mui/material/TextField';
import { TextFieldProps } from '@mui/material/TextField';
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
import { BreadcrumbsProps } from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { TypographyProps } from '@mui/material/Typography';
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

export function ImagePreviewPaper(props: { photos: string[] }) {
  const { photos } = props
  const theme = useTheme<ExtendedTheme>()
  const [imageIndex, setImageIndex] = useState(0)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const { t } = useTranslation()

  const handlePreviousImage = (event: React.MouseEvent) => {
    setImageIndex((index) => Math.max(index - 1, 0))
    event.preventDefault()
    event.stopPropagation()
  }

  const handleNextImage = (event: React.MouseEvent) => {
    setImageIndex((index) => Math.min(index + 1, photos.length - 1))
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <>
      <ImagePreviewModal
        images={photos}
        index={imageIndex}
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
      />
      <Paper
        sx={{
          borderRadius: (theme) =>
            theme.spacing((theme as ExtendedTheme).borderRadius.image),
          backgroundColor: theme.palette.background.default,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
          maxHeight: 600,
          height: 400,
          width: "100%",
          position: "relative",
        }}
        onClick={() => setImageModalOpen((o) => !o)}
        role="button"
        tabIndex={0}
        aria-label={t("accessibility.openImagePreview", "Open image preview")}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            setImageModalOpen((o) => !o)
          } else if (event.key === "ArrowLeft" && imageIndex > 0) {
            setImageIndex((index) => Math.max(index - 1, 0))
          } else if (
            event.key === "ArrowRight" &&
            imageIndex < photos.length - 1
          ) {
            setImageIndex((index) => Math.min(index + 1, photos.length - 1))
          }
        }}
      >
        {imageIndex > 0 && (
          <IconButton
            sx={{ top: "50%", right: 4, position: "absolute" }}
            onClick={handlePreviousImage}
            aria-label={t("accessibility.previousImage", "Previous image")}
          >
            <KeyboardArrowRight
              sx={{ color: theme.palette.background.light }}
            />
          </IconButton>
        )}

        {imageIndex < photos.length - 1 && (
          <IconButton
            sx={{ top: "50%", left: 4, position: "absolute" }}
            onClick={handleNextImage}
            aria-label={t("accessibility.nextImage", "Next image")}
          >
            <KeyboardArrowLeft sx={{ color: theme.palette.background.light }} />
          </IconButton>
        )}

        <IconButton
          sx={{ top: 4, right: 4, position: "absolute" }}
          aria-label={t("accessibility.zoomImage", "Zoom image")}
        >
          <ZoomInRounded />
        </IconButton>
        <img
          // component="img"
          style={{
            display: "block",
            maxHeight: "100%",
            maxWidth: "100%",
            margin: "auto",
            objectFit: "contain",
          }}
          src={
            photos[imageIndex] ||
            "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
          }
          alt={t(
            "accessibility.galleryImage",
            "Gallery image {{index}} of {{total}}",
            {
              index: imageIndex + 1,
              total: photos.length,
            },
          )}
          loading="eager"
          onError={({ currentTarget }) => {
            currentTarget.onerror = null
            currentTarget.src =
              "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
          }}
        />
      </Paper>
    </>
  )
}
