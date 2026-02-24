# Market API v2 Migration - Component List

This document lists all frontend components that use the v1 market API and need to be migrated to v2.

## Components Using Market API

### 1. SelectMarketListing.tsx

**Location**: `src/components/select/SelectMarketListing.tsx`
**API Usage**:

- `useSearchMarketListingsQuery` - Searches for market listings filtered by contractor

### 2. RecentListings.tsx

**Location**: `src/components/landing/RecentListings.tsx`
**API Usage**:

- `useSearchMarketListingsQuery` - Fetches recent listings for landing page

### 3. useStockManagement.ts (Hook)

**Location**: `src/features/market/stock/hooks/useStockManagement.ts`
**API Usage**:

- `useCreateMarketListingMutation` - Creates new market listings
- `useUpdateListingQuantityMutation` - Updates listing quantities
- `useMarketRefreshListingMutation` - Refreshes listing expiration
- `useUpdateMarketListingMutation` - Updates listing details

### 4. MarketMultipleEditView.tsx

**Location**: `src/features/market/components/MarketMultipleEditView.tsx`
**API Usage**:

- `useSearchMarketListingsQuery` - Fetches current listings for editing

### 5. ItemListings.tsx

**Location**: `src/features/market/listings/components/ItemListings.tsx`
**API Usage**:

- `useSearchMarketListingsQuery` - Main search functionality (used multiple times)
- `useRefreshMarketListingMutation` - Refreshes listings

### 6. MarketListingForm.tsx

**Location**: `src/features/market/components/MarketListingForm.tsx`
**API Usage**:

- `useCreateMarketListingMutation` - Creates new listings
- `useMarketUploadListingPhotosMutation` - Uploads photos

### 7. AllStockLotsGrid.tsx

**Location**: `src/features/market/components/stock/AllStockLotsGrid.tsx`
**API Usage**:

- `useSearchMarketListingsQuery` - Searches listings for stock management

### 8. ItemStock.tsx

**Location**: `src/features/market/components/ItemStock.tsx`
**API Usage**:

- `useCreateMarketListingMutation` - Creates listings from stock

## API Hooks Used (v1)

The following v1 hooks are used across these components:

1. **useSearchMarketListingsQuery** - Most commonly used (8 instances)
2. **useCreateMarketListingMutation** - Used for creating listings (4 instances)
3. **useUpdateListingQuantityMutation** - Updates quantities
4. **useMarketRefreshListingMutation** - Refreshes expiration
5. **useUpdateMarketListingMutation** - Updates listing details
6. **useMarketUploadListingPhotosMutation** - Uploads photos
7. **useGetMyListingsQuery** - Fetches user's listings
8. **useGetMarketListingQuery** - Fetches single listing details

## v2 API Hooks Available

The v2 API provides the following hooks:

1. **useSearchListingsQuery** - Replaces `useSearchMarketListingsQuery`
2. **useCreateListingMutation** - Replaces `useCreateMarketListingMutation`
3. **useGetListingDetailsQuery** - Replaces `useGetApiMarketListingsByListingIdQuery`
4. **useUpdateListingMutation** - Replaces `useUpdateMarketListingMutation`
5. **useDeleteListingMutation** - New in v2

## Migration Strategy

### Phase 1: Core Search Components

1. ItemListings.tsx (main search view)
2. RecentListings.tsx (landing page)
3. SelectMarketListing.tsx (selector component)

### Phase 2: Listing Management

4. MarketListingForm.tsx (create listings)
5. MarketMultipleEditView.tsx (bulk edit)
6. useStockManagement.ts (stock management hook)

### Phase 3: Stock Integration

7. AllStockLotsGrid.tsx (stock grid)
8. ItemStock.tsx (item stock view)

## Notes

- The v2 API uses different parameter names (camelCase vs snake_case)
- Response structures may differ slightly
- Need to verify all TypeScript types work correctly
- Some v1 hooks may not have direct v2 equivalents yet (e.g., refresh, upload photos)
