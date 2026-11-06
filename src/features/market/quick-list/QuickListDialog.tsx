/**
 * Quick List: list an item in about 15 seconds. Item, price, quantity,
 * Publish (or Publish & list another). A dialog on desktop, a full-screen
 * sheet on phones. Stock is one number by default and can be split by
 * location / quality; everything else is folded under More options.
 *
 * It creates the listing with the shared listing rules (listingDraft.ts),
 * the same ones as the full Create Listing form.
 */
import React, { useEffect, useMemo, useState } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import {
  AddRounded,
  DeleteOutlineRounded,
  ExpandMoreRounded,
  OpenInNewRounded,
  RemoveRounded,
} from "@mui/icons-material"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import { useSession } from "../../../hooks/login/useSession"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useCreateListingMutation,
  useDeleteListingMutation,
  useGetPriceStatsQuery,
} from "../../../store/api/v2/market"
import { SHOP_PATHS, WIKI_PATHS } from "../../../routes/paths"
import { useFormatters } from "../../../util/format"
import { getQualityMode } from "../../../util/qualityMode"
import { GameItemSearchAutocomplete } from "../components/GameItemSearchAutocomplete"
import { LocationSelector } from "../components/stock/LocationSelector"
import { SelectPhotosArea } from "../../../components/modal/SelectPhotosArea"
import { BulkDiscountTierEditor } from "../../../components/market/BulkDiscountTierEditor"
import { ShopSelector } from "../../shops/components/ShopSelector"
import { FirstUseHint } from "../../help/components/FirstUseHint"
import { HelpLink } from "../../help/components/HelpLink"
import { useListingPhotoUploads } from "../hooks/useListingPhotoUploads"
import { ResponsiveDialog } from "../../../components/dialog/ResponsiveDialog"
import { useSellingAsShop } from "./useSellingAsShop"
import {
  buildCreateListingRequest,
  listingDraftIssueError,
  validateListingDraft,
  type ListingDraftIssue,
} from "../domain/listingDraft"
import { focusListingField, listingApiError } from "../domain/listingFormErrors"
import {
  emptyQuickListForm,
  marketPriceHint,
  nextQuickListForm,
  quickListDraft,
  quickListTotal,
  suggestedQuickListPrice,
  type QuickListBatch,
  type QuickListForm,
  type QuickListItem,
} from "../domain/quickList"

/** Where an error shows: next to its field, or above the actions. */
type QuickListField =
  | "item"
  | "price"
  | "quantity"
  | "batches"
  | "auction_end_time"
  | "form"

interface QuickListError {
  field: QuickListField
  message: string
}

function issueField(
  issue: ListingDraftIssue,
  form: QuickListForm,
): QuickListField {
  switch (issue.code) {
    case "gameItemRequired":
    case "titleRequired":
    case "titleTooLong":
      return "item"
    case "basePriceRequired":
      return "price"
    case "stockLotRequired":
    case "quantityRequired":
    case "qualityTierRange":
    case "qualityValueRange":
    case "variantPriceRequired":
      return form.stockMode === "simple" ? "quantity" : "batches"
    case "auctionEndTimeRequired":
      return "auction_end_time"
  }
}

const TIERS = [1, 2, 3, 4, 5] as const

function newBatch(): QuickListBatch {
  return { key: crypto.randomUUID(), quantity: 1 }
}

export interface QuickListDialogProps {
  open: boolean
  onClose: () => void
  /** The item of the page it was opened from: picked, until "Change item". */
  item?: QuickListItem | null
}

export function QuickListDialog({
  open,
  onClose,
  item: pageItem = null,
}: QuickListDialogProps) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const isMobile = useIsMobile()
  const session = useSession()
  const issueAlert = useAlertHook()
  const verified =
    session.status === "authenticated" && !!session.profile.rsi_confirmed

  const selling = useSellingAsShop()
  const [shopId, setShopId] = useState<string | null>(null)
  // Start on the default shop once the shops are known; keep the user's choice after
  useEffect(() => {
    if (!selling.defaultShopId) return
    setShopId((current) =>
      current && selling.shops.some((s) => s.shop_id === current)
        ? current
        : selling.defaultShopId,
    )
  }, [selling.defaultShopId, selling.shops])
  const shop = selling.shops.find((s) => s.shop_id === shopId) ?? null

  const [form, setForm] = useState<QuickListForm>(() =>
    emptyQuickListForm(pageItem),
  )
  const [itemPicked, setItemPicked] = useState(!!pageItem)
  const [priceTouched, setPriceTouched] = useState(false)
  const [error, setError] = useState<QuickListError | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  // Bumped to remount (clear and focus) the item search after "list another"
  const [itemFieldKey, setItemFieldKey] = useState(0)
  const [listed, setListed] = useState<{
    listingId: string
    name: string
    price: number
    quantity: number
  } | null>(null)
  const [listedCount, setListedCount] = useState(0)
  const photos = useListingPhotoUploads()

  const [createListing, { isLoading: publishing }] = useCreateListingMutation()
  const [deleteListing, { isLoading: undoing }] = useDeleteListingMutation()

  const item = form.item
  const qualityMode = getQualityMode(item?.type)
  const update = (patch: Partial<QuickListForm>) =>
    setForm((prev) => ({ ...prev, ...patch }))
  const clearError = (field: QuickListField) =>
    setError((prev) =>
      prev?.field === field || prev?.field === "form" ? null : prev,
    )

  // The market price: the hint under Price, and the price to start from
  // currentData: never the previous item's numbers while the new ones load
  const { currentData: priceStats } = useGetPriceStatsQuery(
    { id: item?.id ?? "" },
    { skip: !item },
  )
  const hint = useMemo(
    () => (item ? marketPriceHint(priceStats) : null),
    [item, priceStats],
  )
  const suggested = item ? suggestedQuickListPrice(priceStats) : null
  useEffect(() => {
    if (!priceTouched && suggested != null)
      setForm((prev) => ({ ...prev, price: suggested }))
  }, [suggested, priceTouched])

  const pickItem = (next: QuickListItem | null) => {
    clearError("item")
    setPriceTouched(false)
    setForm((prev) => ({
      ...prev,
      item: next,
      price: 0,
      qualityTier: undefined,
    }))
  }

  const total = quickListTotal(form)
  const perBatch = form.stockMode === "batches" && form.pricePerBatch

  const fieldError = (field: QuickListField) =>
    error?.field === field ? error.message : undefined

  const publish = async (another: boolean) => {
    if (!shop) {
      setError({
        field: "form",
        message: t("quickList.errors.noShop", "Choose the shop to sell as."),
      })
      return
    }
    const draft = {
      ...quickListDraft(form),
      photoResourceIds: photos.photoResourceIds,
      externalPhotoUrls: photos.photos,
    }
    const issue = validateListingDraft(draft)
    if (issue || !draft.gameItemId) {
      const resolved = issue ?? ({ code: "gameItemRequired" } as const)
      setError({
        field: issueField(resolved, form),
        message: listingDraftIssueError(resolved, t).message,
      })
      if (resolved.code === "auctionEndTimeRequired") setMoreOpen(true)
      return
    }
    setError(null)
    try {
      const result = await createListing({
        createListingRequest: buildCreateListingRequest(
          { ...draft, gameItemId: draft.gameItemId },
          shop,
        ),
      }).unwrap()
      selling.remember(shop.shop_id)
      const price = perBatch
        ? Math.min(...form.batches.map((b) => b.price ?? 0))
        : form.price
      const summary = {
        listingId: result.listing_id,
        name: draft.title,
        price,
        quantity: total,
      }
      if (another) {
        setListed(summary)
        setListedCount((n) => n + 1)
        setForm((prev) => nextQuickListForm(prev))
        setItemPicked(false)
        setPriceTouched(false)
        photos.reset()
        setItemFieldKey((k) => k + 1)
      } else {
        issueAlert({
          message: t("quickList.published", {
            defaultValue: "Listed: {{name}}",
            name: draft.title,
          }),
          severity: "success",
        })
        onClose()
      }
    } catch (err) {
      const apiError = listingApiError(
        err,
        t("CreateListingV2.error", "Failed to create listing"),
      )
      const field: QuickListField =
        apiError.field === "base_price"
          ? "price"
          : apiError.field === "quantity"
            ? form.stockMode === "simple"
              ? "quantity"
              : "batches"
            : apiError.field === "auction_end_time"
              ? "auction_end_time"
              : "form"
      setError({ field, message: apiError.message })
    }
  }

  const undo = async () => {
    if (!listed) return
    try {
      await deleteListing({ id: listed.listingId }).unwrap()
      setListedCount((n) => Math.max(0, n - 1))
      setListed(null)
      issueAlert({
        message: t("quickList.undone", {
          defaultValue: "Removed: {{name}}",
          name: listed.name,
        }),
        severity: "info",
      })
    } catch {
      issueAlert({
        message: t(
          "quickList.undoFailed",
          "Couldn't undo. Archive it from your shop's Listings.",
        ),
        severity: "error",
      })
    }
  }

  const fullFormUrl =
    shop &&
    `${SHOP_PATHS.create(shop.slug)}${
      item
        ? `?game_item_id=${encodeURIComponent(item.id)}&game_item_name=${encodeURIComponent(item.name)}&game_item_type=${encodeURIComponent(item.type ?? "")}`
        : ""
    }`

  const updateBatch = (key: string, patch: Partial<QuickListBatch>) => {
    clearError("batches")
    setForm((prev) => ({
      ...prev,
      batches: prev.batches.map((b) =>
        b.key === key ? { ...b, ...patch } : b,
      ),
    }))
  }

  const setStockMode = (mode: QuickListForm["stockMode"]) => {
    clearError("quantity")
    clearError("batches")
    setForm((prev) => ({
      ...prev,
      stockMode: mode,
      // Splitting starts with one batch holding the whole quantity
      batches:
        mode === "batches" && prev.batches.length === 0
          ? [
              {
                ...newBatch(),
                quantity: prev.quantity > 0 ? prev.quantity : 1,
                quality_tier: prev.qualityTier,
              },
            ]
          : prev.batches,
    }))
  }

  const blocked = !verified || !shop || photos.isUploading

  // The item search gets focus when there's no item yet (and after "list another")
  useEffect(() => {
    if (open && !itemPicked) {
      const id = window.setTimeout(() => focusListingField("game_item_id"), 50)
      return () => window.clearTimeout(id)
    }
  }, [open, itemPicked, itemFieldKey])

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      mobile="fullScreen"
      title={t("quickList.title", "List an item")}
      closeLabel={t("quickList.close", "Close")}
      dividers
      actions={
        <>
          <LoadingButton
            variant="outlined"
            size="large"
            fullWidth={isMobile}
            disabled={blocked || !item}
            loading={publishing}
            onClick={() => void publish(true)}
          >
            {t("quickList.publishAnother", "Publish & list another")}
          </LoadingButton>
          <LoadingButton
            variant="contained"
            size="large"
            fullWidth={isMobile}
            disabled={blocked || !item}
            loading={publishing}
            onClick={() => void publish(false)}
          >
            {photos.isUploading
              ? t("CreateListingV2.uploadingPhotos", "Uploading photos...")
              : t("quickList.publish", "Publish")}
          </LoadingButton>
        </>
      }
    >
      <Stack
        spacing={2.25}
        component="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void publish(false)
        }}
      >
        <FirstUseHint hint="quickList" title={t("hints.quickList.title")}>
          {t("hints.quickList.body")}
        </FirstUseHint>

        {listed && (
          <Alert
            severity="success"
            variant="outlined"
            role="status"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={undo}
                disabled={undoing}
              >
                {t("quickList.undo", "Undo")}
              </Button>
            }
          >
            {t("quickList.listedAnother", {
              defaultValue: "Listed: {{name}} · {{price}} × {{quantity}}.",
              name: listed.name,
              price: fmt.auec(listed.price),
              quantity: fmt.integer(listed.quantity),
            })}{" "}
            {t("quickList.listedSoFar", {
              count: listedCount,
              formatted: fmt.integer(listedCount),
            })}
          </Alert>
        )}

        {!verified && session.status === "authenticated" && (
          <Alert severity="warning">
            {t(
              "market.verificationRequired",
              "Your account must be verified to create market listings. Please verify your account with RSI/Citizen iD to continue.",
            )}
          </Alert>
        )}

        {error?.field === "form" && (
          <Alert severity="error" role="alert">
            {error.message}
          </Alert>
        )}
        {error && error.field !== "form" && (
          <Alert severity="error" variant="outlined" role="alert">
            {t("quickList.errors.summary", {
              defaultValue: "Couldn't publish: {{message}}",
              message: error.message,
            })}
          </Alert>
        )}

        <ShopSelector
          id="quick-list-shop"
          value={shopId ?? ""}
          onChange={(id) => {
            clearError("form")
            setShopId(id)
          }}
          label={t("quickList.sellingAs", "Selling as")}
          helperText={t(
            "quickList.sellingAsHelp",
            "The shop this listing goes in.",
          )}
        />

        {/* Item */}
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
                  onClick={() => {
                    setItemPicked(false)
                    pickItem(null)
                    setItemFieldKey((k) => k + 1)
                  }}
                >
                  {t("quickList.changeItem", "Change item")}
                </Link>
              )}
            </Stack>
          )}
        </Box>

        {/* Price and quantity */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              isMobile || form.stockMode === "batches" ? "1fr" : "7fr 5fr",
            gap: 2,
          }}
        >
          <NumericFormat
            customInput={TextField}
            id="quick-list-price"
            decimalScale={0}
            allowNegative={false}
            thousandSeparator
            fullWidth
            required={!perBatch}
            disabled={!item || perBatch}
            label={t("quickList.price", "Price per unit")}
            value={form.price || ""}
            onValueChange={(values, source) => {
              if (source.source === "event") setPriceTouched(true)
              clearError("price")
              update({ price: values.floatValue ?? 0 })
            }}
            error={!!fieldError("price")}
            helperText={
              fieldError("price") ??
              (perBatch
                ? t(
                    "quickList.pricePerBatchActive",
                    "Each batch has its own price.",
                  )
                : hint
                  ? t("quickList.marketHint", {
                      defaultValue:
                        "Market: low {{low}} · median {{median}} · {{listings}}",
                      low: hint.low != null ? fmt.integer(hint.low) : "—",
                      median:
                        hint.median != null ? fmt.integer(hint.median) : "—",
                      listings: t("quickList.listingCount", {
                        count: hint.listings,
                        formatted: fmt.integer(hint.listings),
                      }),
                    })
                  : item
                    ? t(
                        "quickList.noMarket",
                        "No market price yet: you set the first one.",
                      )
                    : " ")
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">aUEC</InputAdornment>
              ),
            }}
            inputProps={{ inputMode: "numeric" }}
          />
          {form.stockMode === "simple" && (
            <NumericFormat
              customInput={TextField}
              id="quick-list-quantity"
              decimalScale={0}
              allowNegative={false}
              thousandSeparator
              fullWidth
              required
              label={t("quickList.quantity", "Quantity")}
              value={form.quantity}
              onValueChange={(values) => {
                clearError("quantity")
                update({ quantity: values.floatValue ?? 0 })
              }}
              error={!!fieldError("quantity")}
              helperText={fieldError("quantity") ?? " "}
              inputProps={{
                inputMode: "numeric",
                style: { textAlign: "center" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      size="small"
                      edge="start"
                      aria-label={t("quickList.oneLess", "One less")}
                      disabled={form.quantity <= 1}
                      onClick={() =>
                        update({ quantity: Math.max(1, form.quantity - 1) })
                      }
                    >
                      <RemoveRounded fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      aria-label={t("quickList.oneMore", "One more")}
                      onClick={() => {
                        clearError("quantity")
                        update({ quantity: form.quantity + 1 })
                      }}
                    >
                      <AddRounded fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Box>

        {/* Quality: only for items with tiers */}
        {qualityMode === "tier" && form.stockMode === "simple" && (
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
              sx={{ mb: 0.75 }}
              id="quick-list-quality"
            >
              {t("quickList.quality", "Quality")}
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              aria-labelledby="quick-list-quality"
              value={form.qualityTier ?? 0}
              onChange={(_, v: number | null) => {
                if (v !== null) update({ qualityTier: v === 0 ? undefined : v })
              }}
              sx={{ flexWrap: "wrap" }}
            >
              <ToggleButton value={0} sx={{ px: 1.75, textTransform: "none" }}>
                {t("quickList.anyQuality", "Any")}
              </ToggleButton>
              {TIERS.map((tier) => (
                <ToggleButton key={tier} value={tier} sx={{ px: 1.75 }}>
                  {t("quickList.tierShort", {
                    defaultValue: "T{{tier}}",
                    tier,
                  })}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Stock */}
        {item && (
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
              flexWrap="wrap"
            >
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={600}
                id="quick-list-stock"
              >
                {t("quickList.stock", "Stock")}
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                aria-labelledby="quick-list-stock"
                value={form.stockMode}
                onChange={(_, v: QuickListForm["stockMode"] | null) =>
                  v && setStockMode(v)
                }
              >
                <ToggleButton value="simple" sx={{ textTransform: "none" }}>
                  {t("quickList.stockSimple", "Just a number")}
                </ToggleButton>
                <ToggleButton value="batches" sx={{ textTransform: "none" }}>
                  {t("quickList.stockBatches", "By location / quality")}
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            {form.stockMode === "simple" ? (
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ mt: 0.75 }}
              >
                {t(
                  "quickList.stockSimpleHelp",
                  "One number is enough. You can split it by location or quality any time.",
                )}
              </Typography>
            ) : (
              <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                {form.batches.map((batch, index) => (
                  <Box
                    key={batch.key}
                    role="group"
                    aria-label={t("quickList.batchLabel", {
                      defaultValue: "Batch {{index}}",
                      index: index + 1,
                    })}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "88px 1fr"
                        : `96px 1fr ${qualityMode === "none" ? "" : "120px "}${perBatch ? "140px " : ""}40px`,
                      gap: 1,
                      alignItems: "center",
                      p: isMobile ? 1 : 0,
                      border: isMobile ? 1 : 0,
                      borderColor: "outline.main",
                      borderRadius: (theme) =>
                        theme.spacing(theme.borderRadius.topLevel),
                    }}
                  >
                    <NumericFormat
                      customInput={TextField}
                      size="small"
                      decimalScale={0}
                      allowNegative={false}
                      thousandSeparator
                      label={t("quickList.batchQuantity", "Qty")}
                      value={batch.quantity}
                      error={!!fieldError("batches") && !(batch.quantity > 0)}
                      onValueChange={(v) =>
                        updateBatch(batch.key, { quantity: v.floatValue ?? 0 })
                      }
                      inputProps={{ inputMode: "numeric" }}
                    />
                    <LocationSelector
                      size="small"
                      fullWidth
                      label={t("quickList.location", "Location")}
                      value={batch.location_id ?? null}
                      onChange={(id) =>
                        updateBatch(batch.key, { location_id: id ?? undefined })
                      }
                    />
                    {qualityMode === "tier" && (
                      <TextField
                        select
                        size="small"
                        label={t("quickList.quality", "Quality")}
                        value={batch.quality_tier ?? 0}
                        onChange={(e) => {
                          const v = Number(e.target.value)
                          updateBatch(batch.key, {
                            quality_tier: v === 0 ? undefined : v,
                          })
                        }}
                      >
                        <MenuItem value={0}>
                          {t("quickList.anyQuality", "Any")}
                        </MenuItem>
                        {TIERS.map((tier) => (
                          <MenuItem key={tier} value={tier}>
                            {t("quickList.tierShort", {
                              defaultValue: "T{{tier}}",
                              tier,
                            })}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                    {qualityMode === "value" && (
                      <NumericFormat
                        customInput={TextField}
                        size="small"
                        decimalScale={0}
                        allowNegative={false}
                        isAllowed={({ floatValue }) =>
                          floatValue === undefined || floatValue <= 1000
                        }
                        label={t("quickList.qualityValue", "Quality (0-1000)")}
                        value={batch.quality_value ?? ""}
                        onValueChange={(v) =>
                          updateBatch(batch.key, {
                            quality_value: v.floatValue,
                          })
                        }
                        inputProps={{ inputMode: "numeric" }}
                      />
                    )}
                    {perBatch && (
                      <NumericFormat
                        customInput={TextField}
                        size="small"
                        decimalScale={0}
                        allowNegative={false}
                        thousandSeparator
                        label={t("quickList.batchPrice", "Price")}
                        value={batch.price ?? ""}
                        error={
                          !!fieldError("batches") &&
                          !(batch.price && batch.price > 0)
                        }
                        onValueChange={(v) =>
                          updateBatch(batch.key, { price: v.floatValue })
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">aUEC</InputAdornment>
                          ),
                        }}
                        inputProps={{ inputMode: "numeric" }}
                      />
                    )}
                    <IconButton
                      aria-label={t("quickList.removeBatch", "Remove batch")}
                      disabled={form.batches.length <= 1}
                      onClick={() =>
                        update({
                          batches: form.batches.filter(
                            (b) => b.key !== batch.key,
                          ),
                        })
                      }
                      sx={{ justifySelf: isMobile ? "end" : "center" }}
                    >
                      <DeleteOutlineRounded />
                    </IconButton>
                  </Box>
                ))}
                {fieldError("batches") && (
                  <Typography variant="caption" color="error">
                    {fieldError("batches")}
                  </Typography>
                )}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                  gap={1}
                >
                  <Button
                    size="small"
                    color="neutral"
                    startIcon={<AddRounded />}
                    onClick={() =>
                      update({ batches: [...form.batches, newBatch()] })
                    }
                  >
                    {t("quickList.addBatch", "Add batch")}
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {t("quickList.total", {
                      defaultValue: "Total {{total}}",
                      total: fmt.integer(total),
                    })}
                  </Typography>
                </Stack>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.pricePerBatch}
                      onChange={(e) =>
                        update({ pricePerBatch: e.target.checked })
                      }
                    />
                  }
                  label={t(
                    "quickList.pricePerBatch",
                    "Each batch has its own price",
                  )}
                />
              </Stack>
            )}
          </Box>
        )}

        {/* More options */}
        <Accordion
          disableGutters
          expanded={moreOpen}
          onChange={(_, expanded) => setMoreOpen(expanded)}
          sx={{ bgcolor: "transparent", "&:before": { display: "none" } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreRounded />}>
            <Box>
              <Typography color="text.secondary" fontWeight={600}>
                {t("quickList.moreOptions", "More options")}
              </Typography>
              {!moreOpen && (
                <Typography variant="body2" color="text.primary">
                  {t(
                    "quickList.moreOptionsSummary",
                    "Description, photos, sale type, pickup, order limits, discounts",
                  )}
                </Typography>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <TextField
                label={t("quickList.description", "Description (optional)")}
                multiline
                minRows={2}
                value={form.description}
                inputProps={{ maxLength: 2000 }}
                onChange={(e) => update({ description: e.target.value })}
                helperText={t(
                  "quickList.descriptionHelp",
                  "Markdown works here. Leave it empty if the item speaks for itself.",
                )}
              />
              <SelectPhotosArea
                setPhotos={photos.setPhotos}
                photos={photos.photos}
                onFileUpload={photos.handleFileUpload}
                onAlert={(severity, message) =>
                  issueAlert({ severity, message })
                }
                uploadedImages={photos.uploadedImages}
                onRemoveUploadedImage={photos.handleRemoveUploadedImage}
              />
              <TextField
                select
                size="small"
                label={t("CreateListingV2.saleType", "Sale Type")}
                value={form.saleType}
                onChange={(e) =>
                  update({
                    saleType: e.target.value as QuickListForm["saleType"],
                  })
                }
              >
                <MenuItem value="fixed">
                  {t("CreateListingV2.fixed", "Fixed Price")}
                </MenuItem>
                <MenuItem value="negotiable">
                  {t("CreateListingV2.negotiable", "Negotiable")}
                </MenuItem>
                <MenuItem value="auction">
                  {t("CreateListingV2.auction", "Auction")}
                </MenuItem>
              </TextField>
              {form.saleType === "auction" && (
                <TextField
                  id="quick-list-auction-end"
                  type="datetime-local"
                  label={t(
                    "CreateListingV2.auctionEndTime",
                    "Auction End Time",
                  )}
                  value={form.auctionEndTime}
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!!fieldError("auction_end_time")}
                  helperText={fieldError("auction_end_time")}
                  onChange={(e) => {
                    clearError("auction_end_time")
                    update({ auctionEndTime: e.target.value })
                  }}
                />
              )}
              <TextField
                select
                size="small"
                label={t("CreateListingV2.pickupMethod", "Pickup Method")}
                value={form.pickupMethod}
                onChange={(e) =>
                  update({
                    pickupMethod: e.target
                      .value as QuickListForm["pickupMethod"],
                  })
                }
              >
                <MenuItem value="">
                  {t("CreateListingV2.notSpecified", "Not specified")}
                </MenuItem>
                <MenuItem value="delivery">
                  {t("CreateListingV2.delivery", "Delivery (seller delivers)")}
                </MenuItem>
                <MenuItem value="pickup">
                  {t("CreateListingV2.pickup", "Pickup (buyer picks up)")}
                </MenuItem>
                <MenuItem value="any">
                  {t("CreateListingV2.either", "Either (delivery or pickup)")}
                </MenuItem>
              </TextField>
              {shop?.is_org_owned && (
                <TextField
                  select
                  size="small"
                  label={t("market.visibility", "Visibility")}
                  value={form.visibility}
                  onChange={(e) =>
                    update({
                      visibility: e.target.value as QuickListForm["visibility"],
                    })
                  }
                >
                  <MenuItem value="public">
                    {t("market.visibilityPublic", "Public")}
                  </MenuItem>
                  <MenuItem value="private">
                    {t(
                      "market.visibilityPrivate",
                      "Private (org members only)",
                    )}
                  </MenuItem>
                </TextField>
              )}
              <Stack direction="row" gap={2}>
                <NumericFormat
                  customInput={TextField}
                  size="small"
                  fullWidth
                  decimalScale={0}
                  allowNegative={false}
                  thousandSeparator
                  label={t("CreateListingV2.minQuantity", "Min Quantity")}
                  value={form.minOrderQuantity ?? ""}
                  onValueChange={(v) =>
                    update({ minOrderQuantity: v.floatValue ?? null })
                  }
                />
                <NumericFormat
                  customInput={TextField}
                  size="small"
                  fullWidth
                  decimalScale={0}
                  allowNegative={false}
                  thousandSeparator
                  label={t("CreateListingV2.maxQuantity", "Max Quantity")}
                  value={form.maxOrderQuantity ?? ""}
                  onValueChange={(v) =>
                    update({ maxOrderQuantity: v.floatValue ?? null })
                  }
                />
              </Stack>
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ mb: 1 }}
                >
                  {t("market.bulkDiscountTiers", "Bulk Discounts")}
                </Typography>
                <BulkDiscountTierEditor
                  tiers={form.bulkDiscountTiers}
                  onChange={(tiers) => update({ bulkDiscountTiers: tiers })}
                />
              </Box>
              {fullFormUrl && (
                <Typography variant="body2" color="text.primary">
                  {t(
                    "quickList.fullFormLead",
                    "Need order value limits or a draft?",
                  )}{" "}
                  <Link
                    component={RouterLink}
                    to={fullFormUrl}
                    onClick={onClose}
                  >
                    {t("quickList.fullForm", "Open the full form")}
                  </Link>
                </Typography>
              )}
              <HelpLink guide="quickList">
                {t("quickList.learnMore", "How Quick List works")}
              </HelpLink>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </ResponsiveDialog>
  )
}
