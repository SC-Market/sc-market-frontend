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

For each of the order's V2 lines: left, the lots of the same listing item and
variant with free units; right, the lots the line's units are allocated from.
Header actions: auto-allocate (oldest listed lots first) and release all.

Allocating takes units out of the lot (its `quantity_total` drops);
releasing or cancelling the order puts them back in the same lot.

## API Integration

Generated V2 client (`store/api/v2/market.ts`), seller side only:

- `GET /api/v2/orders/{orderId}/allocations` (`useGetOrderAllocationsQuery`):
  lines, allocations, candidate lots, the shop's allocation mode
- `POST .../allocations/auto` (`useAutoAllocateOrderStockMutation`)
- `POST .../allocations/manual` (`useManualAllocateOrderStockMutation`):
  sets a lot's allocation for a line (absolute quantity; 0 releases)
- `POST .../allocations/release` (`useReleaseOrderStockMutation`)
