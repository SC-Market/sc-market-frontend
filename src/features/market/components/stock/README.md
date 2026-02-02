# Stock Management Components

This directory contains the advanced stock management UI components for the granular stock tracking feature.

## Components

### StockManager
Main component that provides a comprehensive view of all stock lots for a listing. Features:
- Groups lots by location
- Shows aggregate stock information (total, available, reserved)
- Provides access to create, edit, transfer, and delete operations
- Progressive disclosure - only shown when user has multiple lots or non-Unspecified locations

**Requirements**: 2.1, 3.3, 4.4, 8.3, 9.3, 9.5

### StockBreakdown
Displays aggregate stock information with visual indicators:
- Total stock across all lots
- Available stock (not allocated to orders)
- Reserved stock (allocated to pending orders)
- Visual chips for quick status overview

**Requirements**: 2.1, 2.5, 3.3, 3.4, 4.4, 5.1

### LotListItem
Individual lot display with inline editing capabilities:
- Edit quantity, location, listed status, and notes
- Optimistic UI updates with rollback on error
- Transfer and delete actions
- Validation for all fields

**Requirements**: 2.4, 4.1, 8.5

### LocationSelector
Searchable dropdown for location selection:
- Shows preset verse locations at the top with badges
- Shows user's custom locations below
- Filters as user types
- Allows creating new custom locations inline
- Validates location name length (max 255 chars)

**Requirements**: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6

### CreateLotDialog
Modal form for creating new stock lots:
- Quantity input (required, positive integer)
- Location selector (searchable dropdown)
- Owner selector (optional, org members)
- Listed toggle (default true)
- Notes textarea (max 1000 chars)
- Full validation with error messages

**Requirements**: 2.2, 2.4, 3.1, 4.1, 8.1, 8.2

### TransferLotDialog
Modal for transferring stock between locations:
- Visual indication of source and destination
- Quantity input with validation
- Destination location selector
- Supports partial and full transfers
- Clear feedback on transfer type

**Requirements**: 11.1, 11.2, 11.3

## Integration

The StockManager is integrated into the SimpleStockInput component via a "Manage Stock" link that appears when:
- Multiple lots exist for a listing, OR
- Any lot has a non-Unspecified location

This provides progressive disclosure - casual users see a simple number input, while power users can access advanced features when needed.

## Usage Example

```tsx
import { StockManager } from './features/market/components/stock'

function MyComponent() {
  return (
    <StockManager
      listingId="listing-uuid"
      onClose={() => console.log('Closed')}
    />
  )
}
```

## API Integration

All components use RTK Query hooks from `store/api/stock-lots.ts`:
- `useGetListingLotsQuery` - Fetch lots for a listing
- `useCreateLotMutation` - Create new lot
- `useUpdateLotMutation` - Update existing lot
- `useDeleteLotMutation` - Delete lot
- `useTransferLotMutation` - Transfer stock between locations
- `useGetLocationsQuery` - Fetch available locations
- `useCreateLocationMutation` - Create custom location

## Validation

All components implement proper validation:
- Quantities must be non-negative integers
- Notes limited to 1000 characters
- Location names limited to 255 characters
- Transfer quantities cannot exceed available stock
- Destination location must differ from source

## Error Handling

All mutations include:
- Optimistic UI updates for better UX
- Rollback on error
- User-friendly error messages via AlertHook
- Success confirmations

## Accessibility

Components follow accessibility best practices:
- Proper ARIA labels
- Keyboard navigation support
- Focus management in dialogs
- Screen reader friendly
