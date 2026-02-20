# Component Prefetching Implementation

## Overview

Implemented comprehensive prefetching for lazy-loaded components across the application, ensuring tab components and related views are ready before users navigate to them.

## What Was Added

### 1. Component Prefetch System (`src/router/componentPrefetch.ts`)

A new module that manages prefetching of lazy-loaded components within pages:

- **Component Registry**: Maps component identifiers to their import functions
- **Component Prefetch Map**: Defines which components to prefetch for each route
- **Automatic Prefetching**: Uses `requestIdleCallback` for non-blocking prefetch during idle time
- **Caching**: Tracks prefetched components to avoid duplicate loads

### 2. Enhanced Route Prefetch Configuration (`src/types/routes.ts`)

Extended the existing `ROUTE_PREFETCH_MAP` with comprehensive mappings:

- Contract/Order detail pages → Related pages
- User profiles → Tab variants
- Contractor/Org pages → Tab variants
- Dashboard → Common next actions
- Settings → Related pages
- Market management → Related pages
- Admin pages → Related admin pages

### 3. Updated Route Prefetch Hook (`src/hooks/router/useRoutePrefetch.ts`)

Enhanced to prefetch both routes AND components when navigating.

## Pages with Prefetched Components

### Pages with Route-Based Tabs

- `/contract/:id` and `/order/:id` - All order detail tabs
- `/user/:username` - Profile tabs
- `/contractor/:id` - Organization tabs
- `/profile` - My profile tabs

### Pages with Internal Tabs (Not Route-Based)

- `/offer/:id` - Offer detail tabs (details, messages, service, availability)
- `/market` - Market tabs (items, services, actions)
- `/contracts` - Contract tabs (items, services, actions)
- `/market/create` - Listing creation tabs
- `/market/me` - My listings tabs (active, inactive, archived)
- `/settings` - Settings sections
- `/org/manage` - Org management tabs
- `/org/fleet` and `/myfleet` - Fleet tabs (ships, deliveries)
- `/admin/orders` - Admin order analytics tabs

## How It Works

1. **On Route Change**: The `useRoutePrefetch` hook detects navigation
2. **Route Prefetch**: Prefetches related route modules based on `ROUTE_PREFETCH_MAP`
3. **Component Prefetch**: Prefetches lazy-loaded components based on `COMPONENT_PREFETCH_MAP`
4. **Idle Time Execution**: Uses `requestIdleCallback` to avoid blocking the main thread
5. **Caching**: Tracks what's been prefetched to avoid redundant loads

## Benefits

- **Faster Tab Switching**: Tab components are already loaded when users click them
- **Better UX**: Reduced loading spinners and delays
- **Smart Loading**: Only prefetches when browser is idle
- **No Performance Impact**: Non-blocking prefetch doesn't affect current page performance
- **Comprehensive Coverage**: Handles both route-based and internal tabs

## Technical Details

### Component Registry Structure

```typescript
export const componentRegistry: Record<string, ComponentImportFunction> = {
  "order:details": () => import("../views/orders/OrderDetailsArea"),
  "offer:service": () => import("../views/offers/OfferServiceArea"),
  // ... etc
}
```

### Prefetch Map Structure

```typescript
export const COMPONENT_PREFETCH_MAP: Record<string, string[]> = {
  "/order/:id": [
    "order:details",
    "order:messages",
    "order:review",
    // ... etc
  ],
}
```

### Pattern Matching

The system uses regex to match dynamic route segments (`:id`, `:username`, etc.) to determine which components to prefetch.

## Files Modified

1. `src/router/componentPrefetch.ts` - New file
2. `src/types/routes.ts` - Enhanced route prefetch map
3. `src/hooks/router/useRoutePrefetch.ts` - Added component prefetching
4. `src/pages/authentication/__tests__/LoginPage.test.tsx` - Fixed type error

## Build Status

✅ Build passes successfully
✅ TypeScript checks pass
✅ All prefetch paths verified to exist
