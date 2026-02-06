# Error Handling and User Feedback

This document describes the error handling and user feedback mechanisms implemented for the stock allocation system.

## Overview

The error handling system provides clear, actionable feedback to users when stock operations fail. It follows Requirements 13.1, 13.2, 13.3, and 13.4 from the granular stock tracking specification.

## Components

### 1. InsufficientStockDialog

**Purpose**: Handles allocation failures due to insufficient stock quantity.

**Requirements**: 13.1, 13.2

**Features**:

- Displays available quantity and shortfall clearly
- Shows detailed stock breakdown (order quantity, available, shortfall)
- Provides three actionable options:
  - **Add More Stock**: Navigate to stock management to create new lots
  - **Use Unlisted Stock**: Allocate from unlisted stock lots if available
  - **Reduce Order Quantity**: Adjust order to match available stock

**Usage**:

```tsx
<InsufficientStockDialog
  open={open}
  onClose={handleClose}
  orderQuantity={100}
  availableQuantity={75}
  shortfall={25}
  onAddStock={() => navigateToStockManager()}
  onAllocateUnlisted={() => showUnlistedLots()}
  onReduceOrder={() => adjustOrderQuantity()}
/>
```

### 2. ValidationErrorAlert

**Purpose**: Displays validation errors with clear, consistent messaging.

**Requirements**: 13.3, 2.4, 8.2

**Error Types**:

- **negative_quantity**: Prevents negative quantity values
- **over_allocation**: Prevents allocating more than available
- **character_limit**: Enforces character limits (notes: 1000 chars, location names: 255 chars)
- **required_field**: Ensures required fields are filled
- **invalid_format**: Validates data format
- **generic**: Handles other error messages

**Features**:

- Consistent error message formatting
- Helper functions for creating common validation errors
- Dismissible alerts
- Multiple error display support

**Usage**:

```tsx
import { ValidationErrorAlert, createValidationError } from './ValidationErrorAlert'

// Create validation errors
const errors = [
  createValidationError.negativeQuantity("Quantity"),
  createValidationError.overAllocation(150, 100, "Total allocation"),
  createValidationError.characterLimit("Notes", 1200, 1000),
]

// Display errors
<ValidationErrorAlert
  errors={errors}
  onDismiss={() => setErrors([])}
/>
```

### 3. ConcurrentModificationDialog

**Purpose**: Handles concurrent modification conflicts detected through optimistic locking.

**Requirements**: 13.4

**Features**:

- Detects version conflicts from optimistic locking
- Shows detailed conflict information (field, your value, current value)
- Provides "Reload and Retry" option
- Explains what happens next to the user

**Usage**:

```tsx
<ConcurrentModificationDialog
  open={open}
  onClose={handleClose}
  onRetry={handleRetry}
  resourceType="stock lot"
  conflictDetails={[
    { field: "Quantity", yourValue: 100, currentValue: 95 },
    { field: "Location", yourValue: "Orison", currentValue: "Lorville" },
  ]}
/>
```

## Integration with ManualAllocationDialog

The ManualAllocationDialog integrates all error handling components:

1. **Validation Errors**: Real-time validation with ValidationErrorAlert
2. **Insufficient Stock**: Detects insufficient stock errors and shows InsufficientStockDialog
3. **Loading States**: Shows CircularProgress during data fetching
4. **Error Recovery**: Clears errors when user makes changes

## Error Detection Patterns

### Insufficient Stock Detection

```typescript
if (
  errorMessage.toLowerCase().includes("insufficient") ||
  errorMessage.toLowerCase().includes("not enough")
) {
  // Show InsufficientStockDialog
}
```

### Validation Error Creation

```typescript
// Negative quantity
if (quantity < 0) {
  errors.push(createValidationError.negativeQuantity("Quantity"))
}

// Over-allocation
if (allocated > available) {
  errors.push(createValidationError.overAllocation(allocated, available, "Lot"))
}

// Character limit
if (notes.length > 1000) {
  errors.push(createValidationError.characterLimit("Notes", notes.length, 1000))
}
```

### Concurrent Modification Detection

```typescript
// Backend returns 409 Conflict with version mismatch
if (error.status === 409 && error.data?.conflict) {
  // Show ConcurrentModificationDialog
}
```

## Best Practices

1. **Clear Messaging**: Use specific, actionable error messages
2. **Actionable Options**: Always provide clear next steps
3. **Visual Hierarchy**: Use appropriate severity levels (error, warning, info)
4. **Error Recovery**: Clear errors when user takes corrective action
5. **Loading States**: Show loading indicators during async operations
6. **Optimistic Updates**: Update UI optimistically, rollback on error

## Requirements Coverage

| Requirement                                     | Component                    | Status      |
| ----------------------------------------------- | ---------------------------- | ----------- |
| 13.1 - Display available quantity and shortfall | InsufficientStockDialog      | ✅ Complete |
| 13.2 - Offer resolution options                 | InsufficientStockDialog      | ✅ Complete |
| 13.3 - Prevent negative quantities              | ValidationErrorAlert         | ✅ Complete |
| 13.3 - Validate character limits                | ValidationErrorAlert         | ✅ Complete |
| 13.4 - Handle concurrent modifications          | ConcurrentModificationDialog | ✅ Complete |
| 9.5 - Loading states                            | ManualAllocationDialog       | ✅ Complete |

## Future Enhancements

1. **Toast Notifications**: Add toast notifications for success messages
2. **Error Analytics**: Track error frequency for monitoring
3. **Retry Logic**: Implement automatic retry for transient errors
4. **Offline Support**: Handle offline scenarios gracefully
5. **Error Boundaries**: Add React error boundaries for component-level error handling
