/**
 * WishlistManager Component
 *
 * Display list of user wishlists with create dialog and wishlist selection.
 *
 * Task 14.1 - Create WishlistManager component
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

import React, { useState } from "react"
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  LinearProgress,
  Chip,
  Stack,
} from "@mui/material"
import { LabeledSwitch } from "../../components/buttons/LabeledSwitch"
import {
  AddRounded,
  PlaylistAddRounded,
  DeleteRounded,
  ShareRounded,
  LockRounded,
  PublicRounded,
  CheckCircleRounded,
} from "@mui/icons-material"
import {
  useGetWishlistsQuery,
  useCreateWishlistMutation,
  useDeleteWishlistMutation,
} from "../../store/api/v2/market"
import { useNavigate } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import { useFocusOnReveal } from "../../hooks/accessibility/useFocusOnReveal"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useFormatters } from "../../util/format"
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"
import { ConfirmDialog } from "../../components/dialog/ConfirmDialog"

/**
 * WishlistManager Component
 *
 * Features:
 * - Display list of user wishlists (8.1, 8.2)
 * - Show item counts and progress (8.3)
 * - Create new wishlist dialog (8.4)
 * - Delete wishlist confirmation (8.6)
 * - Navigate to wishlist detail (8.5)
 * - Support public/private visibility
 * - Support collaborative wishlists
 * - Display creation date
 * - Authentication required
 */
export function WishlistManager() {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const focusOnReveal = useFocusOnReveal<HTMLInputElement>()
  const { data: userProfile } = useGetUserProfileQuery()
  const primaryContractor = userProfile?.contractors?.[0]
  const navigate = useNavigate()

  // State for create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newWishlistName, setNewWishlistName] = useState("")
  const [newWishlistDescription, setNewWishlistDescription] = useState("")
  const [newWishlistIsPublic, setNewWishlistIsPublic] = useState(false)
  const [newWishlistIsCollaborative, setNewWishlistIsCollaborative] =
    useState(false)

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [wishlistToDelete, setWishlistToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  // Query user's wishlists (Requirement 8.1, 8.2)
  const { data, isLoading, error } = useGetWishlistsQuery()

  // Mutations
  const [createWishlist, { isLoading: isCreating }] =
    useCreateWishlistMutation()
  const [deleteWishlist, { isLoading: isDeleting }] =
    useDeleteWishlistMutation()

  // Handlers
  const handleCreateDialogOpen = () => {
    setCreateDialogOpen(true)
    setNewWishlistName("")
    setNewWishlistDescription("")
    setNewWishlistIsPublic(false)
    setNewWishlistIsCollaborative(false)
  }

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false)
  }

  const handleCreateWishlist = async () => {
    if (!newWishlistName.trim()) {
      return
    }

    try {
      const result = await createWishlist({
        createWishlistRequest: {
          wishlist_name: newWishlistName.trim(),
          wishlist_description: newWishlistDescription.trim() || undefined,
          is_public: newWishlistIsPublic,
          is_collaborative: newWishlistIsCollaborative,
          organization_id:
            newWishlistIsCollaborative && primaryContractor
              ? primaryContractor.spectrum_id
              : undefined,
        },
      }).unwrap()

      // Navigate to the new wishlist
      navigate(`/shopping-lists/${result.wishlist_id}`)
    } catch (err) {
      console.error("Failed to create shopping list:", err)
    }
  }

  const handleWishlistClick = (wishlistId: string) => {
    navigate(`/shopping-lists/${wishlistId}`)
  }

  const handleDeleteClick = (
    wishlistId: string,
    wishlistName: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation()
    setWishlistToDelete({ id: wishlistId, name: wishlistName })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!wishlistToDelete) return

    try {
      await deleteWishlist({ wishlistId: wishlistToDelete.id }).unwrap()
      setDeleteDialogOpen(false)
      setWishlistToDelete(null)
    } catch (err) {
      console.error("Failed to delete shopping list:", err)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setWishlistToDelete(null)
  }

  // Loading state
  if (isLoading) {
    return (
      <StandardPageLayout
        title={t("wishlists.manager.title", "My Shopping Lists")}
        headerTitle={t("wishlists.manager.header", "My Shopping Lists")}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        </Grid>
      </StandardPageLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <StandardPageLayout
        title={t("wishlists.manager.title", "My Shopping Lists")}
        headerTitle={t("wishlists.manager.header", "My Shopping Lists")}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <Alert severity="error">
            {t(
              "wishlists.manager.error",
              "Failed to load shopping lists. Please ensure you are logged in.",
            )}
          </Alert>
        </Grid>
      </StandardPageLayout>
    )
  }

  const wishlists = data?.wishlists || []

  return (
    <StandardPageLayout
      title={t("wishlists.manager.title", "My Shopping Lists")}
      headerTitle={t("wishlists.manager.header", "My Shopping Lists")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {t(
              "wishlists.manager.description",
              "Create and manage shopping lists of desired items and blueprints",
            )}
          </Typography>

          {/* Create Wishlist Button (Requirement 8.4) */}
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={handleCreateDialogOpen}
            size="large"
          >
            {t("wishlistsUi.manager.createWishlist")}
          </Button>
        </Box>

        {/* Wishlists Grid (Requirement 8.1, 8.2, 8.3) */}
        {wishlists.length === 0 ? (
          <Card sx={{ textAlign: "center", py: 8 }}>
            <CardContent>
              <PlaylistAddRounded
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t("wishlistsUi.manager.emptyTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t("wishlistsUi.manager.emptyBody")}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={handleCreateDialogOpen}
              >
                {t("wishlistsUi.manager.createFirst")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: 2,
            }}
          >
            {wishlists.map((wishlist) => (
              <Card
                key={wishlist.wishlist_id}
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleWishlistClick(wishlist.wishlist_id)}
              >
                <CardContent>
                  {/* Wishlist Name and Badges */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ flex: 1, mr: 1 }}>
                      {wishlist.wishlist_name}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      {wishlist.is_public ? (
                        <PublicRounded
                          fontSize="small"
                          color="action"
                          titleAccess={t("wishlistsUi.public")}
                        />
                      ) : (
                        <LockRounded
                          fontSize="small"
                          color="action"
                          titleAccess={t("wishlistsUi.private")}
                        />
                      )}
                      {wishlist.is_collaborative && (
                        <ShareRounded
                          fontSize="small"
                          color="action"
                          titleAccess={t("wishlistsUi.collaborative")}
                        />
                      )}
                    </Stack>
                  </Box>

                  {/* Description */}
                  {wishlist.wishlist_description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {wishlist.wishlist_description}
                    </Typography>
                  )}

                  {/* Item Count */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("wishlistsUi.manager.itemCount", {
                        count: wishlist.item_count,
                      })}
                    </Typography>
                    {wishlist.completed_items > 0 && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          •
                        </Typography>
                        <Chip
                          icon={<CheckCircleRounded />}
                          label={t("wishlistsUi.manager.acquiredCount", {
                            count: wishlist.completed_items,
                          })}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </>
                    )}
                  </Box>

                  {/* Progress Bar (Requirement 8.3) */}
                  {wishlist.item_count > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {t("wishlists.progress")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {wishlist.progress_percentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={wishlist.progress_percentage}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}

                  {/* Created Date */}
                  <Typography variant="caption" color="text.secondary">
                    {t("wishlistsUi.manager.createdOn", {
                      date: fmt.date(wishlist.created_at),
                    })}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                  <IconButton
                    size="small"
                    onClick={(e) =>
                      handleDeleteClick(
                        wishlist.wishlist_id,
                        wishlist.wishlist_name,
                        e,
                      )
                    }
                    color="error"
                    aria-label={t("wishlistsUi.manager.deleteNamed", {
                      name: wishlist.wishlist_name,
                    })}
                  >
                    <DeleteRounded fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}

        {/* Create Wishlist Dialog (Requirement 8.4) */}
        <ResponsiveDialog
          open={createDialogOpen}
          onClose={handleCreateDialogClose}
          maxWidth="sm"
          title={t("wishlistsUi.manager.createDialog.title")}
          disableClose={isCreating}
          actions={
            <>
              <Button onClick={handleCreateDialogClose} disabled={isCreating}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleCreateWishlist}
                variant="contained"
                disabled={isCreating || !newWishlistName.trim()}
              >
                {isCreating
                  ? t("wishlistsUi.manager.createDialog.creating")
                  : t("wishlistsUi.manager.createDialog.submit")}
              </Button>
            </>
          }
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {/* Wishlist Name */}
            <TextField
              size="small"
              label={t("wishlistsUi.manager.createDialog.name")}
              value={newWishlistName}
              onChange={(e) => setNewWishlistName(e.target.value)}
              fullWidth
              required
              inputRef={focusOnReveal}
              placeholder={t(
                "wishlistsUi.manager.createDialog.namePlaceholder",
              )}
            />

            {/* Description */}
            <TextField
              size="small"
              label={t("wishlistsUi.manager.createDialog.description")}
              value={newWishlistDescription}
              onChange={(e) => setNewWishlistDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder={t(
                "wishlistsUi.manager.createDialog.descriptionPlaceholder",
              )}
            />

            {/* Public/Private Toggle */}
            <LabeledSwitch
              checked={newWishlistIsPublic}
              onChange={setNewWishlistIsPublic}
              label={
                <Typography variant="body2">
                  {t("wishlistsUi.manager.createDialog.makePublic")}
                </Typography>
              }
              helperText={t("wishlistsUi.publicHelp")}
            />

            {/* Collaborative Toggle — only available when an org is selected */}
            <LabeledSwitch
              checked={newWishlistIsCollaborative}
              onChange={setNewWishlistIsCollaborative}
              disabled={!primaryContractor}
              label={
                <Typography
                  variant="body2"
                  color={!primaryContractor ? "text.disabled" : undefined}
                >
                  {t("wishlistsUi.collaborative")}
                </Typography>
              }
              helperText={
                primaryContractor
                  ? t("wishlistsUi.manager.createDialog.collaborativeHelp", {
                      org: primaryContractor.name,
                    })
                  : t("wishlistsUi.manager.createDialog.collaborativeNoOrg")
              }
            />

            {newWishlistIsCollaborative && primaryContractor && (
              <Alert severity="info" sx={{ mt: -1 }}>
                <Trans
                  i18nKey="wishlistsUi.manager.createDialog.ownedBy"
                  values={{ org: primaryContractor.name }}
                  components={{ strong: <strong /> }}
                />
              </Alert>
            )}
          </Box>
        </ResponsiveDialog>

        {/* Delete Confirmation Dialog (Requirement 8.6) */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          maxWidth="sm"
          title={t("wishlistsUi.manager.deleteDialog.title")}
          message={
            <Trans
              i18nKey="wishlistsUi.manager.deleteDialog.body"
              values={{ name: wishlistToDelete?.name ?? "" }}
              components={{ strong: <strong /> }}
            />
          }
          cancelLabel={t("common.cancel")}
          confirmLabel={
            isDeleting
              ? t("wishlistsUi.manager.deleteDialog.deleting")
              : t("common.delete")
          }
          destructive
          loading={isDeleting}
        />
      </Grid>
    </StandardPageLayout>
  )
}
