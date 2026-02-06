# Order Allocation Components

This directory contains components for managing stock allocations to orders.

## Documentation

- [Error Handling Guide](./ERROR_HANDLING.md) - Comprehensive guide to error handling and user feedback

## Components

### OrderAllocationView

Displays current stock allocations for an order and provides access to manual allocation management.

**Props:**

- `orderId` (string, required): The ID of the order
- `listingId` (string, optional): The ID of the listing to allocate from
- `orderQuantity` (number, optional): The total quantity ordered

**Features:**

- Displays current allocations grouped by location
- Shows total allocated quantity vs order quantity
- Provides "Manage Allocation" button for manual control
- Shows allocation status (active, released, fulfilled)
- Displays warnings for partial allocations

**Example Usage:**

```tsx
import { OrderAllocationView } from "@/features/market/components/allocation"

function OrderDetailsPage({ order }) {
  return (
    <div>
      <h1>Order Details</h1>

      {/* Other order details */}

      <OrderAllocationView
        orderId={order.order_id}
        listingId={order.market_listings?.[0]?.listing_id}
        orderQuantity={order.quantity}
      />
    </div>
  )
}
```

### ManualAllocationDialog

Provides interface for manually allocating stock lots to an order.

**Props:**

- `open` (boolean, required): Whether the dialog is open
- `onClose` (function, required): Callback when dialog is closed
- `orderId` (string, required): The ID of the order
- `listingId` (string, required): The ID of the listing to allocate from
- `orderQuantity` (number, optional): The total quantity ordered
- `currentAllocations` (Allocation[], required): Current allocations for the order
- `onAddStock` (function, optional): Callback to add more stock
- `onAllocateUnlisted` (function, optional): Callback to allocate unlisted stock
- `onReduceOrder` (function, optional): Callback to reduce order quantity

**Features:**

- Displays all available lots with quantities
- Allows selecting lots and specifying quantities
- Validates total doesn't exceed order quantity
- Validates each lot allocation doesn't exceed available
- Shows clear error messages on validation failure
- Provides increment/decrement buttons for easy quantity adjustment
- Handles insufficient stock errors with actionable options
- Displays loading states during data fetching

**Example Usage:**

```tsx
import { ManualAllocationDialog } from "@/features/market/components/allocation"

function MyComponent() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: allocationsData } = useGetOrderAllocationsQuery({
    order_id: orderId,
  })

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>Manage Allocation</Button>

      <ManualAllocationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        orderId={orderId}
        listingId={listingId}
        orderQuantity={100}
        currentAllocations={allocationsData?.allocations || []}
      />
    </>
  )
}
```

## API Integration

These components use the following RTK Query hooks from `@/store/api/stock-lots`:

- `useGetOrderAllocationsQuery`: Fetches current allocations for an order
- `useManualAllocateOrderMutation`: Manually allocates stock to an order
- `useGetListingLotsQuery`: Fetches available lots for a listing

## Requirements Satisfied

- **Requirement 5.3**: Display allocation details to user
- **Requirement 7.1**: Provide manual allocation management interface
- **Requirement 7.2**: Display all lots with available quantities
- **Requirement 7.3**: Validate lot allocations don't exceed available
- **Requirement 9.5**: Loading states and optimistic updates
- **Requirement 13.1**: Display available quantity and shortfall for insufficient stock
- **Requirement 13.2**: Offer options to add stock, allocate unlisted stock, or reduce order quantity
- **Requirement 13.3**: Prevent negative quantities and validate character limits
- **Requirement 13.4**: Handle concurrent modification conflicts with optimistic locking

## Integration Points

To integrate these components into the order details view:

1. Import the `OrderAllocationView` component
2. Pass the order ID, listing ID (if available), and order quantity
3. The component will handle fetching allocations and displaying the UI
4. Users can click "Manage Allocation" to open the manual allocation dialog

Example integration in `OrderDetailsArea.tsx`:

```tsx
import { OrderAllocationView } from "../../features/market/components/allocation"

export function OrderDetailsArea(props: { order: Order }) {
  const { order } = props

  // Extract listing ID from order if available
  const listingId = order.market_listings?.[0]?.listing_id

  return (
    <Grid container spacing={2}>
      {/* Existing order details */}

      {/* Add allocation view */}
      {listingId && (
        <Grid item xs={12}>
          <OrderAllocationView
            orderId={order.order_id}
            listingId={listingId}
            orderQuantity={order.quantity}
          />
        </Grid>
      )}
    </Grid>
  )
}
```
