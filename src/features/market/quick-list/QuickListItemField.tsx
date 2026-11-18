import { Box, Chip, Link, Stack, TextField } from "@mui/material"
import { OpenInNewRounded } from "@mui/icons-material"
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { WIKI_PATHS } from "../../../routes/paths"
import {
  CustomListingLink,
  CustomListingNotice,
} from "../components/CustomListing"
import { GameItemSearchAutocomplete } from "../components/GameItemSearchAutocomplete"
import { LISTING_TITLE_MAX } from "../domain/listingDraft"
import { type QuickListItem } from "../domain/quickList"
import { type QuickListField } from "./quickListFields"

/**
 * The item: picked from the page (with "Change item"), a catalog search, or
 * a custom listing (no game item) with its own title.
 */
export function QuickListItemField({
  item,
  itemPicked,
  itemFieldKey,
  customTitle,
  fieldError,
  pickItem,
  onChangeItem,
  onCustomItem,
  onCustomTitleChange,
  onPickGameItem,
}: {
  item: QuickListItem | null
  itemPicked: boolean
  itemFieldKey: number
  /** The custom listing's title, or null when listing a game item */
  customTitle: string | null
  fieldError: (field: QuickListField) => string | undefined
  pickItem: (next: QuickListItem | null) => void
  onChangeItem: () => void
  /** Switch to a custom listing, titled with the typed text */
  onCustomItem: (typedName: string) => void
  onCustomTitleChange: (title: string) => void
  onPickGameItem: () => void
}) {
  const { t } = useTranslation()
  // Switching to a custom listing moves focus to its title
  const isCustom = customTitle !== null
  const titleRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (isCustom) titleRef.current?.focus()
  }, [isCustom])

  if (customTitle !== null) {
    const titleError = fieldError("title")
    return (
      <Stack spacing={1.5}>
        <CustomListingNotice onPickGameItem={onPickGameItem} />
        <TextField
          id="quick-list-title"
          label={t("CreateListingV2.title", "Title")}
          value={customTitle}
          onChange={(e) => onCustomTitleChange(e.target.value)}
          required
          fullWidth
          inputRef={titleRef}
          error={!!titleError}
          helperText={titleError}
          inputProps={{ maxLength: LISTING_TITLE_MAX }}
        />
      </Stack>
    )
  }
  return (
    <Box>
      {item && itemPicked ? (
        <>
          <TextField
            label={t("quickList.item", "Item")}
            value={item.name}
            required
            fullWidth
            InputProps={{ readOnly: true }}
            helperText={t(
              "quickList.pickedFromPage",
              "Picked from the item page.",
            )}
          />
        </>
      ) : (
        <>
          <GameItemSearchAutocomplete
            key={itemFieldKey}
            value={item?.name ?? null}
            required
            label={t("quickList.item", "Item")}
            errorText={fieldError("item")}
            onChange={(name, type, id) =>
              pickItem(name && id ? { id, name, type } : null)
            }
            onCustomItem={onCustomItem}
          />
          <CustomListingLink onClick={() => onCustomItem("")} />
        </>
      )}
      {item && (
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          flexWrap="wrap"
          sx={{ mt: 0.75 }}
        >
          {item.type && <Chip label={item.type} size="small" />}
          <Link
            component={RouterLink}
            to={WIKI_PATHS.item(item.id, item.name)}
            target="_blank"
            rel="noopener"
            variant="body2"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
          >
            {t("quickList.wiki", "Wiki")}
            <OpenInNewRounded sx={{ fontSize: 14 }} aria-hidden />
          </Link>
          {itemPicked && (
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={onChangeItem}
            >
              {t("quickList.changeItem", "Change item")}
            </Link>
          )}
        </Stack>
      )}
    </Box>
  )
}
