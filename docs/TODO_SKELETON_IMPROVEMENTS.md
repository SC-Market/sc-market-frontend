# TODO: Skeleton Improvements

## Current Status

Route-specific skeleton system is implemented, but many skeletons are too generic and don't match actual page layouts.

## Well-Tailored Skeletons ✅

- `OrderDetailSkeleton` - Matches order table with avatars, status, description
- `MessageListSkeleton` - Matches chat entries with avatar groups
- `ContractDetailSkeleton` - Tailored for contract details
- `RecruitingPostViewSkeleton` - Tailored for recruiting posts
- `OfferDetailSkeleton` - Tailored for offer details
- `MarketPageSkeleton` - Has filters sidebar + listings grid
- `ProfileSkeleton` - Has circular avatar + tabs
- `DashboardSkeleton` - Has stat cards + content areas

## Needs Improvement 🔧

### High Priority (Frequently Used) ✅ COMPLETED

- [x] **Market Listing Detail** (`/market/:id`)
  - ~~Current: Generic `DetailPageSkeleton` (breadcrumbs + boxes)~~
  - ✅ Created: `MarketListingDetailSkeleton.tsx` with image gallery, price, seller info, description
  - ✅ Mapped to routes: `/market/:id`, `/market/aggregate/:id`, `/market/multiple/:id`

- [x] **Market Cart** (`/market/cart`)
  - ~~Current: `ListPageSkeleton` (generic table)~~
  - ✅ Created: `MarketCartSkeleton.tsx` with cart items, quantities, checkout sidebar
  - ✅ Mapped to route: `/market/cart`

- [x] **Contractors List** (`/contractors`)
  - ~~Current: `ListPageSkeleton` (generic table)~~
  - ✅ Created: `ContractorsListSkeleton.tsx` with contractor cards and pagination
  - ✅ Mapped to route: `/contractors`

- [ ] **Contractor Profile** (`/contractor/:id`)
  - Current: `ProfileSkeleton` (generic profile)
  - Needs: Org banner, logo, stats, services/members tabs
  - Consider: Enhance existing `ProfileSkeleton` or create `ContractorProfileSkeleton.tsx`

### Medium Priority ✅ COMPLETED

- [x] **Contracts List** (`/contracts`)
  - ~~Current: `ListPageSkeleton` (generic table)~~
  - ✅ Created: `ContractsListSkeleton.tsx` with tabs, contract cards, filters
  - ✅ Mapped to route: `/contracts`

- [x] **Recruiting List** (`/recruiting`)
  - ~~Current: `ListPageSkeleton` (generic table)~~
  - ✅ Created: `RecruitingListSkeleton.tsx` with recruiting post cards
  - ✅ Mapped to route: `/recruiting`

- [x] **Fleet View** (`/myfleet`, `/org/fleet`)
  - ~~Current: `ListPageSkeleton` (generic table)~~
  - ✅ Created: `FleetSkeleton.tsx` with ships grid and active deliveries
  - ✅ Mapped to routes: `/myfleet`, `/org/fleet`, `/org/:contractor_id/fleet`

- [x] **My Market Listings** (`/market/me`)
  - ~~Current: `ListPageSkeleton` (generic table)~~
  - ✅ Created: `MyListingsSkeleton.tsx` with nav tabs, listings grid
  - ✅ Mapped to route: `/market/me`

- [x] **Order Services List** (`/order/services`)
  - ~~Current: `ListPageSkeleton` (generic table)~~
  - ✅ Created: `ServicesListSkeleton.tsx` with active/inactive sections
  - ✅ Mapped to routes: `/order/services`, `/org/:contractor_id/services`

### Low Priority (Less Frequent)

- [ ] **Buy Order Create** (`/buyorder/create`)
  - Current: `FormPageSkeleton` (generic form)
  - Needs: Item selector, quantity/price fields, preview
  - Create: `BuyOrderFormSkeleton.tsx`

- [ ] **Market Create** (`/market/create`)
  - Current: `FormPageSkeleton` (generic form)
  - Needs: Image upload area, item selector, pricing fields
  - Create: `MarketCreateSkeleton.tsx`

- [ ] **Service Create/Edit** (`/order/service/create`, `/order/service/:id/edit`)
  - Current: `FormPageSkeleton` (generic form)
  - Needs: Service details, pricing, availability fields
  - Create: `ServiceFormSkeleton.tsx`

- [ ] **Org Management** (`/org/manage`)
  - Current: `FormPageSkeleton` (generic form)
  - Needs: Tabs for settings, roles, webhooks, invites
  - Create: `OrgManageSkeleton.tsx`

- [ ] **Admin Pages** (various `/admin/*`)
  - Current: `AdminPageSkeleton` (sidebar + table)
  - Consider: Different layouts for stats vs moderation vs logs
  - Evaluate: May be fine as-is since admin pages vary

## Implementation Guidelines

### When Creating New Skeletons:

1. **Match actual layout structure** - Same grid, same spacing
2. **Include key visual elements** - Avatars, images, chips, buttons
3. **Use existing skeleton components** - `BaseSkeleton`, `CardSkeleton`, `ListingSkeleton`
4. **Keep it lightweight** - No heavy logic, just layout
5. **Test on mobile** - Ensure responsive breakpoints match

### Pattern to Follow:

```tsx
// src/components/skeletons/MarketListingDetailSkeleton.tsx
import { Container, Grid, Box } from "@mui/material"
import { BaseSkeleton, CardSkeleton } from "."

export function MarketListingDetailSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Image gallery */}
        <Grid item xs={12} md={6}>
          <BaseSkeleton variant="rectangular" width="100%" height={400} />
        </Grid>

        {/* Details sidebar */}
        <Grid item xs={12} md={6}>
          <BaseSkeleton variant="text" width="80%" height={40} />
          <BaseSkeleton variant="text" width="40%" height={32} sx={{ mt: 2 }} />
          {/* ... more matching structure */}
        </Grid>
      </Grid>
    </Container>
  )
}
```

### After Creating:

1. Export from `src/components/skeletons/index.ts`
2. Add to `routeSkeletonMap` in `src/router/routeSkeletons.tsx`
3. Test navigation to verify no CLS

## Metrics to Track

- [ ] Measure CLS before/after improvements
- [ ] User feedback on loading states
- [ ] Identify most-visited routes for prioritization
