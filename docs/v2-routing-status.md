# Market V2 Routing Status

## Current Implementation

The V2 routing infrastructure has been created with the following components:

### Files Created/Updated

1. **`src/features/market/v2/MarketV2Routes.tsx`** - V2 routing component
2. **`src/components/market/v2/MarketPageV2.tsx`** - V2 page wrapper with routing

### What Works Now

- **Feature flag switching**: The `MarketRouter` correctly switches between V1 and V2 based on the feature flag
- **Main listing search**: When V2 is enabled, users visiting `/market` see `ListingSearchV2` with quality tier filtering
- **V2 components**: All V2 components exist and are properly exported:
  - ListingSearchV2
  - ListingDetailV2
  - CreateListingV2
  - EditListingV2
  - MyListingsV2
  - StockManagerV2
  - BulkStockManagementV2
  - MarketCartV2
  - OrderListV2
  - OrderDetailsAreaV2
  - BuyOrdersViewV2
  - GameItemListingsV2
  - MarketAggregateViewV2
  - MarketMultipleViewV2
  - ContractorListingsV2

## Current Limitation

**Only the base `/market` route goes through `MarketRouter`**. Other market routes in `App.tsx` are hardcoded to V1 components:

```typescript
// These routes bypass MarketRouter and go directly to V1:
/market/:id              → ViewMarketListing (V1)
/market/create           → MarketCreate (V1)
/market/cart             → MarketCart (V1)
/market/me               → MyMarketListings (V1)
/market/manage           → ManageStock (V1)
/market/manage-stock     → ManageStockLots (V1)
/market/aggregate/:id    → ViewMarketAggregate (V1)
/market/multiple/:id     → ViewMarketMultiple (V1)
// ... and more
```

This means:
- ✅ V2 users see the main listing search with quality tiers
- ❌ V2 users clicking on a listing still see V1 detail page
- ❌ V2 users clicking "Create Listing" still see V1 form
- ❌ V2 users accessing cart still see V1 cart

## Solution: Full V2 Routing

To enable full V2 routing, we need to update `App.tsx` to route ALL market paths through `MarketRouter`. Here's the approach:

### Option 1: Nested Routes (Recommended)

Update `App.tsx` to use nested routing:

```typescript
{
  path: "/market",
  errorElement: <RouteErrorFallback />,
  lazy: async () => ({
    Component: (await import("./components/market/MarketRouter")).MarketRouter,
  }),
  children: [
    // All market routes become children
    { path: ":id", element: <MarketListingRouter /> },
    { path: "create", element: <MarketCreateRouter /> },
    { path: "cart", element: <MarketCartRouter /> },
    // ... etc
  ]
}
```

Then create router components for each route that switch between V1/V2:

```typescript
// MarketListingRouter.tsx
export function MarketListingRouter() {
  const { marketVersion } = useFeatureFlag()
  return marketVersion === "V2" 
    ? <ListingDetailV2 /> 
    : <ViewMarketListing />
}
```

### Option 2: Update MarketV2Routes (Simpler)

Expand `MarketV2Routes.tsx` to handle all nested routes:

```typescript
export function MarketV2Routes() {
  return (
    <Routes>
      <Route index element={<ListingSearchV2 />} />
      <Route path=":id" element={<ListingDetailV2 />} />
      <Route path="create" element={<CreateListingV2 />} />
      <Route path="cart" element={<MarketCartV2 />} />
      <Route path="me" element={<MyListingsV2 />} />
      <Route path="manage-stock" element={<StockManagerV2 />} />
      <Route path="aggregate/:id" element={<MarketAggregateViewV2 />} />
      <Route path="multiple/:id" element={<MarketMultipleViewV2 />} />
      // ... etc
    </Routes>
  )
}
```

And update V1 `MarketPage` to also use React Router routes instead of tabs/conditional rendering.

Then update `App.tsx` to remove the hardcoded routes and let `MarketRouter` handle everything.

## Testing V2 Routing

Currently, to test V2:

1. Enable V2 feature flag (via DebugPanel or API)
2. Visit `/market` - you'll see ListingSearchV2 with quality tier filters
3. Click on a listing - you'll see V1 detail page (limitation)

After implementing full routing:

1. Enable V2 feature flag
2. Visit `/market` - see ListingSearchV2
3. Click on a listing - see ListingDetailV2 with variant breakdown
4. Click "Create Listing" - see CreateListingV2 with quality tier inputs
5. All market features use V2 components

## Next Steps

1. **Decide on routing approach** (Option 1 or Option 2)
2. **Update App.tsx** to route all market paths through MarketRouter
3. **Implement nested routing** in MarketV2Routes
4. **Update V1 MarketPage** to use React Router (if using Option 2)
5. **Test all V2 routes** work correctly
6. **Update tests** to reflect new routing structure

## Files to Modify

- `src/App.tsx` - Remove hardcoded market routes
- `src/features/market/v2/MarketV2Routes.tsx` - Add all nested routes
- `src/features/market/components/MarketPage.tsx` - Potentially refactor to use React Router
- Tests for all V2 components - Update route paths if needed
