/**
 * WishlistShare Component
 * 
 * Dialog for managing wishlist sharing settings including:
 * - Share link generation with copy-to-clipboard
 * - Privacy settings (public/private)
 * - Collaborative mode toggle
 * - Share token display
 * 
 * Features:
 * - Generate shareable link with token (Requirement 28.1)
 * - Toggle public/private visibility (Requirement 28.5)
 * - Toggle collaborative mode (Requirement 28.6)
 * - Copy link to clipboard functionality
 * - Display share link with copy button
 * 
 * Task 14.5 - Create WishlistShare component
 * Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6
 */

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  CircularProgress,
} from "@mui/material"
import {
  ContentCopy,
  Check,
  Share,
  Lock,
  Public,
  Group,
  Info,
} from "@mui/icons-material"
import { Trans, useTranslation } from "react-i18next"
import { useUpdateWishlistMutation } from "../../store/api/v2/market"
import type { Wishlist } from "../../store/api/v2/market"

export interface WishlistShareProps {
  open: boolean
  onClose: () => void
  wishlist: Wishlist
}

/**
 * WishlistShare Component
 * 
 * Provides a dialog for managing wishlist sharing settings:
 * - Generate and display shareable link
 * - Toggle public/private visibility
 * - Toggle collaborative mode for organization members
 * - Copy link to clipboard with visual feedback
 * - Display current sharing status
 */
export function WishlistShare({ open, onClose, wishlist }: WishlistShareProps) {
  const { t } = useTranslation()
  // State
  const [isPublic, setIsPublic] = useState(wishlist.is_public)
  const [isCollaborative, setIsCollaborative] = useState(wishlist.is_collaborative)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // RTK Query mutation
  const [updateWishlist, { isLoading }] = useUpdateWishlistMutation()

  // Reset state when wishlist changes
  useEffect(() => {
    setIsPublic(wishlist.is_public)
    setIsCollaborative(wishlist.is_collaborative)
    setCopied(false)
    setError(null)
    setSuccess(null)
  }, [wishlist])

  // Generate share URL (Requirement 28.1)
  const shareUrl = wishlist.share_token
    ? `${window.location.origin}/game-data/shopping-lists/${wishlist.wishlist_id}?share_token=${wishlist.share_token}`
    : null

  // Handle copy to clipboard (Requirement 28.1)
  const handleCopyLink = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setSuccess(t("wishlistsUi.share.linkCopied"))
      
      // Reset copied state after 3 seconds
      setTimeout(() => {
        setCopied(false)
        setSuccess(null)
      }, 3000)
    } catch {
      setError(t("wishlistsUi.share.copyFailed"))
    }
  }

  // Handle privacy toggle (Requirement 28.5)
  const handlePublicToggle = async (checked: boolean) => {
    setError(null)
    setSuccess(null)

    try {
      await updateWishlist({
        wishlistId: wishlist.wishlist_id,
        updateWishlistRequest: {
          is_public: checked,
        },
      }).unwrap()

      setIsPublic(checked)
      setSuccess(
        checked
          ? t("wishlistsUi.share.nowPublic")
          : t("wishlistsUi.share.nowPrivate")
      )
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t("wishlistsUi.share.privacyError")
      setError(errorMessage)
      // Revert toggle on error
      setIsPublic(!checked)
    }
  }

  // Handle collaborative toggle (Requirement 28.6)
  const handleCollaborativeToggle = async (checked: boolean) => {
    setError(null)
    setSuccess(null)

    try {
      await updateWishlist({
        wishlistId: wishlist.wishlist_id,
        updateWishlistRequest: {
          is_collaborative: checked,
        },
      }).unwrap()

      setIsCollaborative(checked)
      setSuccess(
        checked
          ? t("wishlistsUi.share.collabEnabled")
          : t("wishlistsUi.share.collabDisabled")
      )
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t("wishlistsUi.share.collabError")
      setError(errorMessage)
      // Revert toggle on error
      setIsCollaborative(!checked)
    }
  }

  // Handle close
  const handleClose = () => {
    setCopied(false)
    setError(null)
    setSuccess(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Share />
          {t("wishlistsUi.share.title")}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>
          {/* Success Alert */}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Wishlist Name */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t("wishlistsUi.share.wishlistLabel")}
            </Typography>
            <Typography variant="h6">{wishlist.wishlist_name}</Typography>
          </Box>

          <Divider />

          {/* Privacy Settings (Requirement 28.5) */}
          <Box>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              {t("wishlistsUi.share.privacySettings")}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={isPublic}
                  onChange={(e) => handlePublicToggle(e.target.checked)}
                  disabled={isLoading}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {isPublic ? <Public fontSize="small" /> : <Lock fontSize="small" />}
                  <Typography>
                    {isPublic ? t("wishlistsUi.public") : t("wishlistsUi.private")}
                  </Typography>
                </Box>
              }
            />

            <Typography variant="caption" color="text.secondary" display="block" ml={4}>
              {isPublic
                ? t("wishlistsUi.publicHelp")
                : t("wishlistsUi.share.privateHelp")}
            </Typography>
          </Box>

          {/* Share Link (Requirement 28.1) */}
          {isPublic && shareUrl && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t("wishlistsUi.share.shareLink")}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                {t("wishlistsUi.share.shareLinkHelp")}
              </Typography>
              <Box display="flex" gap={1} alignItems="center">
                <TextField
                  value={shareUrl}
                  fullWidth
                  size="small"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "0.875rem",
                    },
                  }}
                />
                <Tooltip title={copied ? t("wishlistsUi.share.copied") : t("wishlistsUi.share.copyToClipboard")}>
                  <IconButton
                    onClick={handleCopyLink}
                    color={copied ? "success" : "primary"}
                    size="small"
                  >
                    {copied ? <Check /> : <ContentCopy />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          )}

          {/* Private Wishlist Info */}
          {!isPublic && (
            <Alert severity="info" icon={<Info />}>
              {t("wishlistsUi.share.enablePublicHint")}
            </Alert>
          )}

          <Divider />

          {/* Collaborative Settings (Requirement 28.6) */}
          {wishlist.organization_id && (
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                {t("wishlistsUi.share.collaborationSettings")}
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={isCollaborative}
                    onChange={(e) => handleCollaborativeToggle(e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Group fontSize="small" />
                    <Typography>{t("wishlistsUi.share.collaborativeMode")}</Typography>
                  </Box>
                }
              />

              <Typography variant="caption" color="text.secondary" display="block" ml={4}>
                {isCollaborative
                  ? t("wishlistsUi.share.collabOnHelp")
                  : t("wishlistsUi.share.collabOffHelp")}
              </Typography>

              <Alert severity="info" icon={<Info />} sx={{ mt: 2 }}>
                {t("wishlistsUi.share.orgAssociated")}
              </Alert>
            </Box>
          )}

          {/* No Organization Info */}
          {!wishlist.organization_id && (
            <Alert severity="info" icon={<Info />}>
              {t("wishlistsUi.share.noOrg")}
            </Alert>
          )}

          {/* Sharing Status Summary (Requirement 28.4) */}
          <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.default" }}>
            <Typography variant="subtitle2" gutterBottom>
              {t("wishlistsUi.share.currentStatus")}
            </Typography>
            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1}>
                {isPublic ? (
                  <Public fontSize="small" color="success" />
                ) : (
                  <Lock fontSize="small" color="action" />
                )}
                <Typography variant="body2">
                  <Trans
                    i18nKey={isPublic ? "wishlistsUi.share.visibilityPublic" : "wishlistsUi.share.visibilityPrivate"}
                    components={{ strong: <strong /> }}
                  />
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Group fontSize="small" color={isCollaborative ? "success" : "action"} />
                <Typography variant="body2">
                  <Trans
                    i18nKey={isCollaborative ? "wishlistsUi.share.collaborationEnabled" : "wishlistsUi.share.collaborationDisabled"}
                    components={{ strong: <strong /> }}
                  />
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Share fontSize="small" color={shareUrl ? "success" : "action"} />
                <Typography variant="body2">
                  <Trans
                    i18nKey={shareUrl ? "wishlistsUi.share.shareLinkGenerated" : "wishlistsUi.share.shareLinkUnavailable"}
                    components={{ strong: <strong /> }}
                  />
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : t("wishlistsUi.close")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
