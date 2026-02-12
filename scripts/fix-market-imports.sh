#!/bin/bash

# Script to replace barrel imports with direct imports for market feature

# Map of common imports to their direct paths
declare -A import_map=(
  # API
  ["useSearchMarketListingsQuery"]="features/market/api/marketApi"
  ["useGetMarketStatsQuery"]="features/market/api/marketApi"
  ["useSearchMarketQuery"]="features/market/api/marketApi"
  ["useGetMyListingsQuery"]="features/market/api/marketApi"
  ["useGetBuyOrderListingsQuery"]="features/market/api/marketApi"
  ["useRefreshMarketListingMutation"]="features/market/api/marketApi"
  ["marketApi"]="features/market/api/marketApi"
  
  # Hooks
  ["useMarketSearch"]="features/market/hooks/MarketSearch"
  ["useMarketSidebar"]="features/market/hooks/MarketSidebar"
  ["useMarketSidebarExp"]="features/market/hooks/MarketSidebar"
  ["MarketSidebarContext"]="features/market/hooks/MarketSidebar"
  ["useCurrentMarketItem"]="features/market/hooks/CurrentMarketItem"
  ["useCurrentMarketAggregate"]="features/market/hooks/CurrentMarketAggregate"
  
  # Components
  ["MarketPage"]="features/market/components/MarketPage"
  ["ItemMarketView"]="features/market/components/ItemMarketView"
  ["MarketSidebar"]="features/market/components/MarketSidebar"
  ["MarketListingForm"]="features/market/components/MarketListingForm"
  ["BuyOrderForm"]="features/market/components/BuyOrderForm"
  ["ItemStock"]="features/market/components/ItemStock"
  ["MarketActions"]="features/market/components/MarketActions"
  
  # Listings
  ["ItemListings"]="features/market/listings/components/ItemListings"
  ["DisplayListingsHorizontal"]="features/market/listings/components/ItemListings"
  ["DisplayListings"]="features/market/listings/components/ItemListings"
  ["DisplayListingsMin"]="features/market/listings/components/ItemListings"
  ["MyItemListings"]="features/market/listings/components/ItemListings"
  ["AllItemListings"]="features/market/listings/components/ItemListings"
  ["BuyOrders"]="features/market/listings/components/ItemListings"
  
  # Types - keep in barrel for now as they're lightweight
)

echo "This is a reference map. Manual updates recommended for accuracy."
echo "Use direct imports like:"
echo "  import { useMarketSearch } from '../../features/market/hooks/MarketSearch'"
