# AttributeFilterSection Component

A flexible filter component that supports multiple attribute types for filtering game items in the marketplace.

## Features

- **Single Select**: Dropdown for selecting one value from a list
- **Multi Select**: Checkbox list (for few options) or Autocomplete (for many options) for selecting multiple values
- **Range**: Min/max numeric inputs for filtering by numeric ranges

## Usage

```tsx
import { AttributeFilterSection } from './components/filters'

// Single select example
<AttributeFilterSection
  attributeName="size"
  displayName="Component Size"
  attributeType="select"
  allowedValues={["4", "5", "6", "7", "8"]}
  selectedValues={["4"]}
  onChange={(values) => console.log('Selected:', values)}
/>

// Multi select with checkboxes (few options)
<AttributeFilterSection
  attributeName="class"
  displayName="Component Class"
  attributeType="multiselect"
  allowedValues={["Military", "Stealth", "Industrial", "Civilian"]}
  selectedValues={["Military", "Stealth"]}
  onChange={(values) => console.log('Selected:', values)}
/>

// Multi select with autocomplete (many options)
<AttributeFilterSection
  attributeName="manufacturer"
  displayName="Manufacturer"
  attributeType="multiselect"
  allowedValues={[
    "Behring", "Wei-Tek", "Aegis", "Origin", "RSI", 
    "Anvil", "Drake", "MISC", "Crusader", "Esperia"
  ]}
  selectedValues={["Behring"]}
  onChange={(values) => console.log('Selected:', values)}
/>

// Range input example
<AttributeFilterSection
  attributeName="size"
  displayName="Component Size"
  attributeType="range"
  allowedValues={null}
  selectedValues={["4", "8"]}
  onChange={(values) => console.log('Min:', values[0], 'Max:', values[1])}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `attributeName` | `string` | Internal name of the attribute (e.g., "size", "class") |
| `displayName` | `string` | Human-readable label shown to users |
| `attributeType` | `"select" \| "multiselect" \| "range"` | Type of filter UI to render |
| `allowedValues` | `string[] \| null` | List of valid values (null for range type) |
| `selectedValues` | `string[]` | Currently selected values |
| `onChange` | `(values: string[]) => void` | Callback when selection changes |

## Behavior

### Select Type
- Renders a Material-UI TextField with select
- Single value selection
- Empty selection shows "None" option
- Returns array with single value or empty array

### Multiselect Type
- Uses checkboxes if ≤5 options
- Uses Autocomplete if >5 options
- Supports multiple value selection
- Returns array of selected values

### Range Type
- Renders two number inputs (min and max)
- Filters empty values automatically
- Returns array with [min, max] or [min] or [max] or []

## Accessibility

- All inputs have proper ARIA labels
- Keyboard navigation supported
- Screen reader friendly
- Follows Material-UI accessibility guidelines
