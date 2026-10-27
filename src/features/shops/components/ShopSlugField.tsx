import React from "react"
import { Box, Chip, Stack, TextField, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useGetShopSlugAvailabilityQuery,
  type ShopSlugAvailabilityResponse,
} from "../../../store/api/v2/market"
import { useDebounce } from "../../../hooks/useDebounce"

export const SHOP_SLUG_MIN_LENGTH = 3
/** How long typing must pause before the slug is checked. */
export const SHOP_SLUG_CHECK_DELAY_MS = 400

export interface ShopSlugFieldProps {
  value: string
  onChange: (slug: string) => void
  /** Org whose shop is being created (its Spectrum ID is reserved for it) */
  contractorId?: string
  /** Shop being renamed: its own slug counts as free */
  shopId?: string
  /** The shop's slug now; not checked, it keeps it */
  currentSlug?: string
  /** A 409 from the last save; shown while the slug is unchanged */
  conflict?: ShopSlugAvailabilityResponse
  /** Shown before the slug in the URL hint, e.g. "sc-market.space/shops/" */
  urlPrefix: string
  onFocus?: () => void
  size?: "small" | "medium"
}

/**
 * Shop slug input with a debounced availability check
 * (GET /shops/slug-availability). When the slug is taken or reserved it says
 * why and offers the API's free suggestions as chips; clicking one uses it.
 */
export function ShopSlugField(props: ShopSlugFieldProps) {
  const { value, onChange, contractorId, shopId, currentSlug, conflict } = props
  const { t } = useTranslation()
  const debounced = useDebounce(value, SHOP_SLUG_CHECK_DELAY_MS)
  const tooShort = value.length > 0 && value.length < SHOP_SLUG_MIN_LENGTH
  const unchanged = currentSlug !== undefined && value === currentSlug
  const settled = debounced === value
  const { data, isFetching } = useGetShopSlugAvailabilityQuery(
    { slug: debounced, contractorId, shopId },
    {
      skip:
        !settled ||
        debounced.length < SHOP_SLUG_MIN_LENGTH ||
        (currentSlug !== undefined && debounced === currentSlug),
    },
  )

  const result: ShopSlugAvailabilityResponse | undefined = unchanged
    ? undefined
    : conflict && conflict.slug === value
      ? conflict
      : data && data.slug === value
        ? data
        : undefined
  const unavailable = !!result && !result.available
  const checking =
    !tooShort &&
    !unchanged &&
    value.length >= SHOP_SLUG_MIN_LENGTH &&
    !result &&
    (!settled || isFetching)

  const url = `${props.urlPrefix}${value || "..."}`
  let helperText: string
  if (tooShort) {
    helperText = t("ShopSlugField.tooShort", { min: SHOP_SLUG_MIN_LENGTH })
  } else if (unavailable) {
    helperText = reasonText(t, result)
  } else if (checking) {
    helperText = t("ShopSlugField.checking")
  } else if (result?.available) {
    helperText = t("ShopSlugField.available", { url })
  } else {
    helperText = value ? url : t("ShopSlugField.hint")
  }

  return (
    <Box>
      <TextField
        label={t("ShopSlugField.label")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={props.onFocus}
        fullWidth
        size={props.size}
        error={tooShort || unavailable}
        helperText={helperText}
      />
      {unavailable && result.suggestions.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          alignItems="center"
          sx={{ mt: 1 }}
          aria-label={t("ShopSlugField.suggestions")}
          role="group"
        >
          <Typography variant="body2" color="text.secondary">
            {t("ShopSlugField.suggestions")}
          </Typography>
          {result.suggestions.map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => onChange(suggestion)}
            />
          ))}
        </Stack>
      )}
    </Box>
  )
}

function reasonText(
  t: ReturnType<typeof useTranslation>["t"],
  result: ShopSlugAvailabilityResponse,
): string {
  switch (result.reason) {
    case "reserved_word":
      return t("ShopSlugField.reason.reserved_word", { slug: result.slug })
    case "reserved_org":
      return t("ShopSlugField.reason.reserved_org", {
        holder: result.reserved_for ?? "",
      })
    case "reserved_user":
      return t("ShopSlugField.reason.reserved_user", {
        holder: result.reserved_for ?? "",
      })
    case "taken":
      return t("ShopSlugField.reason.taken")
    default:
      return t("ShopSlugField.reason.invalid")
  }
}
