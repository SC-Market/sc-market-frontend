# Route-Specific Skeleton Loading

## Problem

Users were seeing a flash of an unrelated skeleton when navigating between pages. This was caused by a single global `<PageSkeleton />` being used as the Suspense fallback for all routes, regardless of the actual page structure.

## Solution

Implemented route-specific skeleton loading to prevent Cumulative Layout Shift (CLS):

### 1. Route-to-Skeleton Mapping (`src/router/routeSkeletons.tsx`)

- Maps each route path to its appropriate skeleton component
- Supports parameterized routes (`:id`, `:tab`, etc.)
- Falls back to generic `PageSkeleton` for unmapped routes

### 2. Smart Suspense Wrapper (`src/components/router/RouteSuspense.tsx`)

- Reads current route from `useLocation()`
- Dynamically selects the matching skeleton component
- Wraps children in Suspense with the route-specific fallback

### 3. Updated App.tsx

- Replaced global `<Suspense fallback={<PageSkeleton />}>` with `<RouteSuspense>`
- Skeleton components are NOT lazy-loaded (synchronously available)
- Only page content is lazy-loaded

## Benefits

- **No CLS**: Skeleton structure matches the loading page
- **Better UX**: Users see relevant loading states
- **Maintainable**: Easy to add new route-skeleton mappings
- **Performance**: Skeletons load instantly (not code-split)

## Adding New Routes

When adding a new route, update `routeSkeletonMap` in `src/router/routeSkeletons.tsx`:

```tsx
export const routeSkeletonMap: Record<string, React.ComponentType> = {
  // ... existing mappings
  "/new-route": FormPageSkeleton, // Choose appropriate skeleton
  "/new-route/:id": DetailPageSkeleton,
}
```

## Available Skeleton Components

- `PageSkeleton` - Generic page (default)
- `MarketPageSkeleton` - Market listings with filters
- `DashboardSkeleton` - Dashboard with cards/stats
- `ProfileSkeleton` - Profile with avatar/tabs
- `ListPageSkeleton` - Table/list view
- `DetailPageSkeleton` - Detail view with sidebar
- `FormPageSkeleton` - Form with fields
- `AdminPageSkeleton` - Admin with sidebar
- `MessageListSkeleton` - Messaging interface
- `OrderDetailSkeleton` - Order details
- `ContractDetailSkeleton` - Contract details
- `RecruitingPostViewSkeleton` - Recruiting post
- `OfferDetailSkeleton` - Offer details

## Matching the page (no layout shift)

A skeleton is built from the shape it stands in for, so it can't drift:

- **Frame.** The generic route skeletons (`RouteSkeleton.tsx`) sit in StandardPageLayout's frame: `ContainerGrid` and the real title row (`PageHeaderRowSkeleton`), with the page's sections as grid items. Admin pages have no extra sidebar (the app's is the only one); form pages use FormPageLayout's `lg` width.
- **Cards.** `ListingSkeleton` is ListingCardV2's pieces (ListingWrapper, `listingCardActionAreaSx`, a Card of `LISTING_CARD_HEIGHT`, the 180px photo in light mode, the card's Typography for each line). `ServiceListingSkeleton` uses `SERVICE_LISTING_GRID_BREAKPOINTS` and `SERVICE_CARD_HEIGHT`. The game-data pages lay out their cards with a shape from `components/game-data/cardGrids.ts` and pass the same shape to `CardGridSkeleton`.
- **DataGrids.** `LazyDataGrid` shows `DataGridSkeleton` with `dataGridSkeletonProps(props)` (visible columns, first page of rows, density, footer) while the grid's chunk loads; autoHeight grids get their exact height.
- **Motion.** The theme's `MuiSkeleton` override stops the pulse and wave under `prefers-reduced-motion: reduce`. Skeletons don't fade in (a fade from 0 blanks the page between boundaries). Widths are fixed, never random, so the prerendered HTML and the client agree.

`src/router/__tests__/skeletonFamilies.test.tsx` renders every family and checks it against those shapes.
