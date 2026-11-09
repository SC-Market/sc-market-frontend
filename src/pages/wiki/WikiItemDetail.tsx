/**
 * Wiki Item Detail
 *
 * Full stats and description, then "How to get it" (player listings,
 * missions, blueprints, in-game shops, resource info: ItemAcquisitionSection)
 * Task 8.10.3
 */

import { useState } from "react"
import {
  Box,
  Card,
  CardContent,
  Grid,
  Alert,
  Button,
  Stack,
  Tabs,
  Tab,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom"
import {
  useGetItemDetailQuery,
  useGetAcquisitionQuery,
} from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useCartDrawer } from "../../features/market/hooks/AddToCartContext"
import { WIKI_PATHS, MARKET_PATHS } from "../../routes/paths"
import { ItemAcquisitionSection } from "../../components/game-data/ItemAcquisitionSection"
import { AnswerLead } from "../../components/game-data/AnswerSummary"
import { buildItemSummary } from "../../util/answerContent"
import { FRONTEND_URL } from "../../util/constants"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { buildItemHead } from "../../seo/gameDataHeads"
import { headDescription } from "../../seo/pageHead"
import { SeoHead } from "../../seo/SeoHead"
import { usePageReady } from "../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../components/metadata/pageReadyStore"
import { WatchPriceButton } from "../../features/price-alerts/components/WatchPriceButton"
import {
  QuickListProvider,
  SellYoursButton,
} from "../../features/market/quick-list/SellYours"

import { useFormatters } from "../../util/format"
import { TagChip } from "../../components/tags/TagChip"
import { MarketPriceLine } from "../../features/game-data/market-price/MarketPriceLine"
import { useMarketPrices } from "../../features/game-data/market-price/useMarketPrices"
import {
  ItemCraftingTab,
  ItemDisassemblyTab,
  ItemOverviewTab,
} from "./WikiItemDetailTabs"
const TAB_OVERVIEW = 0
const TAB_CRAFTING = 1
const TAB_DISASSEMBLY = 2

export function WikiItemDetail() {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    data: item,
    isLoading,
    error,
    isFetching: pageIsFetching,
    currentData: pageCurrentData,
  } = useGetItemDetailQuery({ id: id! })
  // Primary content: drives main[data-ready].
  usePageReady(
    isPrimaryLoading({
      isLoading,
      isFetching: pageIsFetching,
      currentData: pageCurrentData,
    }),
  )
  const { openAddToCart } = useCartDrawer()

  // How to get it: player listings, missions, blueprints, in-game shops
  // and resource info in one document (takes the UUID or the short slug).
  const { data: acquisition } = useGetAcquisitionQuery(
    { id: id! },
    { skip: !id },
  )

  // "Lowest on SC Market": by UUID (the route param may be a short slug).
  const marketPrices = useMarketPrices(item ? [item.id] : [])

  const [tab, setTab] = useState(TAB_OVERVIEW)
  const [disassemblyQty, setDisassemblyQty] = useState(1)

  if (isLoading) {
    return (
      <StandardPageLayout
        title={t("wiki.itemDetail.title", "Item Details")}
        headerTitle={t("wiki.itemDetail.title", "Item Details")}
        sidebarOpen={true}
        maxWidth="md"
      >
        <Grid item xs={12}>
          <DetailPageSkeleton />
        </Grid>
      </StandardPageLayout>
    )
  }

  if (error || !item) {
    return (
      <StandardPageLayout
        title={t("wiki.itemDetail.title", "Item Details")}
        headerTitle={t("wiki.itemDetail.title", "Item Details")}
        sidebarOpen={true}
        maxWidth="md"
      >
        <Grid item xs={12}>
          <Alert severity="error">
            {t(
              "wiki.itemDetail.loadError",
              "Failed to load item details. Please try again.",
            )}
          </Alert>
        </Grid>
      </StandardPageLayout>
    )
  }

  const head = buildItemHead(item, FRONTEND_URL, acquisition)
  const seoTitle = head.title
  const seoDescription = headDescription(head)
  // Built from the resolved item, not the raw path param: this page is reachable
  // by full UUID or short slug, and the sitemap only lists the slug form.
  const canonicalPath = WIKI_PATHS.item(item.id, item.name)
  const answerSummary = buildItemSummary(item, t, fmt.locale)

  return (
    <StandardPageLayout
      title={seoTitle}
      description={seoDescription}
      canonicalUrl={canonicalPath}
      headerTitle={item.name}
      breadcrumbs={[
        {
          label: t("wiki.itemDetail.breadcrumbWiki", "Wiki"),
          href: WIKI_PATHS.hub,
        },
        {
          label: t("wiki.itemDetail.breadcrumbItems", "Items"),
          href: WIKI_PATHS.items,
        },
        { label: item.name },
      ]}
      sidebarOpen={true}
      maxWidth="md"
    >
      <SeoHead head={head} />
      <QuickListProvider
        item={{ id: item.id, name: item.name, type: item.type ?? null }}
      >
        <Grid item xs={12}>
          <AnswerLead summary={answerSummary} />
          <Grid container spacing={3}>
            {/* Main Info */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    {item.image_url && (
                      <Box
                        component="img"
                        src={item.image_url}
                        alt={item.name}
                        sx={{
                          width: 200,
                          height: 200,
                          objectFit: "contain",
                          bgcolor: "background.default",
                          borderRadius: 1,
                        }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mb: 2 }}
                        flexWrap="wrap"
                      >
                        {item.type && (
                          <TagChip
                            tag="category"
                            size="medium"
                            label={item.type}
                          />
                        )}
                        {item.size && (
                          <TagChip
                            tag="size"
                            size="medium"
                            label={`${t("wiki.itemDetail.size", "Size")} ${item.size}`}
                          />
                        )}
                        {item.grade && (
                          <TagChip
                            tag="tier"
                            size="medium"
                            label={`${t("wiki.itemDetail.grade", "Grade")} ${item.grade}`}
                          />
                        )}
                        {item.manufacturer && (
                          <TagChip
                            tag="manufacturer"
                            size="medium"
                            label={item.manufacturer_name ?? item.manufacturer}
                            clickable
                            onClick={() =>
                              navigate(
                                WIKI_PATHS.manufacturer(
                                  encodeURIComponent(item.manufacturer!),
                                ),
                              )
                            }
                          />
                        )}
                      </Stack>

                      <MarketPriceLine
                        price={marketPrices.get(item.id.toLowerCase())}
                        gameItemId={item.id}
                        itemName={item.name}
                        sx={{ mb: 1.5 }}
                      />

                      <Stack
                        direction="row"
                        gap={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mb: 2 }}
                      >
                        <WatchPriceButton
                          gameItemId={item.id}
                          itemName={item.name}
                          currentPrice={item.market_stats.min_price}
                          qualityRelevant={item.craftable_from.length > 0}
                        />
                        <SellYoursButton variant="contained" size="small" />
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {acquisition && (
                <ItemAcquisitionSection
                  doc={acquisition}
                  itemName={item.name}
                  onAddToCart={openAddToCart}
                  actions={
                    <>
                      <Button
                        component={RouterLink}
                        to={MARKET_PATHS.aggregate(item.id, item.name)}
                        variant="outlined"
                        color="neutral"
                        size="small"
                      >
                        {t("quickList.seeListings", "See listings")}
                      </Button>
                      <SellYoursButton variant="outlined" size="small" />
                    </>
                  }
                />
              )}

              {/* Tabs */}
              <Box
                sx={{ borderBottom: 1, borderColor: "divider", mt: 2, mb: 2 }}
              >
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                  <Tab label={t("wiki.itemDetail.tabOverview", "Overview")} />
                  <Tab
                    label={t("wiki.itemDetail.tabCrafting", "Crafting")}
                    disabled={item.craftable_from.length === 0}
                  />
                  <Tab
                    label={t("wiki.itemDetail.tabDisassembly", "Disassembly")}
                  />
                </Tabs>
              </Box>

              {/* Tab: Overview */}
              {tab === TAB_OVERVIEW && (
                <ItemOverviewTab item={item} gameItemId={id!} />
              )}

              {/* Tab: Crafting */}
              {tab === TAB_CRAFTING && <ItemCraftingTab item={item} />}

              {/* Tab: Disassembly */}
              {tab === TAB_DISASSEMBLY && (
                <ItemDisassemblyTab
                  item={item}
                  disassemblyQty={disassemblyQty}
                  setDisassemblyQty={setDisassemblyQty}
                />
              )}
            </Grid>
          </Grid>
        </Grid>
      </QuickListProvider>
    </StandardPageLayout>
  )
}
