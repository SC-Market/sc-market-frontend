# OrderSummarySectionV2 Component

## Overview

`OrderSummarySectionV2` is a compact order summary component that displays order items with variant details including quality tiers and per-variant pricing. It maintains 100% visual parity with the V1 `OrderSummarySection` component while adding support for the V2 variant system.

## Requirements

Implements requirements 27.8-27.11:
- **27.8**: Provide OrderSummarySectionV2 React component
- **27.9**: Maintain visual parity with V1 OrderSummarySection
- **27.10**: Display quality_tier in order summary
- **27.11**: Calculate totals with per-variant pricing

## Features

### Core Features
- Displays order items with variant details
- Shows quality tier badges for each item
- Displays variant display names (e.g., "Tier 5 (95.5%) - Crafted")
- Calculates totals using per-variant pricing
- Links to listing detail pages
- Shows price per unit and quantity for each item
- Displays subtotals and grand total

### Change Tracking
- Highlights newly added items with "NEW!" chip
- Shows quantity changes with old values
- Compatible with `OfferChanges` utility for counter-offer tracking

### Visual Parity
Maintains identical styling to V1:
- Box with `mt: 2`
- Divider with `my: 2`
- Stack with `spacing: 1`, `mt: 1`
- Typography variants matching V1 exactly
- Chip styling for "NEW!" indicators
- Number formatting with `toLocaleString()`

## Usage

### Basic Usage

```tsx
import { OrderSummarySectionV2 } from "../../components/orders/OrderSummarySectionV2"
import { OrderItemDetail } from "../../store/api/v2/market"

function OrderDetailsPage() {
  const { data: orderDetail } = useGetOrderDetailQuery(orderId)

  return (
    <OrderSummarySectionV2
      items={orderDetail.items}
      total_cost={orderDetail.total_price}
    />
  )
}
```

### With Change Tracking

```tsx
import { OrderSummarySectionV2 } from "../../components/orders/OrderSummarySectionV2"
import { detectOfferChanges } from "../../util/offerChanges"

function CounterOfferView() {
  const currentOffer = useGetOfferQuery(offerId)
  const previousOffer = useGetPreviousOfferQuery(offerId)
  
  const offerChanges = detectOfferChanges(currentOffer, previousOffer)

  return (
    <OrderSummarySectionV2
      items={currentOffer.items}
      total_cost={currentOffer.total_price}
      offerChanges={offerChanges}
    />
  )
}
```

### Empty State Handling

The component automatically returns `null` when no items are provided:

```tsx
// Returns null - no rendering
<OrderSummarySectionV2 items={[]} total_cost={0} />

// Returns null - no rendering
<OrderSummarySectionV2 items={undefined} total_cost={0} />
```

## Props

### OrderSummarySectionV2Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `OrderItemDetail[]` | No | Array of order items with variant details |
| `total_cost` | `number` | Yes | Total order cost in aUEC (atomic units) |
| `offerChanges` | `OfferChanges \| null` | No | Optional change tracking for counter-offers |

### OrderItemDetail Structure

```typescript
interface OrderItemDetail {
  order_item_id: string
  listing_id: string
  item_id: string
  variant: {
    variant_id: string
    attributes: {
      quality_tier?: number
      quality_value?: number
      crafted_source?: string
      // ... other variant attributes
    }
    display_name: string  // e.g., "Tier 5 (95.5%) - Crafted"
    short_name: string    // e.g., "T5 Crafted"
  }
  quantity: number
  price_per_unit: number  // Price snapshot at purchase time
  subtotal: number        // quantity * price_per_unit
}
```

### OfferChanges Structure

```typescript
interface OfferChanges {
  costChanged: boolean
  descriptionChanged: boolean
  serviceChanged: boolean
  addedListings: Set<string>        // listing_ids that are new
  removedListings: Set<string>      // listing_ids that were removed
  quantityChanges: Map<string, {    // listing_id -> quantity change
    old: number
    new: number
  }>
}
```

## Visual Design

### Layout Structure

```
Box (mt: 2)
├── Divider (my: 2)
├── Title: "Order Summary"
└── Stack (spacing: 1, mt: 1)
    ├── Item Row 1
    │   ├── Left Section
    │   │   ├── Listing Link
    │   │   ├── Quality Badge + Variant Name
    │   │   ├── Price × Quantity
    │   │   └── NEW! Chip (conditional)
    │   └── Right Section: Subtotal
    ├── Item Row 2...
    ├── Divider
    └── Total Row
        ├── "Total" Label
        └── Total Amount
```

### Item Row Details

Each item displays:
1. **Listing Link**: Links to `/market/{listing_id}`
2. **Quality Badge**: Color-coded tier badge (Tier 1-5)
3. **Variant Name**: Display name from variant (e.g., "Tier 5 (95.5%) - Crafted")
4. **Price Details**: `{price} aUEC × {quantity}`
5. **Quantity Change**: Shows `(was {old})` if quantity changed
6. **NEW! Chip**: Shown for new items or quantity changes
7. **Subtotal**: Right-aligned total for this item

### Quality Badge Colors

- **Tier 1**: Bronze (warning color)
- **Tier 2**: Silver (default color)
- **Tier 3**: Gold (info color)
- **Tier 4**: Platinum (primary color)
- **Tier 5**: Diamond (secondary color)

## Integration Points

### Where to Use

Replace V1 `OrderSummarySection` with `OrderSummarySectionV2` in:

1. **Order Details Pages** (`OrderDetailsArea.tsx`)
   - Display order items with variant details
   - Show quality tiers for purchased items

2. **Offer Details Pages** (`OfferDetailsArea.tsx`)
   - Display offer items with variants
   - Track changes in counter-offers

3. **Public Order Views** (`ViewPublicOrder.tsx`)
   - Show order summary to buyers/sellers
   - Display variant information publicly

### Migration from V1

```tsx
// V1 Usage
import { OrderSummarySection } from "../../components/orders/OrderSummarySection"

<OrderSummarySection
  market_listings={offer.market_listings}  // V1 format
  total_cost={offer.cost}
  offerChanges={changes}
/>

// V2 Usage
import { OrderSummarySectionV2 } from "../../components/orders/OrderSummarySectionV2"

<OrderSummarySectionV2
  items={orderDetail.items}  // V2 format with variants
  total_cost={orderDetail.total_price}
  offerChanges={changes}
/>
```

### Data Transformation

If you have V1 data and need to display in V2 format, transform it:

```typescript
// Transform V1 OfferMarketListing[] to V2 OrderItemDetail[]
const v2Items: OrderItemDetail[] = v1Listings.map((listing) => ({
  order_item_id: generateId(),
  listing_id: listing.listing_id,
  item_id: listing.listing.item_id,
  variant: {
    variant_id: listing.listing.variant_id,
    attributes: listing.listing.variant_attributes,
    display_name: listing.listing.variant_display_name,
    short_name: listing.listing.variant_short_name,
  },
  quantity: listing.quantity,
  price_per_unit: listing.listing.price,
  subtotal: listing.quantity * listing.listing.price,
}))
```

## Testing

The component includes comprehensive tests covering:

- ✅ Rendering order summary with variant details
- ✅ Displaying quality tier badges
- ✅ Showing NEW! chips for added listings
- ✅ Showing quantity changes with old values
- ✅ Calculating totals from item subtotals
- ✅ Returning null when no items provided
- ✅ Handling items without quality tier
- ✅ Formatting large numbers with locale string
- ✅ Maintaining visual parity with V1 structure
- ✅ Displaying links to listing pages

Run tests:
```bash
npm test -- OrderSummarySectionV2.test.tsx --run
```

## Accessibility

- Uses semantic HTML with proper heading hierarchy
- Links have descriptive text (listing IDs)
- Color-coded badges have text labels (not color-only)
- Proper ARIA attributes inherited from Material-UI components
- Keyboard navigation supported for all interactive elements

## Performance

- Uses `useMemo` for derived calculations (if needed in parent)
- Efficient rendering with React keys on `order_item_id`
- No unnecessary re-renders when props don't change
- Lightweight component with minimal DOM nodes

## Future Enhancements

Potential improvements for future iterations:

1. **Listing Title Fetching**: Currently shows placeholder "Listing {id}". Could fetch actual titles.
2. **Variant Tooltips**: Add tooltips showing full variant attributes on hover.
3. **Price Change Indicators**: Highlight when prices have changed since cart addition.
4. **Availability Warnings**: Show warnings if variants are no longer available.
5. **Expandable Details**: Allow expanding each item to show more variant details.

## Related Components

- **OrderSummarySection** (V1): Original component without variant support
- **OfferMarketListingsV2**: Full table view of order items with variants
- **QualityBadge**: Quality tier badge component used for visual indicators
- **OrderLimitsDisplay**: Order validation and limits display component

## See Also

- [Requirements Document](../../../.kiro/specs/sc-market-v2-redesign/requirements.md) - Requirements 27.8-27.11
- [V1 Cart and Order UI Audit](../../../.kiro/specs/sc-market-v2-redesign/v1-cart-orders-ui-audit.md) - Section 6
- [Design Document](../../../.kiro/specs/sc-market-v2-redesign/design.md) - Order display components
