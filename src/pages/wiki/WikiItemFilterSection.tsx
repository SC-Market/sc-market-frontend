import { Box, Typography, Stack } from "@mui/material"
import { useTranslation } from "react-i18next"

export function FilterSection({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: { value: string; label?: string; count?: number }[]
  selected: string
  onChange: (v: string) => void
}) {
  const { t } = useTranslation()
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
          mb: 0.5,
          display: "block",
        }}
      >
        {label}
      </Typography>
      <Stack spacing={0.25}>
        {[
          { value: "", label: t("wiki.itemBrowser.all", "All") },
          ...options,
        ].map((opt) => (
          <Box
            key={opt.value}
            onClick={() => onChange(opt.value)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              cursor: "pointer",
              transition: "background 0.12s",
              bgcolor:
                selected === opt.value ? "action.selected" : "transparent",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Typography
              variant="body2"
              fontWeight={selected === opt.value ? 700 : 400}
            >
              {opt.label ?? opt.value}
            </Typography>
            {opt.count != null && (
              <Typography variant="caption" color="text.secondary">
                {opt.count}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
