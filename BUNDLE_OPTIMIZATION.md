# Bundle Size Optimization - Market Feature

## ✅ Completed

### 1. Added Deprecation Notice
- Added warning to `/features/market/index.ts` barrel export
- Documented preferred import paths for developers

### 2. Updated High-Impact Files (Direct Imports)
The following files now use direct imports instead of barrel exports:

- ✅ `src/pages/home/LandingPage.tsx` - API hooks
- ✅ `src/views/market/MarketListingView.tsx` - Hooks, components, API
- ✅ `src/pages/market/MarketCart.tsx` - API hooks
- ✅ `src/pages/market/ViewMarketListing.tsx` - Context, API hooks
- ✅ `src/pages/market/ViewMarketAggregate.tsx` - Context, components, API
- ✅ `src/pages/market/MyMarketListings.tsx` - Components, context

## 📋 Remaining Work

### Files Still Using Barrel Imports (30 files)
Run this command to find them:
```bash
grep -r "from \".*features/market\"" src --include="*.tsx" --include="*.ts" | grep -v "node_modules" | cut -d: -f1 | sort -u
```

Priority files to update:
1. `src/views/market/MarketAggregateView.tsx` (1,077 lines)
2. `src/views/market/MarketMultipleView.tsx`
3. `src/pages/market/CreateBuyOrder.tsx`
4. `src/pages/market/ManageStock.tsx`
5. `src/components/ads/AdCard.tsx`

### Import Path Reference

**API Hooks:**
```typescript
import { useSearchMarketListingsQuery } from "../../features/market/api/marketApi"
import { useGetMarketStatsQuery } from "../../features/market/api/marketApi"
```

**Hooks:**
```typescript
import { useMarketSearch } from "../../features/market/hooks/MarketSearch"
import { useMarketSidebar } from "../../features/market/hooks/MarketSidebar"
import { useCurrentMarketListing } from "../../features/market/hooks/CurrentMarketItem"
```

**Components:**
```typescript
import { MarketSidebar } from "../../features/market/components/MarketSidebar"
import { MarketActions } from "../../features/market/components/MarketActions"
import { Bids } from "../../features/market/components/Bids"
```

**Listings:**
```typescript
import { ItemListings } from "../../features/market/listings/components/ItemListings"
import { DisplayListingsHorizontal } from "../../features/market/listings/components/ItemListings"
```

**Types (can still use barrel):**
```typescript
import { UniqueListing, MarketListing } from "../../features/market"
```

## 🎯 Expected Impact

- **Current:** ~6 files updated (20% of imports)
- **When complete:** 30-40% reduction in initial bundle size
- **Types:** Keep in barrel (no runtime cost)

## 🔧 Next Steps

1. Update remaining 24 files with barrel imports
2. Consider splitting `ItemListings.tsx` (1,142 lines) into separate files
3. Run bundle analysis to measure actual impact
4. Update ESLint rules to warn on barrel imports (optional)

## 📊 Verification

```bash
# Type check
npm run check

# Build
npm run build

# Analyze bundle
ANALYZE_BUNDLE=true npm run build
```
