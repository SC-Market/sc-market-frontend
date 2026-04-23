/**
 * ShoppingListContext — provides addToShoppingList(blueprintId, gameItemId?) from anywhere.
 * Uses the generated V2 API hooks (registered in the Redux store).
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
} from "../../store/api/v2/market"

interface ShoppingListRequest {
  blueprintId?: string
  gameItemId?: string
}

interface ShoppingListContextValue {
  addToShoppingList: (blueprintId?: string, gameItemId?: string) => void
}

const ShoppingListCtx = createContext<ShoppingListContextValue>({
  addToShoppingList: () => {},
})

export const useShoppingList = () => useContext(ShoppingListCtx)

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [request, setRequest] = useState<ShoppingListRequest | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")

  const { data, isLoading } = useGetWishlistsQuery(undefined, { skip: !open })
  const [addItem] = useAddWishlistItemMutation()
  const [createList] = useCreateWishlistMutation()

  const addToShoppingList = useCallback((blueprintId?: string, gameItemId?: string) => {
    setRequest({ blueprintId, gameItemId })
    setOpen(true)
    setCreating(false)
    setNewName("")
  }, [])

  const handleSelect = async (wishlistId: string) => {
    if (!request) return
    try {
      await addItem({
        wishlistId,
        addWishlistItemRequest: {
          game_item_id: request.gameItemId || request.blueprintId || "",
          blueprint_id: request.blueprintId,
          desired_quantity: 1,
          priority: 0,
        },
      }).unwrap()
    } catch { /* ignore */ }
    setOpen(false)
    setRequest(null)
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      const wl = await createList({
        createWishlistRequest: {
          wishlist_name: newName.trim(),
          is_public: false,
          is_collaborative: false,
        },
      }).unwrap()
      await handleSelect(wl.wishlist_id)
    } catch { /* ignore */ }
  }

  const wishlists = data?.wishlists || []

  return (
    <ShoppingListCtx.Provider value={{ addToShoppingList }}>
      {children}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add to Shopping List</DialogTitle>
        <DialogContent>
          {isLoading && <CircularProgress size={24} />}
          {!isLoading && !wishlists.length && !creating && (
            <Alert severity="info" sx={{ mb: 1 }}>No shopping lists yet.</Alert>
          )}
          {!creating && (
            <>
              <List dense disablePadding>
                {wishlists.map((wl) => (
                  <ListItemButton key={wl.wishlist_id} onClick={() => handleSelect(wl.wishlist_id)}>
                    <ListItemText primary={wl.wishlist_name} />
                  </ListItemButton>
                ))}
              </List>
              <Button
                size="small"
                startIcon={<PlaylistAddRounded />}
                onClick={() => setCreating(true)}
                sx={{ mt: 1, textTransform: "none" }}
              >
                New Shopping List
              </Button>
            </>
          )}
          {creating && (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <TextField
                size="small" fullWidth label="List Name" value={newName}
                onChange={(e) => setNewName(e.target.value)} autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" onClick={handleCreate} disabled={!newName.trim()}>Create & Add</Button>
                <Button size="small" onClick={() => setCreating(false)}>Cancel</Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </ShoppingListCtx.Provider>
  )
}
