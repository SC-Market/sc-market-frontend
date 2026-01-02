# Mobile UI Components

A collection of reusable components optimized for mobile experiences. These components automatically adapt to desktop and mobile screens, providing the best UX for each platform.

## Components

### BottomSheet

A mobile-friendly modal that slides up from the bottom. Better UX than full-screen modals on mobile devices.

**Features:**

- Slides up from bottom on mobile
- Drag handle indicator
- Safe area support for iOS
- Falls back to regular drawer on desktop

**Usage:**

```tsx
import { BottomSheet } from "../components/mobile"

function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <BottomSheet
      open={open}
      onClose={() => setOpen(false)}
      title="Filters"
      showCloseButton={true}
    >
      <YourFilterContent />
    </BottomSheet>
  )
}
```

### SwipeableCard

A card that can be swiped left/right to reveal actions. Perfect for mobile interactions.

**Features:**

- Swipe left/right to reveal actions
- Smooth animations
- Only active on mobile
- Customizable threshold

**Usage:**

```tsx
import { SwipeableCard } from "../components/mobile"
import { IconButton } from "@mui/material"
import { Delete, Edit } from "@mui/icons-material"

function MyCard() {
  return (
    <SwipeableCard
      leftActions={
        <IconButton onClick={handleEdit}>
          <Edit />
        </IconButton>
      }
      rightActions={
        <IconButton onClick={handleDelete}>
          <Delete />
        </IconButton>
      }
      onSwipeLeft={handleDelete}
      onSwipeRight={handleEdit}
    >
      <CardContent>
        <Typography>Card Content</Typography>
      </CardContent>
    </SwipeableCard>
  )
}
```

### CollapsibleHeader

A sticky header that collapses on scroll. Provides more screen space while maintaining navigation.

**Features:**

- Collapses on scroll
- Multiple variants: slide, fade, shrink
- Configurable threshold
- Only active on mobile

**Usage:**

```tsx
import { CollapsibleHeader } from "../components/mobile"

function MyPage() {
  return (
    <>
      <CollapsibleHeader
        variant="slide"
        threshold={100}
        collapsedHeight={56}
        expandedHeight={64}
      >
        <Toolbar>
          <Typography variant="h6">My App</Typography>
        </Toolbar>
      </CollapsibleHeader>
      <MainContent />
    </>
  )
}
```

### MobileFAB

Floating Action Button optimized for mobile. Automatically positions above bottom navigation.

**Features:**

- Automatic positioning above bottom nav
- Safe area support
- Multiple positions
- Responsive sizing

**Usage:**

```tsx
import { MobileFAB } from "../components/mobile"
import { Add } from "@mui/icons-material"

function MyPage() {
  return (
    <>
      <MainContent />
      <MobileFAB
        color="primary"
        position="bottom-right"
        onClick={handleAdd}
        aboveBottomNav={true}
      >
        <Add />
      </MobileFAB>
    </>
  )
}
```

### InlineEdit

Tap to edit, save on blur. Perfect for quick edits on mobile.

**Features:**

- Tap to edit
- Save on blur
- Keyboard shortcuts (Enter to save, Escape to cancel)
- Validation support
- Custom display component

**Usage:**

```tsx
import { InlineEdit } from "../components/mobile"

function MyComponent() {
  const [value, setValue] = useState("Initial Value")

  return (
    <InlineEdit
      value={value}
      onSave={async (newValue) => {
        await saveToBackend(newValue)
        setValue(newValue)
      }}
      placeholder="Click to edit"
      validate={(val) => {
        if (val.length < 3) return "Must be at least 3 characters"
        return null
      }}
    />
  )
}
```

### MobileSidebarWrapper

Wraps sidebar content to show as BottomSheet on mobile, Drawer on desktop. Automatically handles responsive behavior.

**Features:**

- Automatic mobile/desktop switching
- BottomSheet on mobile
- Drawer on desktop
- Consistent API

**Usage:**

```tsx
import { MobileSidebarWrapper } from "../components/mobile"

function MySidebar() {
  const [open, setOpen] = useState(false)

  return (
    <MobileSidebarWrapper
      open={open}
      onClose={() => setOpen(false)}
      title="Filters"
      drawerWidth={300}
    >
      <YourSidebarContent />
    </MobileSidebarWrapper>
  )
}
```

## Best Practices

1. **Always test on mobile devices** - These components are designed for mobile, so test on real devices
2. **Use appropriate components** - BottomSheet for modals, SwipeableCard for lists, etc.
3. **Consider safe areas** - Components automatically handle iOS safe areas
4. **Performance** - Components only activate on mobile, so desktop performance is unaffected
5. **Accessibility** - All components include proper ARIA labels and keyboard support

## Integration Examples

### Converting a Modal to BottomSheet

```tsx
// Before
;<Dialog open={open} onClose={onClose}>
  <DialogContent>Content</DialogContent>
</Dialog>

// After
import { BottomSheet } from "../components/mobile"
;<BottomSheet open={open} onClose={onClose} title="Modal Title">
  <YourContent />
</BottomSheet>
```

### Adding Swipe Actions to Cards

```tsx
// Before
;<Card>
  <CardContent>Content</CardContent>
</Card>

// After
import { SwipeableCard } from "../components/mobile"
;<SwipeableCard
  rightActions={
    <IconButton onClick={handleDelete}>
      <Delete />
    </IconButton>
  }
>
  <CardContent>Content</CardContent>
</SwipeableCard>
```

### Making Headers Collapsible

```tsx
// Before
;<AppBar position="sticky">
  <Toolbar>Header</Toolbar>
</AppBar>

// After
import { CollapsibleHeader } from "../components/mobile"
;<CollapsibleHeader>
  <Toolbar>Header</Toolbar>
</CollapsibleHeader>
```
