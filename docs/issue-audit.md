# Issue Audit — SC Market Frontend

## Issue 1: Bottom Sheet Scroll

### Files
- `src/components/mobile/BottomSheet.tsx`

### Current Code
The `SwipeableDrawer` from MUI is used with a custom drag-to-resize/close system on the **puller handle only** (lines 130–145). However, the `SwipeableDrawer` itself has its own built-in swipe-to-close gesture that fires on **any** downward swipe inside the drawer — including when the user scrolls up inside the content area.

The content area (line 196) is a simple `<Box>` with `overflowY: "auto"`:
```tsx
<Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", px: 2, py: 2, minHeight: 0 }}>
  {children}
</Box>
```

There is no mechanism to detect whether the content is scrolled to the top before allowing the swipe-to-close gesture.

### What Needs to Change
1. Add a `ref` to the content `<Box>` and track its `scrollTop`.
2. Pass `SwipeableDrawer`'s `SwipeAreaProps` or use the `onTouchStart`/`onTouchMove` on the content area to conditionally prevent the close gesture.
3. Only allow swipe-to-close when `contentRef.current.scrollTop === 0` (content is scrolled to top).
4. One approach: set `disableDiscovery={true}` and `disableSwipeToOpen={true}` (already set) on the `SwipeableDrawer`, and add a custom touch handler on the content area that only calls `onClose` when scrolled to top and swiping down. Alternatively, intercept touch events on the content `<Box>` and call `e.stopPropagation()` when `scrollTop > 0` to prevent the drawer from capturing the swipe.

---

## Issue 2: Filter FAB on Org/User Detail Pages

### Files
- `src/features/profile/components/ProfileStoreView.tsx` — uses `MarketSideBarToggleButton` (a `<Button>`, not a FAB)
- `src/features/profile/components/ProfileServicesView.tsx` — uses a plain `<Button>` with `FilterListIcon` (not a FAB)
- `src/features/contractor/components/OrgTabContent.tsx` — imports `OrgStoreView` from ProfileStoreView (same toggle button)
- `src/components/mobile/FiltersFAB.tsx` — the proper FAB component used on the market page
- `src/components/mobile/ContextAwareFAB.tsx` — general-purpose FAB, does NOT handle filter toggling for profile/org pages
- `src/features/market/components/MarketPage.tsx` — uses `<FiltersFAB>` correctly
- `src/features/market/components/MarketSidebar.tsx` — exports `MarketSideBarToggleButton` (line 459)

### Current State
**Market page** uses the proper `FiltersFAB` component (a `<Fab color="primary">` with `<FilterList />` icon, fixed position bottom-right):
```tsx
// MarketPage.tsx line 110
<FiltersFAB onClick={() => setMarketSidebarOpen((prev) => !prev)} label={t("market.toggleSidebar")} />
```

**Profile/Org store pages** use `MarketSideBarToggleButton` which renders a **rectangular outlined `<Button>`**, not a FAB:
```tsx
// MarketSidebar.tsx line 459
<Button variant="outlined" color="secondary" startIcon={<FilterListIcon />} ...>
  {t("market.filters", "Filters")}
</Button>
```

**Profile/Org services pages** use an inline `<Button>` with the same rectangular style:
```tsx
// ProfileServicesView.tsx line 28
<Button variant="outlined" color="secondary" startIcon={<FilterListIcon />} ...>
  {t("service_market.filters", "Filters")}
</Button>
```

### What Needs to Change
Replace the rectangular `<Button>` filter toggles on profile/org pages with the `<FiltersFAB>` component (or equivalent `<Fab>`) to match the market page UX:

1. **`ProfileStoreView.tsx`**: Replace `<MarketSideBarToggleButton />` with `<FiltersFAB onClick={() => setSidebarOpen(prev => !prev)} />`.
2. **`ProfileServicesView.tsx`** (both `ProfileServicesView` and `OrgServicesView`): Replace the inline `<Button>` with `<FiltersFAB>`.
3. The `ContextAwareFAB` does not need changes — it handles create actions, not filter toggles.

---

## Issue 3: V2 Listings on Org/User Detail Pages

### Files
- `src/features/profile/components/ProfileStoreView.tsx`
- `src/features/contractor/components/OrgTabContent.tsx`

### Current Code
**Already using V2.** `ProfileStoreView.tsx` imports and uses V2 components:
```tsx
import { ListingCardV2 } from "../../market/v2/ListingSearchV2"
import { useSearchListingsQuery } from "../../../store/api/v2/market"
```

The `ProfileListingsV2` sub-component (line 87) uses `useSearchListingsQuery` (V2 API) and renders `<ListingCardV2>`.

`OrgTabContent.tsx` imports `OrgStoreView` from `ProfileStoreView`, which also uses V2.

### What Needs to Change
**Nothing** — profile and org store pages already use V2 listing components and V2 API hooks. This issue can be closed.

---

## Issue 4: Language Tags

### Files
- `src/constants/languages.ts` — defines `SUPPORTED_LANGUAGES` with `{ code, name }` pairs
- `src/components/search/LanguageFilter.tsx` — filter autocomplete, shows `endonym (exonym)` format
- `src/components/settings/LanguageSelector.tsx` — settings selector, shows `endonym (exonym)` format
- `src/features/market/components/listings/ListingCard.tsx` — listing cards show `lang.name` ✅
- `src/features/market/components/MarketListingDetails.tsx` — listing detail shows `lang.name` ✅
- `src/features/market/listing-view/components/ListingDetailsGrid.tsx` — V1 listing detail shows `lang.name` ✅
- `src/features/services/components/ServiceChips.tsx` — service chips show `lang.name` ✅
- `src/views/contracts/ServiceView.tsx` — service view shows `lang.name` ✅
- `src/features/profile/components/ProfileAboutTab.tsx` — shows `lang.name (translated)` ✅
- `src/features/contractor/components/OrgTabContent.tsx` — shows `lang.name (translated)` ✅

### Current State
All user-facing language displays use `lang.name` (the native endonym like "English", "Deutsch", "Français") — **not** raw ISO codes like "en", "de", "fr".

The `LanguageFilter` and `LanguageSelector` components show `endonym (exonym)` format (e.g., "Deutsch (German)").

Profile and org about tabs show `lang.name (translated)`:
```tsx
label={`${lang.name} (${t(`languages.${lang.code}`, lang.name)})`}
```

### What Needs to Change
**Nothing** — language codes are only used internally (as keys, in API params). All user-facing displays show full language names. This issue can be closed unless there's a specific page not covered above where raw codes appear.

---

## Issue 5: Emoji Usage

### Files and Emoji Instances

| File | Line | Emoji | Context | MUI Replacement |
|------|------|-------|---------|-----------------|
| `src/components/market/v2/VariantBreakdown.tsx` | 117 | 📍 | `📍 {variant.locations.join(", ")}` — location display | `<PlaceRounded>` or `<LocationOnRounded>` |
| `src/features/market/v2/ContractorListingsV2.tsx` | 451 | ⭐ | `{listing.seller_rating.toFixed(1)} ⭐` — rating display | `<StarRounded>` |
| `src/features/market/v2/__tests__/ContractorListingsV2.test.tsx` | 291, 425 | ⭐ | Test assertions matching `"4.5 ⭐"` and `"5.0 ⭐"` | Update after component fix |
| `src/pages/missions/__tests__/MissionDetail.test.tsx` | 446, 449 | ⭐ | Test assertions matching `"⭐ 3.5 / 5.0"` | Update after component fix |

**Note:** The ✅ emoji appears extensively in test files as documentation markers (e.g., `* ✅ Renders form with all required fields`). These are in JSDoc comments inside test files and are cosmetic — not rendered in the UI. They don't need to be changed.

### What Needs to Change
1. **`VariantBreakdown.tsx` line 117**: Replace `📍` with `<LocationOnRounded fontSize="inherit" />` from `@mui/icons-material`.
2. **`ContractorListingsV2.tsx` line 451**: Replace `⭐` with `<StarRounded fontSize="inherit" color="warning" />` from `@mui/icons-material`.
3. **Update corresponding test assertions** in `ContractorListingsV2.test.tsx` and `MissionDetail.test.tsx` to match the new icon rendering.
4. The ✅ in test comments can be left as-is (not user-facing).
