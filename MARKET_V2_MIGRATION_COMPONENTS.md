# Market API v2 Migration - Component List

## Overview

This document lists all frontend components that use the v1 market API and need to be migrated to v2.

## Components Using Market API

### 1. Market Listings Search/Display Components

#### `src/features/market/listings/components/ItemListings.tsx`

- **Hooks Used**: `useSearchMarketListingsQuery`
- **Usage**: Multiple instances for searching and displaying market listings
- **Priority**: HIGH (core functionality)

#### `src/components/landing/RecentListings.tsx`

- **Hooks Used**: `useSearchMarketListingsQuery`
- **Usage**: Displays recent listings on landing page
- **Priority**: HIGH (public-facing)

#### `src/features/market/components/MarketMultipleEditView.tsx`

- **Hooks Used**: `useSearchMarketListingsQuery`
- **Usage**: Searches for contractor listings for editing
- **Priority**: MEDIUM

#### `src/components/select/SelectMarketListing.tsx`

- **Hooks Used**: `useSearchMarketListingsQuery`
- **Usage**: Dropdown selector for market listings
- **Priority**: MEDIUM

#### `src/features/market/components/stock/AllStockLotsGrid.tsx`

- **Hooks Used**: `useSearchMarketListingsQuery`
- **Usage**: Searches listings for stock lot management
- **Priority**: MEDIUM

### 2. Market Listing Creation Components

#### `src/features/market/components/MarketListingForm.tsx`

- **Hooks Used**: `useCreateMarketListingMutation`
- **Usage**: Form for creating new market listings
- **Priority**: HIGH (core functionality)

#### `src/features/market/components/ItemStock.tsx`

- **Hooks Used**: `useCreateMarketListingMutation`
- **Usage**: Creates listings from stock items
- **Priority**: MEDIUM

#### `src/features/market/stock/hooks/useStockManagement.ts`

- **Hooks Used**: `useCreateMarketListingMutation`
- **Usage**: Hook for managing stock and creating listings
- **Priority**: MEDIUM

### 3. API Re-exports

#### `src/features/market/api/marketApi.ts`

- **Type**: Re-export module
- **Usage**: Central export point for market API hooks
- **Priority**: HIGH (affects all imports)
- **Note**: This file re-exports hooks from the generated API

#### `src/features/market/index.ts`

- **Type**: Re-export module
- **Usage**: Feature-level export point
- **Priority**: HIGH (affects all imports)

## Migration Strategy

### Phase 1: Update API Re-exports

1. Update `src/features/market/api/marketApi.ts` to import from v2
2. Update `src/features/market/index.ts` to export v2 hooks

### Phase 2: Migrate High-Priority Components

1. `ItemListings.tsx` - Core listing display
2. `RecentListings.tsx` - Landing page
3. `MarketListingForm.tsx` - Listing creation

### Phase 3: Migrate Medium-Priority Components

1. `MarketMultipleEditView.tsx`
2. `SelectMarketListing.tsx`
3. `AllStockLotsGrid.tsx`
4. `ItemStock.tsx`
5. `useStockManagement.ts`

## V1 vs V2 Hook Mapping

### Query Hooks

- `useSearchMarketListingsQuery` → `useGetListingsQuery` (v2)
  - **Note**: v2 uses different parameter names (camelCase vs snake_case)
  - **Note**: v2 returns wrapped response: `{ data: { listings, total, limit, offset } }`

### Mutation Hooks

- `useCreateMarketListingMutation` → `useCreateListingMutation` (v2)
  - **Note**: v2 uses different request body structure
  - **Note**: v2 returns wrapped response: `{ data: ListingResponse }`

## Key Differences Between V1 and V2

### 1. Response Wrapping

- **V1**: Returns data directly
- **V2**: Wraps all responses in `{ data: T }` envelope

### 2. Parameter Naming

- **V1**: Uses snake_case (e.g., `game_item_id`, `user_seller`)
- **V2**: Uses camelCase (e.g., `gameItemId`, `userSellerId`)

### 3. Endpoint Paths

- **V1**: `/api/market/listings`
- **V2**: `/v2/market/listings`

### 4. Type Safety

- **V1**: Hand-written types
- **V2**: Auto-generated types from OpenAPI spec

## Testing Checklist

For each migrated component:

- [ ] Component renders without errors
- [ ] Data fetching works correctly
- [ ] Loading states display properly
- [ ] Error states display properly
- [ ] User interactions work as expected
- [ ] TypeScript types are correct
- [ ] No console errors or warnings

## Notes

- The v2 API uses consistent response wrapping, so components may need to adjust how they access data
- Parameter names have changed from snake_case to camelCase
- All v2 hooks are auto-generated from the OpenAPI spec
- The v2 API provides better type safety through auto-generated types
