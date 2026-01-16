# Animation Components

Reusable components and hooks for smooth animations and visual enhancements.

## What's New vs Material-UI

### Material-UI Provides (Already Available)

- **`Fade`**, **`Grow`**, **`Slide`** - Transition components from `@mui/material`
- **`Skeleton`** - Loading placeholders
- **CSS transitions** - Built into Material-UI components via `sx` prop
- **Grid system** - Layout system (Grid container → Grid items)

### New Custom Components (What We Built)

- **`AnimatedListItem`** - Grid-compatible wrapper for staggered list animations
- **`PageTransition`** - Custom page transition component
- **`ParallaxContainer`** - Performance-conscious parallax effect
- **`ImageZoomPan`** - Image zoom/pan functionality
- **`AnimatedButton`** - Button with micro-interactions
- **`useMicroInteractions`** - Hook for press feedback

## Existing Patterns in Codebase

The codebase already uses Material-UI's `Fade` component for staggered animations:

```tsx
// Existing pattern (from ItemListings.tsx, ListingSkeleton):
<Grid item xs={12} md={6}>
  <Fade
    in={true}
    style={{
      transitionDelay: `${50 + 50 * index}ms`,
      transitionDuration: "500ms",
    }}
  >
    <Skeleton variant="rectangular" height={400} />
  </Fade>
</Grid>
```

**Important**: Material-UI Grid containers require direct Grid item children. Wrapping Grid items breaks the layout.

## Components

### AnimatedListItem

**NEW** - Grid-compatible wrapper for staggered animations. Works with existing Grid item structure.

```tsx
import { AnimatedListItem } from "../../components/animations"

// Usage: Wrap components that DON'T already have animations
{
  items.map((item, index) => (
    <AnimatedListItem key={item.id} index={index} in={!loading}>
      <Grid item xs={12} md={6}>
        <YourComponent item={item} />
      </Grid>
    </AnimatedListItem>
  ))
}
```

**How it works:**

- Detects if child is a Grid item (or component returning Grid item)
- Applies animation styles directly via `sx` prop (no wrapper elements)
- Preserves Grid layout structure
- Uses CSS transitions (not Material-UI transitions) for Grid compatibility

**Important**: Only use for components that DON'T already have animations. Many listing components (like `ItemListingBase`, `AggregateListingBase`) already use Material-UI's `Fade` component internally, so wrapping them with `AnimatedListItem` would create duplicate animations.

### PageTransition

**NEW** - Custom page transition component (CSS-only, React 19 compatible).

```tsx
import { PageTransition } from "../../components/animations"
;<PageTransition in={true} variant="fade" timeout={300}>
  <YourPageContent />
</PageTransition>
```

**Variants:**

- `fade` - Simple fade in/out (default)
- `slide` - Slide in from right
- `slideUp` - Slide up from bottom

### ParallaxContainer

**NEW** - Performance-conscious parallax effect (disabled on mobile).

```tsx
import { ParallaxContainer } from "../../components/animations"
;<ParallaxContainer speed={0.5}>
  <YourContent />
</ParallaxContainer>
```

**Props:**

- `speed` - Parallax speed (0-1, default: 0.5)
- `disabled` - Disable parallax effect

### ImageZoomPan

**NEW** - Zoom and pan functionality for product images.

```tsx
import { ImageZoomPan } from "../../components/animations"
;<ImageZoomPan src={imageUrl} alt="Product image" maxZoom={3} minZoom={1} />
```

**Features:**

- Mouse wheel zoom (Ctrl/Cmd + scroll)
- Touch pinch zoom on mobile
- Drag to pan when zoomed
- Zoom controls (zoom in/out/reset)

### AnimatedButton

**NEW** - Button with micro-interaction feedback.

```tsx
import { AnimatedButton } from "../../components/animations"
;<AnimatedButton variant="contained" onClick={handleClick}>
  Click Me
</AnimatedButton>
```

## Hooks

### useMicroInteractions

**NEW** - Provides button press feedback and hover effects.

```tsx
import { useMicroInteractions } from "../../hooks/animations"

function MyButton() {
  const { sx, onMouseDown, onMouseUp, onMouseLeave } = useMicroInteractions({
    scale: 0.95,
    duration: 150,
  })

  return (
    <Button
      sx={sx}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      Click Me
    </Button>
  )
}
```

## Grid Layout Requirements

**CRITICAL**: Material-UI Grid containers require direct Grid item children. Wrapping Grid items breaks layouts.

### Existing Pattern (Material-UI Fade)

```tsx
// ✅ Works: Fade inside Grid item
<Grid item xs={12} md={6}>
  <Fade in={true} style={{ transitionDelay: `${50 * index}ms` }}>
    <Card>Content</Card>
  </Fade>
</Grid>
```

### New Pattern (AnimatedListItem)

```tsx
// ✅ Works: AnimatedListItem applies styles directly to Grid item
<AnimatedListItem index={index} in={true}>
  <ItemListing listing={item} index={index} /> {/* Returns Grid item */}
</AnimatedListItem>
```

**How AnimatedListItem works:**

- Detects Grid items (or components returning Grid items)
- Clones element with animation styles in `sx` prop
- Preserves Grid structure (no wrapper elements)
- Falls back to div wrapper only for non-Grid children

## Enhanced Components

### ImagePreviewModal

Enhanced lightbox gallery with:

- Image navigation (arrow keys, buttons)
- Thumbnail strip
- Zoom/pan support (optional)
- Keyboard navigation (Arrow keys, Escape)

```tsx
<ImagePreviewModal
  images={imageArray}
  open={isOpen}
  onClose={handleClose}
  index={currentIndex}
  enableZoom={true}
  showThumbnails={true}
/>
```

## Performance Notes

- All animations use CSS transforms (GPU-accelerated)
- Parallax is automatically disabled on mobile
- Intersection Observer used for efficient scroll detection
- `will-change` property used sparingly for performance
- Animations respect `prefers-reduced-motion` (via Material-UI theme)

## Usage Examples

### Page Transitions

Already integrated in `App.tsx` - automatically applies to all route changes.

### List Animations

```tsx
{
  items.map((item, index) => (
    <AnimatedListItem key={item.id} index={index} in={true}>
      <Card>
        <CardContent>{item.title}</CardContent>
      </Card>
    </AnimatedListItem>
  ))
}
```

### Parallax Hero Section

```tsx
<ParallaxContainer speed={0.3}>
  <HeroSection />
</ParallaxContainer>
```

### Product Image with Zoom

```tsx
<ImageZoomPan src={productImage} alt={productName} maxZoom={4} />
```
