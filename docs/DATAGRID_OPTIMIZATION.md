# Bundle Splitting - DataGrid Optimization

## Changes Made

### 1. Created LazyDataGrid Component

- **File**: `src/components/grid/LazyDataGrid.tsx`
- Wraps `@mui/x-data-grid` DataGrid with React.lazy()
- Shows skeleton fallback during loading
- Enables automatic code-splitting

### 2. Updated DataGrid Usage

Updated all DataGrid imports to use the lazy version:

- `src/components/grid/ThemedDataGrid.tsx` - Now uses LazyDataGrid
- `src/features/market/components/stock/AllStockLotsGrid.tsx`
- `src/features/market/components/stock/AllAllocatedLotsGrid.tsx`
- `src/features/market/components/ItemStock.tsx` (via ThemedDataGrid)

### 3. DatePicker Provider

- Already optimized - DatePickerProvider is only used locally around date pickers
- Not in global HookProvider, so already code-split
- Used in:
  - MessageHeader
  - DateTimePickerBottomSheet
  - MessagesBodyMobile
  - BuyOrderForm
  - MarketListingForm

## Results

### Bundle Chunks Created

- **mui-data-AjTXXdsH.js**: 505.14 kB (148.36 kB gzipped)
  - Contains @mui/x-data-grid
  - Only loads when DataGrid components are rendered
  - Reduces initial bundle size

### Benefits

1. **Reduced Initial Load**: DataGrid (505KB) not loaded until needed
2. **Better Caching**: DataGrid chunk cached separately
3. **Improved Performance**: Users who don't view grids don't download the code
4. **Lazy Loading**: Automatic with React.lazy() and Suspense

### Usage

DataGrid components now load on-demand:

- Stock management pages
- Allocation grids
- Any page using ThemedDataGrid

No changes needed in consuming components - the API remains the same.
