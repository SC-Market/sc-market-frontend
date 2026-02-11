import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useGetTokensQuery,
  useDeleteTokenMutation,
  ApiToken,
} from "../api/tokensApi"
import { CreateTokenDialog } from "./CreateTokenDialog"
import { EditTokenDialog } from "./EditTokenDialog"
import { TokenDetailsDialog } from "./TokenDetailsDialog"
import { UnderlineLink } from "../../../components/typography/UnderlineLink.tsx"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Popover from '@mui/material/Popover';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import useTheme1 from '@mui/material/styles';
import ListSubheader from '@mui/material/ListSubheader';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormGroup from '@mui/material/FormGroup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import CreateRounded from '@mui/icons-material/CreateRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import ScheduleIcon from '@mui/icons-material/Schedule';

export function ApiTokensSettings() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { data: tokens, isLoading, error } = useGetTokensQuery()
  const [deleteToken] = useDeleteTokenMutation()

  // Debug logging for cache invalidation
  React.useEffect(() => {
    console.log("ApiTokensSettings - Query state changed:", {
      tokens: tokens?.length,
      isLoading,
      error: !!error,
      timestamp: new Date().toISOString(),
    })
  }, [tokens, isLoading, error])

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<ApiToken | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tokenToDelete, setTokenToDelete] = useState<ApiToken | null>(null)

  const handleCreateToken = () => {
    setCreateDialogOpen(true)
  }

  const handleEditToken = (token: ApiToken) => {
    setSelectedToken(token)
    setEditDialogOpen(true)
  }

  const handleViewToken = (token: ApiToken) => {
    setSelectedToken(token)
    setDetailsDialogOpen(true)
  }

  const handleDeleteToken = (token: ApiToken) => {
    setTokenToDelete(token)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteToken = async () => {
    if (tokenToDelete) {
      try {
        console.log("ApiTokensSettings - Deleting token:", tokenToDelete.id)
        await deleteToken(tokenToDelete.id).unwrap()
        console.log("ApiTokensSettings - Token deleted successfully")
        setDeleteDialogOpen(false)
        setTokenToDelete(null)
      } catch (error) {
        console.error("Failed to delete token:", error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const getExpiryStatus = (expiresAt?: string) => {
    if (!expiresAt) return { status: "never", color: "default" as const }
    if (isExpired(expiresAt))
      return { status: "expired", color: "error" as const }

    const daysUntilExpiry = Math.ceil(
      (new Date(expiresAt).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    )

    if (daysUntilExpiry <= 7)
      return { status: "soon", color: "warning" as const }
    return { status: "valid", color: "success" as const }
  }

  const getScopeColor = (scope: string) => {
    if (scope === "full") return "primary"
    if (scope === "readonly") return "info"
    if (scope.startsWith("contractors:")) return "secondary"
    return "default"
  }

  if (isLoading) {
    return (
      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <Typography>Loading tokens...</Typography>
        </Grid>
      </Grid>
    )
  }

  if (error) {
    return (
      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <Alert severity="error">
            Failed to load API tokens. Please try again later.
          </Alert>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2">
            API Tokens
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateToken}
          >
            Create Token
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 2 }}>
          API tokens allow third-party applications to access your account with
          specific permissions. You can create tokens with limited scopes and
          contractor access for enhanced security.
          <a href="https://api.sc-market.space/docs" target="_blank">
            <Button>Open API Docs</Button>
          </a>
        </Alert>
      </Grid>

      {tokens && tokens.length === 0 ? (
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <SecurityIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No API tokens created
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Create your first API token to start integrating with
                third-party applications.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateToken}
              >
                Create Your First Token
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        tokens?.map((token) => {
          const expiryStatus = getExpiryStatus(token.expires_at)

          return (
            <Grid item xs={12} md={6} key={token.id}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                  >
                    <Box>
                      <Typography variant="h6" component="h3">
                        {token.name}
                      </Typography>
                      {token.description && (
                        <Typography variant="body2" color="text.secondary">
                          {token.description}
                        </Typography>
                      )}
                    </Box>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewToken(token)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Token">
                        <IconButton
                          size="small"
                          onClick={() => handleEditToken(token)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Token">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteToken(token)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Scopes:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {token.scopes.slice(0, 3).map((scope) => (
                        <Chip
                          key={scope}
                          label={scope}
                          size="small"
                          color={getScopeColor(scope)}
                          variant="outlined"
                        />
                      ))}
                      {token.scopes.length > 3 && (
                        <Chip
                          label={`+${token.scopes.length - 3} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Contractor Access:
                    </Typography>
                    <Typography variant="body2">
                      {(token.contractor_spectrum_ids || []).length === 0
                        ? "All contractors"
                        : `${(token.contractor_spectrum_ids || []).length} contractor(s)`}
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Created: {formatDate(token.created_at)}
                      </Typography>
                    </Box>
                    {token.expires_at && (
                      <Chip
                        label={
                          expiryStatus.status === "expired"
                            ? "Expired"
                            : expiryStatus.status === "soon"
                              ? "Expires Soon"
                              : "Active"
                        }
                        size="small"
                        color={expiryStatus.color}
                        variant={
                          expiryStatus.status === "expired"
                            ? "filled"
                            : "outlined"
                        }
                      />
                    )}
                  </Box>

                  {token.last_used_at && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      Last used: {formatDateTime(token.last_used_at)}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })
      )}

      {/* Create Token Dialog */}
      <CreateTokenDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      {/* Edit Token Dialog */}
      <EditTokenDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        token={selectedToken}
      />

      {/* Token Details Dialog */}
      <TokenDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        token={selectedToken}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete API Token</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the token &#34;{tokenToDelete?.name}
            &#34;? This action cannot be undone and any applications using this
            token will lose access.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDeleteToken}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
