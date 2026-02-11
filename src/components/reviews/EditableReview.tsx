import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useUpdateOrderReviewMutation } from "../../store/orders"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { OrderReview } from "../../datatypes/Order"

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
import { useTheme } from '@mui/material/styles';
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
import MaterialLink from '@mui/material/Link';
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
import CardActions from '@mui/material/CardActions';
import ListItemButton from '@mui/material/ListItemButton';
import DialogContentText from '@mui/material/DialogContentText';
import Snackbar from '@mui/material/Snackbar';
import MuiRating from '@mui/material/Rating';
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
import GetAppRounded from '@mui/icons-material/GetAppRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Person from '@mui/icons-material/Person';
import Business from '@mui/icons-material/Business';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import AutoGraphOutlined from '@mui/icons-material/AutoGraphOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import WhatshotRounded from '@mui/icons-material/WhatshotRounded';
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded';
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded';
import BoltRounded from '@mui/icons-material/BoltRounded';
import CalendarTodayRounded from '@mui/icons-material/CalendarTodayRounded';
import RocketLaunchRounded from '@mui/icons-material/RocketLaunchRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import CancelRounded from '@mui/icons-material/CancelRounded';

interface EditableReviewProps {
  review: OrderReview
}

export function EditableReview({ review }: EditableReviewProps) {
  const { t } = useTranslation()
  const showAlert = useAlertHook()
  const [updateReview, { isLoading }] = useUpdateOrderReviewMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(review.content || "")
  const [rating, setRating] = useState(review.rating || 0)
  const [errors, setErrors] = useState<{ content?: string; rating?: string }>(
    {},
  )

  useEffect(() => {
    setContent(review.content || "")
    setRating(review.rating || 0)
  }, [review])

  const validateForm = () => {
    const newErrors: { content?: string; rating?: string } = {}

    if (!content || content.length < 10) {
      newErrors.content = t("reviewRevision.validation.contentMinLength")
    } else if (content.length > 2000) {
      newErrors.content = t("reviewRevision.validation.contentMaxLength")
    }

    if (rating < 0.5 || rating > 5) {
      newErrors.rating = t("reviewRevision.validation.ratingRange")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    updateReview({
      reviewId: review.review_id,
      orderId: review.order_id,
      content: content.trim(),
      rating,
    })
      .unwrap()
      .then(() => {
        showAlert({
          message: t("reviewRevision.success.updated"),
          severity: "success",
        })
        setIsEditing(false)
      })
      .catch(showAlert)
  }

  const handleCancel = () => {
    setContent(review.content || "")
    setRating(review.rating || 0)
    setErrors({})
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          border: "2px solid",
          borderColor: "warning.dark",
          opacity: 0.9,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Chip
            icon={<EditRounded />}
            label={t("reviewRevision.status.revisionRequested")}
            color="warning"
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("reviewRevision.info.revisionRequested", "Revision requested", {
            message: review.revision_message,
          })}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<EditRounded />}
          onClick={() => setIsEditing(true)}
          size="small"
          sx={{ textTransform: "none" }}
        >
          {t("reviewRevision.button.editReview")}
        </Button>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={2}
      sx={{ p: 3, border: "2px solid", borderColor: "primary.main" }}
    >
      <Typography variant="h6" gutterBottom>
        {t("reviewRevision.title.editReview")}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("reviewRevision.info.editInstructions")}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t("reviewRevision.label.rating")} *
        </Typography>
        <Rating
          value={rating}
          onChange={(_, newValue) => setRating(newValue || 0)}
          precision={0.5}
          size="large"
          disabled={isLoading}
        />
        {errors.rating && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: "block", mt: 1 }}
          >
            {errors.rating}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label={t("reviewRevision.label.content")}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={!!errors.content}
          helperText={
            errors.content ||
            `${content.length}/2000 ${t("reviewRevision.label.characters")}`
          }
          disabled={isLoading}
          inputProps={{ maxLength: 2000 }}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          startIcon={<CancelRounded />}
          onClick={handleCancel}
          disabled={isLoading}
          sx={{ textTransform: "none" }}
        >
          {t("reviewRevision.button.cancel")}
        </Button>

        <Button
          variant="contained"
          startIcon={
            isLoading ? <CircularProgress size={16} /> : <SaveRounded />
          }
          onClick={handleSave}
          disabled={isLoading || !content.trim() || rating < 0.5}
          sx={{ textTransform: "none" }}
        >
          {isLoading
            ? t("reviewRevision.button.saving")
            : t("reviewRevision.button.save")}
        </Button>
      </Box>
    </Paper>
  )
}
