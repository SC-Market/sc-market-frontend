import { useMemo } from "react"
import { FRONTEND_URL } from "../../../util/constants"
import { useParams } from "react-router-dom"
import { MARKET_PATHS } from "../../../routes/paths"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { MarketAggregateContentSkeleton } from "../../../components/skeletons/MarketListingDetailSkeleton"
import { SeoHead } from "../../../seo/SeoHead"
import { buildAggregateHead } from "../../../seo/entityHeads"
import { headDescription } from "../../../seo/pageHead"
import { useTranslation } from "react-i18next"
import { MarketAggregateViewV2Admin } from "./MarketAggregateViewV2Admin"
import {
  useGetListingsQuery,
  useGetQualityDistributionQuery,
  useGetPriceHistoryQuery,
  useSearchBuyOrdersQuery,
} from "../../../store/api/v2/market"
import type {
  AggregateListingV2Row,
  GameItemAggregateV2,
} from "./aggregateV2Types"

/**
 * MarketAggregateViewV2 Component
 *
 * Task: 11.5 Implement MarketAggregateViewV2 component
 * Requirements: 41.1-41.12
 *
 * Displays aggregate view of all listings for a game item with quality tier breakdown.
 * Maintains visual parity with V1 MarketAggregateView while adding V2-specific features:
 * - Quality distribution chart
 * - Price comparison table by quality tier
 * - Quality tier filter
 * - Seller ratings and badges
 * - Add to Cart for each listing with variant selection
 *
 * Visual Parity Requirements:
 * - Reuse image paper styling (minHeight: 400, borderRadius)
 * - Reuse Card layout for item details
 * - Reuse PaginatedTable for listings
 * - Reuse HeaderTitle for sections
 * - Reuse Section for charts
 * - Maintain identical typography and spacing
 *
 * V2 Enhancements:
 * - Display quality distribution histogram
 * - Show price ranges by quality tier
 * - Filter listings by quality tier
 * - Display variant information in listings
 * - Support variant selection in Add to Cart
 */
export function MarketAggregateViewV2() {
  const { t } = useTranslation()
  const { id: gameItemId } = useParams<{ id: string }>()

  const {
    data: listingsData,
    isLoading: listingsLoading,
    error: listingsError,
  } = useGetListingsQuery({ id: gameItemId! }, { skip: !gameItemId })
  const { data: qualityData } = useGetQualityDistributionQuery(
    { gameItemId: gameItemId! },
    { skip: !gameItemId },
  )
  const { data: priceData } = useGetPriceHistoryQuery(
    { gameItemId: gameItemId! },
    { skip: !gameItemId },
  )
  const { data: buyOrdersData } = useSearchBuyOrdersQuery(
    { gameItemId: gameItemId! },
    { skip: !gameItemId },
  )

  const isLoading = listingsLoading
  const error = listingsError

  const complete: GameItemAggregateV2 = useMemo(
    () => ({
      game_item: listingsData?.game_item
        ? {
            ...listingsData.game_item,
            description: "",
            image_url: listingsData.game_item.image_url || "",
          }
        : {
            id: gameItemId || "",
            name: "",
            type: "",
            description: "",
            image_url: "",
          },
      quality_distribution: (qualityData?.distribution || []).map((d) => ({
        quality_tier: d.quality_tier,
        listing_count: d.listing_count,
        total_quantity: d.quantity_available,
        min_price: d.min_price,
        avg_price: d.avg_price,
        max_price: d.max_price,
        shop_count: d.shop_count,
      })),
      listings: (listingsData?.listings || []).map(
        (l): AggregateListingV2Row => ({
          listing_id: l.listing_id,
          shop_id: l.shop_id,
          shop_slug: l.shop_slug,
          shop_name: l.shop_name,
          shop_rating: l.shop_rating,
          price_min: l.price,
          price_max: l.price,
          quantity_available: l.quantity_available,
          quality_tier_min: l.quality_tier ?? null,
          quality_tier_max: l.quality_tier ?? null,
          variant_count: 1,
        }),
      ),
      buy_orders: buyOrdersData?.buy_orders || [],
      price_history: (priceData?.data || []).map((p) => ({
        timestamp: p.timestamp,
        quality_tier: p.quality_tier ?? null,
        avg_price: p.avg_price,
        min_price: p.min_price,
        max_price: p.max_price,
        volume: p.volume,
      })),
    }),
    [listingsData, qualityData, priceData, buyOrdersData, gameItemId],
  )

  const { game_item } = complete
  // The bridge's head (title, description): the layout uses the same, so
  // the page doesn't change them after hydrating.
  const head = game_item.name
    ? buildAggregateHead(game_item, complete.listings.length, FRONTEND_URL)
    : null

  return (
    <StandardPageLayout
      title={head?.title ?? t("marketV2.marketItem")}
      description={head ? headDescription(head) : undefined}
      headerTitle={game_item.name}
      breadcrumbs={[
        {
          label: t("sidebar.market_short", "Market"),
          href: MARKET_PATHS.search,
        },
        ...(game_item.type && game_item.type !== "Other"
          ? [
              {
                label: game_item.type,
                href: `/market?type=${encodeURIComponent(game_item.type)}`,
              },
            ]
          : []),
        { label: game_item.name || "Item" },
      ]}
      isLoading={isLoading}
      skeleton={<MarketAggregateContentSkeleton />}
      error={error}
      sidebarOpen={true}
      maxWidth="xl"
    >
      {head && <SeoHead head={head} />}
      <MarketAggregateViewV2Admin
        complete={complete}
        gameItemId={gameItemId!}
      />
    </StandardPageLayout>
  )
}
