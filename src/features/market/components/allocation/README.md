# Order Allocation Components

This directory contains components for managing stock allocations to orders.

## Documentation

- [Error Handling Guide](./ERROR_HANDLING.md) - Comprehensive guide to error handling and user feedback

## Components

### SplitAllocationView

The order page's Stock Allocation tab (`pages/contracting/ViewOrder.tsx`),
shown to members of the selling org with `manage_orders`.

**Props:**

- `orderId` (string, required): The ID of the order
- `spectrumId` (string, required): Spectrum ID of the org selling the order
- `listings` ({ listing_id, quantity }[], required): The order's listings and quantities

Left panel: each listing's listed lots and how much of each can still be
allocated. Right panel: what is allocated to the order per listing.

## API Integration

- Lots: V2 `GET /api/v2/stock-lots?listing_id=&spectrum_id=&listed=true`
  (`useGetStockLotsQuery`); `spectrum_id` limits it to the org's members.
- Allocations: `GET /api/orders/:order_id/allocations` and
  `POST /api/orders/:order_id/allocations/manual` (`stockLotsApi`), which only
  the order's seller side may use.
