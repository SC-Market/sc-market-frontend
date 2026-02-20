# Landing Page Skeleton Consistency Fix

## Problem

The landing page showed two different skeleton flashes during load:

1. Route-level skeleton (from `RouteSuspense`) with generic placeholders
2. Component-level skeletons (from individual components) with specific loading states

## Solution

### 1. Made Skeletons Consistent

Updated `LandingPageSkeleton.tsx` to use the same individual component skeletons that the actual components use:

- `LandingHeroSkeleton`
- `OrderStatisticsSkeleton`
- `RecentListingsSkeleton`
- `LandingFeaturesSkeleton`
- `LandingOrgFeaturesSkeleton`
- `SupportersSectionSkeleton`
- `FAQSectionSkeleton`

This ensures both skeleton layers look identical.

### 2. Added Loading States to Components

Updated components to show their skeletons while loading:

- `LandingHero.tsx` - Shows skeleton while fetching user profile
- `OrderStatistics.tsx` - Shows skeleton while fetching market stats
- `RecentListings.tsx` - Already had skeleton logic

### 3. Removed Lazy Loading for Landing Page

Changed `App.tsx` to directly import and render `LandingPage` instead of lazy loading it:

```typescript
// Before
lazy: async () => ({
  Component: (await import("./pages/home/LandingPage")).LandingPage,
})

// After
import { LandingPage } from "./pages/home/LandingPage"
element: <LandingPage />
```

## Result

- Landing page loads instantly without code-splitting delay
- If skeletons appear, they're consistent across both loading phases
- Core content (hero, features) renders immediately
- Only API-dependent sections show loading states
