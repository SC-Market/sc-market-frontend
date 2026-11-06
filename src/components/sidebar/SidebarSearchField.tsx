import { Box, IconButton, InputAdornment, TextField } from "@mui/material"
import { CloseRounded, SearchRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"

/** The sidebar's "Search navigation" field, with a clear button. */
export function SidebarSearchField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const { t } = useTranslation()
  return (
    <Box sx={{ px: 2, pb: 1 }}>
      <TextField
        size="small"
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("nav.searchPlaceholder", "Search navigation")}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded
                fontSize="small"
                sx={{ color: "text.secondary" }}
              />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => onChange("")}
                aria-label={t("nav.clearSearch", "Clear search")}
              >
                <CloseRounded fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        }}
      />
    </Box>
  )
}
