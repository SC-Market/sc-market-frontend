# Animation Components

Reusable components and hooks for smooth animations and visual enhancements.

## Components

### PageTransition
Smooth fade/slide transitions between routes.

```tsx
import { PageTransition } from "../../components/animations"

<PageTransition in={true} variant="fade" timeout={300}>
  <YourPageContent />
</PageTransition>
```

**Variants:**
- `fade` - Simple fade in/out (default)
- `slide` - Slide in from right
- `slideUp` - Slide up from bottom

### AnimatedListItem
Staggered fade-in animations for list items.

```tsx
import { AnimatedListItem } from "../../components/animations"

{items.map((item, index) => (
  <AnimatedListItem key={item.id} index={index} in={true}>
    <YourListItemComponent item={item} />
  </AnimatedListItem>
))}
```

### ParallaxContainer
Performance-conscious parallax effect (disabled on mobile).

```tsx
import { ParallaxContainer } from "../../components/animations"

<ParallaxContainer speed={0.5}>
  <YourContent />
</ParallaxContainer>
```

**Props:**
- `speed` - Parallax speed (0-1, default: 0.5)
- `disabled` - Disable parallax effect

### ImageZoomPan
Zoom and pan functionality for product images.

```tsx
import { ImageZoomPan } from "../../components/animations"

<ImageZoomPan
  src={imageUrl}
  alt="Product image"
  maxZoom={3}
  minZoom={1}
/>
```

**Features:**
- Mouse wheel zoom (Ctrl/Cmd + scroll)
- Touch pinch zoom on mobile
- Drag to pan when zoomed
- Zoom controls (zoom in/out/reset)

### AnimatedButton
Button with micro-interaction feedback.

```tsx
import { AnimatedButton } from "../../components/animations"

<AnimatedButton variant="contained" onClick={handleClick}>
  Click Me
</AnimatedButton>
```

## Hooks

### useMicroInteractions
Provides button press feedback and hover effects.

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
{items.map((item, index) => (
  <AnimatedListItem key={item.id} index={index} in={true}>
    <Card>
      <CardContent>{item.title}</CardContent>
    </Card>
  </AnimatedListItem>
))}
```

### Parallax Hero Section
```tsx
<ParallaxContainer speed={0.3}>
  <HeroSection />
</ParallaxContainer>
```

### Product Image with Zoom
```tsx
<ImageZoomPan
  src={productImage}
  alt={productName}
  maxZoom={4}
/>
```
