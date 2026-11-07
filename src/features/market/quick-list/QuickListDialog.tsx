/**
 * Quick List: list an item in about 15 seconds. Item, price, quantity,
 * Publish (or Publish & list another). A dialog on desktop, a full-screen
 * sheet on phones. Stock is one number by default and can be split by
 * location / quality; everything else is folded under More options.
 *
 * It creates the listing with the shared listing rules (listingDraft.ts),
 * the same ones as the full Create Listing form.
 */
import { useEffect, useState } from "react"
import { Alert, Button, Stack } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTranslation } from "react-i18next"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import { useSession } from "../../../hooks/login/useSession"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useCreateListingMutation,
  useDeleteListingMutation,
} from "../../../store/api/v2/market"
import { SHOP_PATHS } from "../../../routes/paths"
import { useFormatters } from "../../../util/format"
import { ShopSelector } from "../../shops/components/ShopSelector"
import { FirstUseHint } from "../../help/components/FirstUseHint"
import { useListingPhotoUploads } from "../hooks/useListingPhotoUploads"
import { ResponsiveDialog } from "../../../components/dialog/ResponsiveDialog"
import { useSellingAsShop } from "./useSellingAsShop"
import {
  buildCreateListingRequest,
  listingDraftIssueError,
  validateListingDraft,
} from "../domain/listingDraft"
import { focusListingField, listingApiError } from "../domain/listingFormErrors"
import {
  nextQuickListForm,
  quickListDraft,
  type QuickListItem,
} from "../domain/quickList"
import { issueField, type QuickListField } from "./quickListFields"
import { useQuickListForm } from "./useQuickListForm"
import { QuickListStock } from "./QuickListStock"
import { QuickListPricing } from "./QuickListPricing"
import { QuickListMoreOptions } from "./QuickListMoreOptions"
import { QuickListItemField } from "./QuickListItemField"

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

  const {
    form,
    setForm,
    itemPicked,
    setItemPicked,
    setPriceTouched,
    error,
    setError,
    item,
    qualityMode,
    update,
    clearError,
    hint,
    pickItem,
    total,
    perBatch,
    fieldError,
    updateBatch,
    setStockMode,
  } = useQuickListForm(pageItem)
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
        <QuickListItemField
          item={item}
          itemPicked={itemPicked}
          itemFieldKey={itemFieldKey}
          fieldError={fieldError}
          pickItem={pickItem}
          onChangeItem={() => {
            setItemPicked(false)
            pickItem(null)
            setItemFieldKey((k) => k + 1)
          }}
        />

        {/* Price and quantity */}
        <QuickListPricing
          form={form}
          update={update}
          item={item}
          perBatch={perBatch}
          hint={hint}
          qualityMode={qualityMode}
          fieldError={fieldError}
          clearError={clearError}
          setPriceTouched={setPriceTouched}
        />

        {/* Stock */}
        {item && (
          <QuickListStock
            form={form}
            update={update}
            updateBatch={updateBatch}
            setStockMode={setStockMode}
            fieldError={fieldError}
            qualityMode={qualityMode}
            perBatch={perBatch}
            total={total}
          />
        )}

        {/* More options */}
        <QuickListMoreOptions
          form={form}
          update={update}
          moreOpen={moreOpen}
          setMoreOpen={setMoreOpen}
          photos={photos}
          shop={shop}
          fieldError={fieldError}
          clearError={clearError}
          fullFormUrl={fullFormUrl}
          onClose={onClose}
        />
      </Stack>
    </ResponsiveDialog>
  )
}
