import { useId, useMemo } from "react"
import { Box, Button, Chip, Stack, Typography } from "@mui/material"
import { CheckCircleRounded, ErrorRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  formatRatio,
  themeContrastChecks,
  type ContrastCheck,
} from "./contrastChecks"
import type { ThemeModeData } from "./themeEditorFields"

/**
 * Live WCAG 2.2 AA contrast of the edited mode: a pass/fail badge per colour
 * pair (text 4.5:1, borders and focus ring 3:1) and, on a failing pair, an
 * auto-fix that writes the nearest passing colour.
 */
export function ThemeContrastPanel({
  modeData,
  mode,
  onChange,
}: {
  modeData: ThemeModeData
  mode: "light" | "dark"
  onChange: (path: string[], value: unknown) => void
}) {
  const { t } = useTranslation()
  const titleId = useId()
  const checks = useMemo(
    () => themeContrastChecks(modeData, mode),
    [modeData, mode],
  )
  if (checks.length === 0) return null

  return (
    <Box component="section" aria-labelledby={titleId}>
      <Typography id={titleId} variant="subtitle2" sx={{ mt: 2.5, mb: 0.5 }}>
        {t("theme.contrastTitle", "Contrast (WCAG 2.2 AA)")}
      </Typography>
      <Typography variant="caption" component="p" sx={{ mb: 1 }}>
        {t(
          "theme.contrastIntro",
          "Text needs 4.5:1 against what it sits on; borders and the focus ring need 3:1. Colours you leave empty are derived to pass.",
        )}
      </Typography>
      <Stack
        component="ul"
        spacing={0.75}
        sx={{ listStyle: "none", m: 0, p: 0 }}
      >
        {checks.map((check) => (
          <ContrastRow
            key={check.key}
            check={check}
            onFix={() => check.fix && onChange(check.path, check.fix)}
          />
        ))}
      </Stack>
    </Box>
  )
}

function ContrastRow({
  check,
  onFix,
}: {
  check: ContrastCheck
  onFix: () => void
}) {
  const { t } = useTranslation()
  const label = t(check.labelKey, check.fallback)
  const minimum =
    check.kind === "text"
      ? t("theme.contrastMinText", "Text 4.5:1")
      : t("theme.contrastMinUi", "UI 3:1")
  return (
    <Box
      component="li"
      data-testid={`contrast-${check.key}`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
      }}
    >
      {/* The pair itself: the colour on its worst background */}
      <Box
        aria-hidden
        sx={{
          width: 36,
          height: 24,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          bgcolor: check.bg,
          color: check.fg,
          border: 1,
          borderColor: "outline.strong",
          borderRadius: 0.5,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {check.kind === "text" ? (
          // A type sample, not words (the swatch is aria-hidden)
          "Aa"
        ) : (
          <Box
            sx={{
              width: 14,
              height: 14,
              border: 2,
              borderColor: check.fg,
              borderRadius: 0.25,
            }}
          />
        )}
      </Box>
      <Box sx={{ flex: "1 1 180px", minWidth: 0 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="caption" component="p">
          {`${formatRatio(check.ratio)}:1`}
          {" · "}
          {minimum}
          {check.auto && ` · ${t("theme.contrastAuto", "Auto")}`}
        </Typography>
      </Box>
      <Chip
        size="small"
        variant="outlined"
        color={check.pass ? "success" : "error"}
        icon={check.pass ? <CheckCircleRounded /> : <ErrorRounded />}
        label={
          check.pass
            ? t("theme.contrastPass", "Passes AA")
            : t("theme.contrastFail", "Fails AA")
        }
      />
      {check.fix && (
        <Button
          size="small"
          variant="outlined"
          color="neutral"
          onClick={onFix}
          aria-label={t("theme.contrastAutoFixAria", "Auto-fix {{label}}", {
            label,
          })}
        >
          {t("theme.contrastAutoFix", "Auto-fix")}
        </Button>
      )}
    </Box>
  )
}
