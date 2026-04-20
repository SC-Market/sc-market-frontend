# Game Data Shared Components

This directory contains shared UI components for the SC Game Data and Crafting System.

## Components

### VersionSelector

Game version selector component that allows users to switch between LIVE, PTU, and EPTU versions.

**Features:**
- Dropdown with LIVE/PTU/EPTU options
- Displays full version number including build
- Shows last data update timestamp
- Persists selection to localStorage
- Visual distinction for version types (color-coded chips)
- Defaults to LIVE for new users

**Requirements:** 13.1-13.6, 45.1-45.10

**Usage:**
```tsx
import { VersionSelector } from "@/components/game-data"

<VersionSelector
  onVersionChange={(versionId, versionType) => {
    console.log(`Selected ${versionType}: ${versionId}`)
  }}
  compact={false}
  width={300}
/>
```

**Props:**
- `onVersionChange?: (versionId: string, versionType: string) => void` - Callback when version changes
- `compact?: boolean` - Show compact version (no label)
- `width?: string | number` - Custom width (default: 300)

---

### GameItemIcon

Display icon for game items with fallback to placeholder.

**Features:**
- Displays item icon with fallback
- Supports multiple sizes
- Loading state with skeleton
- Consistent styling across system
- Optional click handler

**Requirements:** 48.1-48.10

**Usage:**
```tsx
import { GameItemIcon } from "@/components/game-data"

<GameItemIcon
  name="Aegis Avenger"
  iconUrl="/path/to/icon.png"
  size={48}
  loading={false}
  onClick={() => console.log("Icon clicked")}
/>
```

**Props:**
- `name: string` - Item name for alt text (required)
- `iconUrl?: string` - Icon URL (thumbnail_path or image_url)
- `size?: number` - Size in pixels (default: 48)
- `loading?: boolean` - Show loading skeleton (default: false)
- `borderRadius?: number` - Border radius (default: 1)
- `onClick?: () => void` - Optional click handler

---

### QualityBadge

Display quality tier badge with color coding.

**Features:**
- Color-coded by tier (Bronze to Diamond)
- Displays tier number and optional name
- Tooltip with quality value if provided
- Consistent with Market V2 styling

**Requirements:** 48.1-48.10

**Usage:**
```tsx
import { QualityBadge } from "@/components/game-data"

<QualityBadge
  tier={5}
  showName={true}
  size="small"
  value={95.5}
/>
```

**Props:**
- `tier: number` - Quality tier (1-5) (required)
- `showName?: boolean` - Show tier name (Bronze, Silver, etc.) (default: false)
- `size?: "small" | "medium"` - Size variant (default: "small")
- `value?: number` - Optional quality value (0-100) for tooltip

**Tier Colors:**
- Tier 1 (Bronze): Warning color
- Tier 2 (Silver): Grey
- Tier 3 (Gold): Info color
- Tier 4 (Platinum): Primary color
- Tier 5 (Diamond): Secondary color

---

### RarityBadge

Display blueprint/item rarity badge with color coding.

**Features:**
- Color-coded by rarity
- Displays rarity name
- Consistent styling

**Requirements:** 48.1-48.10

**Usage:**
```tsx
import { RarityBadge } from "@/components/game-data"

<RarityBadge
  rarity="Legendary"
  size="small"
/>
```

**Props:**
- `rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | string` - Rarity level (required)
- `size?: "small" | "medium"` - Size variant (default: "small")

**Rarity Colors:**
- Common: Grey
- Uncommon: Success color
- Rare: Info color
- Epic: Secondary color
- Legendary: Warning color

---

### LocationBadge

Display location badge with appropriate icon.

**Features:**
- Displays location with appropriate icon
- Tooltip with full path if provided
- Consistent styling

**Requirements:** 48.1-48.10

**Usage:**
```tsx
import { LocationBadge } from "@/components/game-data"

<LocationBadge
  location="Stanton"
  type="system"
  size="small"
  fullPath="Stanton > Crusader > Port Olisar"
/>
```

**Props:**
- `location: string` - Location name (required)
- `type?: "system" | "planet" | "location"` - Location type for icon selection (default: "location")
- `size?: "small" | "medium"` - Size variant (default: "small")
- `fullPath?: string` - Optional full location path for tooltip

**Icons:**
- System: PublicIcon (globe)
- Planet: LocationOnIcon (pin)
- Location: PlaceIcon (marker)

---

### CategoryFilter

Multi-select category filter with checkboxes.

**Features:**
- Multi-select checkboxes
- Optional item counts
- Consistent styling with Market V2
- Accessible form controls

**Requirements:** 48.1-48.10

**Usage:**
```tsx
import { CategoryFilter } from "@/components/game-data"

<CategoryFilter
  label="Item Categories"
  categories={[
    { value: "weapons", label: "Weapons", count: 150 },
    { value: "armor", label: "Armor", count: 80 },
    { value: "components", label: "Components", count: 200 },
  ]}
  selectedCategories={["weapons", "armor"]}
  onChange={(selected) => console.log("Selected:", selected)}
  showCounts={true}
/>
```

**Props:**
- `label: string` - Filter label (required)
- `categories: CategoryOption[]` - Available categories (required)
- `selectedCategories: string[]` - Selected category values (required)
- `onChange: (selected: string[]) => void` - Change handler (required)
- `showCounts?: boolean` - Show item counts (default: false)

**CategoryOption Type:**
```typescript
interface CategoryOption {
  value: string
  label: string
  count?: number
}
```

---

## API Integration

### versionsApi

RTK Query API for game version management.

**Endpoints:**
- `useListVersionsQuery()` - List all versions
- `useGetActiveVersionsQuery()` - Get active versions (one per type)
- `useSelectVersionMutation()` - Select user's preferred version

**Types:**
```typescript
interface GameVersion {
  version_id: string
  version_type: "LIVE" | "PTU" | "EPTU"
  version_number: string
  build_number?: string
  release_date?: string
  is_active: boolean
  last_data_update?: string
  created_at: string
  updated_at: string
}

interface ActiveVersionsResponse {
  LIVE?: GameVersion
  PTU?: GameVersion
  EPTU?: GameVersion
}
```

---

## Design Patterns

### Color Consistency

All components use the ExtendedTheme from Market V2 for consistent color coding:
- Quality tiers use the same colors as Market V2 quality system
- Badges use theme palette colors (success, warning, info, etc.)
- All components support dark/light theme switching

### Responsive Design

All components are designed to be mobile-responsive:
- Flexible sizing with size props
- Touch-friendly interaction areas
- Proper spacing using theme.layoutSpacing

### Accessibility

Components follow accessibility best practices:
- Proper ARIA labels
- Keyboard navigation support
- Tooltips for additional context
- High contrast color choices

### Loading States

Components that fetch data include loading states:
- Skeleton loaders for icons
- Disabled states for selectors
- Loading indicators where appropriate

---

## Testing

Unit tests should be created for these components (Task 10.3 - optional).

**Test Coverage Should Include:**
- Component rendering with various props
- User interactions (clicks, selections)
- Loading and error states
- Accessibility features
- Theme integration

---

## Integration with Backend

These components integrate with the following backend endpoints:

**VersionsController:**
- `GET /api/v2/game-data/versions/` - List all versions
- `GET /api/v2/game-data/versions/active` - Get active versions
- `POST /api/v2/game-data/versions/select` - Select version

See backend documentation: `sc-market-backend/docs/task-6.2-versions-controller-implementation.md`

---

## Future Enhancements

Potential improvements for future iterations:

1. **VersionSelector:**
   - Quick toggle button between LIVE and PTU
   - Version comparison view
   - Data freshness warnings

2. **GameItemIcon:**
   - Image lazy loading
   - Progressive image loading
   - Zoom on hover

3. **QualityBadge:**
   - Animated quality transitions
   - Quality range display (min-max)

4. **CategoryFilter:**
   - Search within categories
   - Hierarchical category trees
   - Collapsible category groups

5. **General:**
   - Internationalization (i18n) support
   - Custom theme overrides
   - Animation transitions
