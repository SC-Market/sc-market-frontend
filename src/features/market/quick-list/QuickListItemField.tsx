import { Box, Chip, Link, Stack, TextField } from "@mui/material"
import { OpenInNewRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { WIKI_PATHS } from "../../../routes/paths"
import { GameItemSearchAutocomplete } from "../components/GameItemSearchAutocomplete"
import { type QuickListItem } from "../domain/quickList"
import { type QuickListField } from "./quickListFields"

/** The item: picked from the page (with "Change item"), or a catalog search. */
export function QuickListItemField({
  item,
  itemPicked,
  itemFieldKey,
  fieldError,
  pickItem,
  onChangeItem,
}: {
  item: QuickListItem | null
  itemPicked: boolean
  itemFieldKey: number
  fieldError: (field: QuickListField) => string | undefined
  pickItem: (next: QuickListItem | null) => void
  onChangeItem: () => void
}) {
  const { t } = useTranslation()
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
        <GameItemSearchAutocomplete
          key={itemFieldKey}
          value={item?.name ?? null}
          required
          label={t("quickList.item", "Item")}
          errorText={fieldError("item")}
          onChange={(name, type, id) =>
            pickItem(name && id ? { id, name, type } : null)
          }
        />
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
