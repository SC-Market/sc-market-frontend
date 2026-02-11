# LandingPage Import Strategy Fix

## Problem

The `LandingPage` component was causing circular dependency issues because:

1. `LandingPage.tsx` is dynamically imported (lazy-loaded) in the router
2. Other components (`ItemListings.tsx`, `DiscordBotDetails.tsx`) were statically importing shared components from `LandingPage.tsx`
3. This created a situation where the lazy-loaded module was being pulled into the main bundle through static imports, defeating the purpose of code splitting

## Solution

Extracted shared components that were being imported by other files into a dedicated location:

### Extracted Components

1. **RecentListingsSkeleton** - Skeleton loader for recent listings display
   - Location: `src/components/landing/RecentListingsSkeleton.tsx`
   - Used by: `ItemListings.tsx`, `LandingPage.tsx`

2. **FAQQuestion** - Collapsible FAQ question component
   - Location: `src/components/landing/FAQQuestion.tsx`
   - Used by: `DiscordBotDetails.tsx`, `LandingPage.tsx`

### Import Strategy

**Before:**
```typescript
// ❌ Static import from lazy-loaded module
import { RecentListingsSkeleton } from "../../../../pages/home/LandingPage"
```

**After:**
```typescript
// ✅ Static import from dedicated component location
import { RecentListingsSkeleton } from "../../../../components/landing"
```

## Benefits

1. **Proper Code Splitting**: LandingPage remains fully lazy-loaded without being pulled into the main bundle
2. **No Circular Dependencies**: Shared components are in a neutral location that doesn't create circular imports
3. **Better Organization**: Reusable components are in the components directory where they belong
4. **Improved Performance**: Main bundle size is reduced by keeping LandingPage code out of the initial load

## Files Modified

- `src/components/landing/RecentListingsSkeleton.tsx` (created)
- `src/components/landing/FAQQuestion.tsx` (created)
- `src/components/landing/index.ts` (created)
- `src/pages/home/LandingPage.tsx` (removed duplicate exports, added imports)
- `src/features/market/listings/components/ItemListings.tsx` (updated import)
- `src/views/settings/DiscordBotDetails.tsx` (updated import)

## Verification

To verify no static imports remain from LandingPage:

```bash
# Should return no results
grep -r "from.*pages/home/LandingPage" src/
```

## Related Requirements

This fix addresses requirement 6.7 from the Core Web Vitals Optimization spec:
- Ensure consistent dynamic import usage to prevent duplicate code
- Verify no static imports of lazy-loaded modules
