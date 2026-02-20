# Embed Facades

This directory contains facade components for heavy third-party embeds. Facades improve page load performance by deferring the loading of embed scripts until user interaction.

## Components

### YouTubeFacade

A lightweight facade for YouTube video embeds that shows a preview thumbnail and only loads the full YouTube player when the user clicks to play.

**Benefits:**

- Reduces initial page load by ~500KB (YouTube iframe API)
- Improves LCP by not loading heavy iframe content
- Reduces network requests on initial page load
- Provides instant visual feedback with thumbnail

**Usage:**

```tsx
import { YouTubeFacade } from "../embeds/YouTubeFacade"

function MyComponent() {
  return <YouTubeFacade videoId="dQw4w9WgXcQ" />
}
```

**Props:**

- `videoId` (required): YouTube video ID
- `title` (optional): Accessible title for the video

### EmbedFacade

A generic facade component for any heavy embed. Shows a placeholder with a loading message until the user clicks to activate.

**Usage:**

```tsx
import { EmbedFacade } from "../embeds/EmbedFacade"

function MyComponent() {
  return (
    <EmbedFacade
      title="Interactive Map"
      onActivate={() => {
        // Load your heavy embed here
      }}
    >
      {(isActive) => (isActive ? <HeavyMapComponent /> : null)}
    </EmbedFacade>
  )
}
```

**Props:**

- `title` (required): Display title for the embed
- `onActivate` (optional): Callback when user activates the embed
- `children`: Render function receiving `isActive` boolean

## Performance Impact

Using embed facades can significantly improve Core Web Vitals:

- **LCP (Largest Contentful Paint)**: Reduced by not loading heavy iframe content during initial render
- **TBT (Total Blocking Time)**: Reduced by deferring JavaScript execution
- **Network Usage**: Fewer requests and less data transferred on initial page load

## Implementation Pattern

The facade pattern follows these principles:

1. **Show lightweight preview**: Display a static image or placeholder
2. **Defer heavy loading**: Only load the actual embed when needed
3. **User-initiated**: Require explicit user interaction to activate
4. **Graceful degradation**: Provide clear indication of what will load

## Adding New Facades

To create a new facade for a different embed type:

1. Create a new component file (e.g., `MapFacade.tsx`)
2. Use `EmbedFacade` as a base or create a custom implementation
3. Ensure the facade shows a meaningful preview
4. Load the heavy embed only on user interaction
5. Export from `index.ts`

Example:

```tsx
import React, { useState } from "react"
import { EmbedFacade } from "./EmbedFacade"

export function MapFacade({ location }: { location: string }) {
  const [isActive, setIsActive] = useState(false)

  return (
    <EmbedFacade
      title={`Map of ${location}`}
      onActivate={() => setIsActive(true)}
    >
      {(active) =>
        active ? (
          <iframe
            src={`https://maps.example.com/embed?q=${location}`}
            width="100%"
            height="400"
          />
        ) : null
      }
    </EmbedFacade>
  )
}
```

## Testing

When testing components that use facades:

- Test that the facade renders initially
- Test that clicking activates the embed
- Test that the heavy content only loads after activation
- Mock heavy dependencies to keep tests fast

## References

- [Facade Pattern for Third-Party Embeds](https://web.dev/third-party-facades/)
- [Lazy Loading Third-Party Resources](https://web.dev/embed-best-practices/)
