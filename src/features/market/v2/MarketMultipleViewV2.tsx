import { useMemo, useState } from "react"
import {
  Box,
  Card,
  CardContent,
  Divider,
  Fade,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useParams } from "react-router-dom"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { ListingDetailContentSkeleton } from "../../../components/skeletons/MarketListingDetailSkeleton"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Section } from "../../../components/paper/Section"
import { OrderList } from "../../../components/list/OrderList"
import { MarkdownRender } from "../../../components/markdown/Markdown.lazy"
import { SeoHead } from "../../../seo/SeoHead"
import { buildBundleHead } from "../../../seo/entityHeads"
import { FRONTEND_URL } from "../../../util/constants"
import { useTranslation } from "react-i18next"
import { VariantSelector } from "../../../components/market/v2/VariantSelector"
import { isOrderOpen } from "../../orders/domain/status"
import { useListingPermissions } from "../hooks/useListingPermissions"
import { useGetListingDetailQuery } from "../../../store/api/v2/market"
import { MARKET_PATHS } from "../../../routes/paths"
import { type BundleListingV2, toBundleListingV2 } from "./bundleListing"
import {
  ShopSellerLink,
  BundlePurchaseArea,
  VariantDetailsTable,
} from "./BundleListingParts"
import { BundleImagePanel, BundleListingHeader } from "./BundleListingHeader"

export function MarketMultipleViewV2() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const theme = useTheme<ExtendedTheme>()
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedItemIndex, setSelectedItemIndex] = useState(0)
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({})

  const {
    data: listingDetail,
    isLoading,
    error,
  } = useGetListingDetailQuery({ id: id! }, { skip: !id })

  const complete: BundleListingV2 | null = useMemo(
    () => (listingDetail ? toBundleListingV2(listingDetail) : null),
    [listingDetail],
  )
  const currentItem = complete?.items[selectedItemIndex]

  // Edit button and People section: viewers who manage the listing's shop
  const { canManage } = useListingPermissions(listingDetail?.seller.shop_id)

  // Calculate bundle total based on selected variants
  const bundleTotal = useMemo(() => {
    if (!complete) return 0
    let total = 0
    for (const item of complete.items) {
      const selectedVariantId = selectedVariants[item.item_id]
      if (selectedVariantId) {
        const variant = item.variants.find(
          (v) => v.variant_id === selectedVariantId,
        )
        if (variant) {
          total += variant.price
        }
      } else if (item.variants.length === 1) {
        // Auto-select if only one variant
        total += item.variants[0].price
      }
    }
    return total
  }, [complete, selectedVariants])

  // Check if all items have variants selected
  const allVariantsSelected = useMemo(() => {
    if (!complete) return false
    return complete.items.every((item) => {
      return selectedVariants[item.item_id] || item.variants.length === 1
    })
  }, [complete, selectedVariants])

  // Handle variant selection
  const handleVariantChange = (itemId: string, variantId: string | null) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [itemId]: variantId || "",
    }))
  }

  return (
    <StandardPageLayout
      title={complete?.title || t("marketV2.bundleListing")}
      headerTitle={complete?.title}
      breadcrumbs={[
        {
          label: t("sidebar.market_short", "Market"),
          href: MARKET_PATHS.search,
        },
        { label: complete?.title || "Listing" },
      ]}
      isLoading={isLoading}
      skeleton={<ListingDetailContentSkeleton withBreadcrumbs={false} />}
      error={!complete && !isLoading ? error : undefined}
      sidebarOpen={true}
      maxWidth="xl"
    >
      {complete && currentItem && (
        <>
          <Grid item xs={12} lg={12}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              {/* Image Section */}
              <Grid item xs={12} lg={4}>
                <Grid container spacing={theme.layoutSpacing.layout}>
                  <Grid item xs={12} lg={12}>
                    <BundleImagePanel
                      photos={complete.photos}
                      title={complete.title}
                      open={imageModalOpen}
                      setOpen={setImageModalOpen}
                    />

                    {listingDetail && (
                      <SeoHead
                        head={buildBundleHead(listingDetail, FRONTEND_URL)}
                      />
                    )}
                  </Grid>

                  {/* People Section */}
                  {canManage && (
                    <Grid item lg={12} xs={12}>
                      <Grid container spacing={theme.layoutSpacing.component}>
                        <Section
                          disablePadding
                          xs={12}
                          title={t("MarketMultipleView.people")}
                          innerJustify={"flex-start"}
                        >
                          <Grid
                            item
                            xs={12}
                            sx={{
                              paddingTop: 2,
                              paddingBottom: 2,
                              boxSizing: "border-box",
                            }}
                          >
                            <ShopSellerLink
                              name={complete.seller.name}
                              slug={complete.seller.slug}
                              avatar={complete.seller.avatar}
                              rating={complete.seller.rating.avg_rating}
                              title={t("MarketMultipleView.seller")}
                            />
                          </Grid>
                        </Section>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              {/* Main Content Section */}
              <Grid item xs={12} lg={8}>
                <Grid container spacing={theme.layoutSpacing.layout}>
                  <Grid item xs={12}>
                    <Fade in={true}>
                      <Card
                        sx={{
                          borderRadius: (theme) =>
                            theme.spacing(theme.borderRadius.image),
                          minHeight: 400,
                        }}
                      >
                        <BundleListingHeader
                          listing={complete}
                          currentItem={currentItem}
                          canManage={canManage}
                        />
                        <CardContent
                          sx={{
                            width: "auto",
                            minHeight: 192,
                            padding: 3,
                          }}
                        >
                          {/* Bundle Purchase Area */}
                          {complete.status === "active" && (
                            <>
                              <Divider light />
                              <BundlePurchaseArea
                                listing={complete}
                                selectedVariants={selectedVariants}
                                bundleTotal={bundleTotal}
                                allVariantsSelected={allVariantsSelected}
                              />
                              <Divider light />
                            </>
                          )}

                          {/* Item Selector */}
                          <Box sx={{ paddingTop: 2 }}>
                            <Typography
                              variant={"subtitle1"}
                              fontWeight={"bold"}
                              color={"text.secondary"}
                            >
                              {t("MarketMultipleView.selectItem")}
                            </Typography>
                            <Select
                              sx={{ marginBottom: 1 }}
                              inputProps={{
                                "aria-label": t(
                                  "MarketMultipleView.selectItem",
                                ),
                              }}
                              onChange={(event) => {
                                const index = complete.items.findIndex(
                                  (item) => item.item_id === event.target.value,
                                )
                                if (index !== -1) {
                                  setSelectedItemIndex(index)
                                }
                              }}
                              value={currentItem.item_id}
                            >
                              {complete.items.map((item) => (
                                <MenuItem
                                  value={item.item_id}
                                  key={item.item_id}
                                >
                                  {item.game_item.name}
                                </MenuItem>
                              ))}
                            </Select>

                            {/* Current Item Details */}
                            <Box sx={{ marginTop: 2 }}>
                              <Typography
                                variant={"subtitle1"}
                                fontWeight={"bold"}
                                color={"text.secondary"}
                              >
                                {currentItem.game_item.name}
                              </Typography>

                              {/* Variant Selection for Current Item */}
                              {currentItem.variants.length > 1 && (
                                <Box sx={{ marginTop: 2, marginBottom: 2 }}>
                                  <Typography
                                    variant={"subtitle2"}
                                    color={"text.secondary"}
                                    sx={{ marginBottom: 1 }}
                                  >
                                    {t(
                                      "market.selectVariant",
                                      "Select Variant",
                                    )}
                                  </Typography>
                                  <VariantSelector
                                    variants={currentItem.variants}
                                    selectedVariantId={
                                      selectedVariants[currentItem.item_id]
                                    }
                                    onVariantChange={(variantId) =>
                                      handleVariantChange(
                                        currentItem.item_id,
                                        variantId,
                                      )
                                    }
                                  />
                                </Box>
                              )}

                              {/* Variant Details Table */}
                              <Box sx={{ marginTop: 2 }}>
                                <Typography
                                  variant={"subtitle2"}
                                  fontWeight={"bold"}
                                  color={"text.secondary"}
                                  sx={{ marginBottom: 1 }}
                                >
                                  {t(
                                    "market.availableVariants",
                                    "Available Variants",
                                  )}
                                </Typography>
                                <VariantDetailsTable
                                  variants={currentItem.variants}
                                />
                              </Box>
                            </Box>

                            {/* Bundle Description */}
                            <Typography
                              variant={"subtitle1"}
                              fontWeight={"bold"}
                              color={"text.secondary"}
                              sx={{ marginTop: 2 }}
                            >
                              {t("MarketMultipleView.description")}
                            </Typography>
                            <Typography variant={"body2"} component="div">
                              <MarkdownRender text={complete.description} />
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>

                  {/* Active Orders Section */}
                  {canManage && !!complete.orders?.length && (
                    <Section
                      disablePadding
                      xs={12}
                      title={t("MarketMultipleView.activeOrders")}
                      innerJustify={"flex-start"}
                    >
                      <Grid
                        item
                        xs={12}
                        sx={{
                          paddingTop: 2,
                          paddingBottom: 2,
                          boxSizing: "border-box",
                        }}
                      >
                        <OrderList
                          orders={complete.orders.filter((o) =>
                            isOrderOpen(o.status),
                          )}
                        />
                      </Grid>
                    </Section>
                  )}

                  {/* Previous Orders Section */}
                  {canManage && !!complete.orders?.length && (
                    <Section
                      disablePadding
                      xs={12}
                      title={t("MarketMultipleView.previousOrders")}
                      innerJustify={"flex-start"}
                    >
                      <Grid
                        item
                        xs={12}
                        sx={{
                          paddingTop: 2,
                          paddingBottom: 2,
                          boxSizing: "border-box",
                        }}
                      >
                        <OrderList
                          orders={complete.orders.filter(
                            (o) => !isOrderOpen(o.status),
                          )}
                        />
                      </Grid>
                    </Section>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
    </StandardPageLayout>
  )
}
