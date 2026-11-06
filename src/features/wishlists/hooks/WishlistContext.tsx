/**
 * ShoppingListContext — provides addToShoppingList(blueprintId, gameItemId?) from anywhere.
 * Uses the generated V2 API hooks (registered in the Redux store).
 */

import React, { createContext, useContext, useState, useCallback } from "react"
import {
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Stack,
} from "@mui/material"
import { PlaylistAddRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useFocusOnReveal } from "../../../hooks/accessibility/useFocusOnReveal"
import {
  useGetWishlistsQuery,
  useCreateWishlistMutation,
  useAddWishlistItemMutation,
} from "../../../store/api/v2/market"
import { ResponsiveDialog } from "../../../components/dialog/ResponsiveDialog"

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

export function ShoppingListProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  const focusOnReveal = useFocusOnReveal<HTMLInputElement>()
  const [open, setOpen] = useState(false)
  const [request, setRequest] = useState<ShoppingListRequest | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")

  const { data, isLoading } = useGetWishlistsQuery(undefined, { skip: !open })
  const [addItem] = useAddWishlistItemMutation()
  const [createList] = useCreateWishlistMutation()

  const addToShoppingList = useCallback(
    (blueprintId?: string, gameItemId?: string) => {
      setRequest({ blueprintId, gameItemId })
      setOpen(true)
      setCreating(false)
      setNewName("")
    },
    [],
  )

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
    } catch {
      /* ignore */
    }
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
    } catch {
      /* ignore */
    }
  }

  const wishlists = data?.wishlists || []

  return (
    <ShoppingListCtx.Provider value={{ addToShoppingList }}>
      {children}
      <ResponsiveDialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        title={t("wishlistsUi.quickAdd.title")}
      >
        {isLoading && <CircularProgress size={24} />}
        {!isLoading && !wishlists.length && !creating && (
          <Alert severity="info" sx={{ mb: 1 }}>
            {t("wishlistsUi.quickAdd.noLists")}
          </Alert>
        )}
        {!creating && (
          <>
            <List dense disablePadding>
              {wishlists.map((wl) => (
                <ListItemButton
                  key={wl.wishlist_id}
                  onClick={() => handleSelect(wl.wishlist_id)}
                >
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
              {t("wishlistsUi.quickAdd.newList")}
            </Button>
          </>
        )}
        {creating && (
          <Stack spacing={1} sx={{ mt: 1 }}>
            <TextField
              size="small"
              fullWidth
              label={t("wishlistsUi.quickAdd.listName")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              inputRef={focusOnReveal}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                {t("wishlistsUi.quickAdd.createAndAdd")}
              </Button>
              <Button size="small" onClick={() => setCreating(false)}>
                {t("common.cancel")}
              </Button>
            </Stack>
          </Stack>
        )}
      </ResponsiveDialog>
    </ShoppingListCtx.Provider>
  )
}
