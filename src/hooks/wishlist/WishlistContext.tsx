/**
 * WishlistContext — provides addToWishlist(blueprintId, gameItemId?) from anywhere.
 * Renders a shared picker dialog to select which wishlist to add to.
 * Wrap the app (or game-data routes) with <WishlistProvider>.
 */

import React, { createContext, useContext, useState, useCallback } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Stack,
} from "@mui/material"
import { PlaylistAddRounded } from "@mui/icons-material"
import {
  useGetWishlistsQuery,
  useCreateWishlistMutation,
  useAddWishlistItemMutation,
} from "../../store/wishlistsApi"
import { useAlertHook } from "../../hooks/alert/AlertHook"

interface WishlistRequest {
  blueprintId?: string
  gameItemId?: string
}

interface WishlistContextValue {
  addToWishlist: (blueprintId?: string, gameItemId?: string) => void
}

const WishlistCtx = createContext<WishlistContextValue>({
  addToWishlist: () => {},
})

export const useWishlist = () => useContext(WishlistCtx)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [request, setRequest] = useState<WishlistRequest | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")

  const { data, isLoading } = useGetWishlistsQuery(undefined, { skip: !open })
  const [addItem] = useAddWishlistItemMutation()
  const [createWishlist] = useCreateWishlistMutation()
  const issueAlert = useAlertHook()

  const addToWishlist = useCallback((blueprintId?: string, gameItemId?: string) => {
    setRequest({ blueprintId, gameItemId })
    setOpen(true)
    setCreating(false)
    setNewName("")
  }, [])

  const handleSelect = async (wishlistId: string) => {
    if (!request) return
    try {
      await addItem({
        wishlist_id: wishlistId,
        body: {
          game_item_id: request.gameItemId || request.blueprintId || "",
          blueprint_id: request.blueprintId,
          desired_quantity: 1,
          priority: 0,
        },
      }).unwrap()
      issueAlert({ severity: "success", message: "Added to wishlist" })
    } catch {
      issueAlert({ severity: "error", message: "Failed to add to wishlist" })
    }
    setOpen(false)
    setRequest(null)
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      const wl = await createWishlist({
        wishlist_name: newName.trim(),
        is_public: false,
        is_collaborative: false,
      }).unwrap()
      await handleSelect(wl.wishlist_id)
    } catch {
      issueAlert({ severity: "error", message: "Failed to create wishlist" })
    }
  }

  return (
    <WishlistCtx.Provider value={{ addToWishlist }}>
      {children}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add to Wishlist</DialogTitle>
        <DialogContent>
          {isLoading && <CircularProgress size={24} />}
          {!isLoading && !data?.wishlists?.length && !creating && (
            <Alert severity="info" sx={{ mb: 1 }}>No wishlists yet.</Alert>
          )}
          {!creating && (
            <>
              <List dense disablePadding>
                {(data?.wishlists || []).map((wl) => (
                  <ListItemButton key={wl.wishlist_id} onClick={() => handleSelect(wl.wishlist_id)}>
                    <ListItemText
                      primary={wl.wishlist_name}
                      secondary={wl.wishlist_description || undefined}
                    />
                  </ListItemButton>
                ))}
              </List>
              <Button
                size="small"
                startIcon={<PlaylistAddRounded />}
                onClick={() => setCreating(true)}
                sx={{ mt: 1, textTransform: "none" }}
              >
                New Wishlist
              </Button>
            </>
          )}
          {creating && (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <TextField
                size="small"
                fullWidth
                label="Wishlist Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" onClick={handleCreate} disabled={!newName.trim()}>
                  Create & Add
                </Button>
                <Button size="small" onClick={() => setCreating(false)}>Cancel</Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </WishlistCtx.Provider>
  )
}
