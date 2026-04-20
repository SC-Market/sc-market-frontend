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
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  LinearProgress,
  Chip,
  Stack,
} from "@mui/material"
import {
  Add,
  PlaylistAdd,
  Delete,
  Edit,
  Share,
  Lock,
  Public,
  CheckCircle,
} from "@mui/icons-material"
import {
  useGetWishlistsQuery,
  useCreateWishlistMutation,
  useDeleteWishlistMutation,
} from "../../store/wishlistsApi"
import { useNavigate } from "react-router-dom"

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
  const navigate = useNavigate()

  // State for create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newWishlistName, setNewWishlistName] = useState("")
  const [newWishlistDescription, setNewWishlistDescription] = useState("")
  const [newWishlistIsPublic, setNewWishlistIsPublic] = useState(false)
  const [newWishlistIsCollaborative, setNewWishlistIsCollaborative] = useState(false)

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [wishlistToDelete, setWishlistToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  // Query user's wishlists (Requirement 8.1, 8.2)
  const { data, isLoading, error } = useGetWishlistsQuery()

  // Mutations
  const [createWishlist, { isLoading: isCreating }] = useCreateWishlistMutation()
  const [deleteWishlist, { isLoading: isDeleting }] = useDeleteWishlistMutation()

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
        wishlist_name: newWishlistName.trim(),
        wishlist_description: newWishlistDescription.trim() || undefined,
        is_public: newWishlistIsPublic,
        is_collaborative: newWishlistIsCollaborative,
      }).unwrap()

      // Navigate to the new wishlist
      navigate(`/wishlists/${result.wishlist_id}`)
    } catch (err) {
      console.error("Failed to create wishlist:", err)
    }
  }

  const handleWishlistClick = (wishlistId: string) => {
    navigate(`/wishlists/${wishlistId}`)
  }

  const handleDeleteClick = (wishlistId: string, wishlistName: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setWishlistToDelete({ id: wishlistId, name: wishlistName })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!wishlistToDelete) return

    try {
      await deleteWishlist(wishlistToDelete.id).unwrap()
      setDeleteDialogOpen(false)
      setWishlistToDelete(null)
    } catch (err) {
      console.error("Failed to delete wishlist:", err)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setWishlistToDelete(null)
  }

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load wishlists. Please ensure you are logged in.
      </Alert>
    )
  }

  const wishlists = data?.wishlists || []

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            My Wishlists
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage wishlists of desired items and blueprints
          </Typography>
        </Box>

        {/* Create Wishlist Button (Requirement 8.4) */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateDialogOpen}
          size="large"
        >
          Create Wishlist
        </Button>
      </Box>

      {/* Wishlists Grid (Requirement 8.1, 8.2, 8.3) */}
      {wishlists.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 8 }}>
          <CardContent>
            <PlaylistAdd sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No wishlists yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first wishlist to start tracking desired items and blueprints
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateDialogOpen}
            >
              Create Your First Wishlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 2 }}>
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
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography variant="h6" sx={{ flex: 1, mr: 1 }}>
                    {wishlist.wishlist_name}
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    {wishlist.is_public ? (
                      <Public fontSize="small" color="action" titleAccess="Public" />
                    ) : (
                      <Lock fontSize="small" color="action" titleAccess="Private" />
                    )}
                    {wishlist.is_collaborative && (
                      <Share fontSize="small" color="action" titleAccess="Collaborative" />
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {wishlist.item_count} {wishlist.item_count === 1 ? "item" : "items"}
                  </Typography>
                  {wishlist.completed_items > 0 && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        •
                      </Typography>
                      <Chip
                        icon={<CheckCircle />}
                        label={`${wishlist.completed_items} acquired`}
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
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progress
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
                  Created {new Date(wishlist.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                <IconButton
                  size="small"
                  onClick={(e) => handleDeleteClick(wishlist.wishlist_id, wishlist.wishlist_name, e)}
                  color="error"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Create Wishlist Dialog (Requirement 8.4) */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCreateDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Wishlist</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {/* Wishlist Name */}
            <TextField
              label="Wishlist Name"
              value={newWishlistName}
              onChange={(e) => setNewWishlistName(e.target.value)}
              fullWidth
              required
              autoFocus
              placeholder="e.g., Ship Components, Armor Set, Mining Equipment"
            />

            {/* Description */}
            <TextField
              label="Description (Optional)"
              value={newWishlistDescription}
              onChange={(e) => setNewWishlistDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Add notes about this wishlist..."
            />

            {/* Public/Private Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={newWishlistIsPublic}
                  onChange={(e) => setNewWishlistIsPublic(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Make Public</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Anyone with the link can view this wishlist
                  </Typography>
                </Box>
              }
            />

            {/* Collaborative Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={newWishlistIsCollaborative}
                  onChange={(e) => setNewWishlistIsCollaborative(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Collaborative</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Allow organization members to edit this wishlist
                  </Typography>
                </Box>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateWishlist}
            variant="contained"
            disabled={isCreating || !newWishlistName.trim()}
          >
            {isCreating ? "Creating..." : "Create Wishlist"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog (Requirement 8.6) */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
      >
        <DialogTitle>Delete Wishlist?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{wishlistToDelete?.name}</strong>?
            This action cannot be undone and will remove all items in this wishlist.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
