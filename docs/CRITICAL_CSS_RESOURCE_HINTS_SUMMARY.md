# Critical CSS and Resource Hints Implementation Summary

This document summarizes the critical CSS extraction and resource hints implementation for the SC Market frontend application.

## Overview

Critical CSS extraction and resource hints optimize the critical rendering path by:

1. Inlining above-the-fold CSS to eliminate render-blocking requests
2. Providing browser hints to optimize resource loading priority
3. Prefetching likely next-page resources during idle time

## Implementation Details

### 1. Critical CSS Extraction (Critters)

**Plugin:** `critters` via custom Vite plugin wrapper

**Configuration:**

```typescript
{
  inline: true,              // Inline critical CSS in HTML
  width: 1920,              // Desktop viewport width
  height: 1080,             // Desktop viewport height
  preload: 'media',         // Preload non-critical CSS with media attribute
  inlineThreshold: 10240,   // Inline CSS up to 10KB
  pruneSource: false,       // Keep original CSS files
  mergeStylesheets: true,   // Merge multiple stylesheets
  compress: true,           // Minify inlined CSS
  logLevel: 'warn'          // Only show warnings
}
```

**How it works:**

1. During production build, Critters analyzes the HTML
2. Identifies CSS rules needed for above-the-fold content
3. Inlines critical CSS in `<style>` tags in the HTML head
4. Converts non-critical CSS to async loading with `<link rel="preload">`
5. Original CSS files remain available for progressive enhancement

**Benefits:**

- Eliminates render-blocking CSS requests
- Improves First Contentful Paint (FCP)
- Reduces Largest Contentful Paint (LCP)
- Better perceived performance on slow connections

### 2. Resource Hints

Added to `index.html` in the `<head>` section:

#### DNS Prefetch

```html
<link rel="dns-prefetch" href="https://sc-market.space" />
<link rel="dns-prefetch" href="https://sessions.bugsnag.com" />
```

- Resolves DNS early for third-party domains
- Reduces connection latency when resources are requested

#### Preconnect

```html
<link rel="preconnect" href="https://sc-market.space" crossorigin />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

- Establishes early connections (DNS + TCP + TLS)
- Critical for API calls and font loading
- `crossorigin` attribute required for CORS resources

#### Prefetch

```html
<link rel="prefetch" href="/assets/market-*.js" as="script" />
<link rel="prefetch" href="/assets/mui-common-*.js" as="script" />
```

- Fetches likely next-page resources during idle time
- Low priority - doesn't compete with critical resources
- Improves navigation to market pages

### 3. Font Preloading (Already Implemented)

```html
<link
  rel="preload"
  href="/fonts/roboto-v30-latin-regular.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
<link
  rel="preload"
  href="/fonts/roboto-v30-latin-500.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

- Preloads critical fonts to prevent FOIT (Flash of Invisible Text)
- Uses WOFF2 format for optimal compression
- `crossorigin` required even for same-origin fonts

## Performance Impact

### Before Implementation

- Multiple render-blocking CSS requests
- DNS lookups delay third-party resource loading
- Cold navigation to market pages requires full resource download

### After Implementation

- ✅ Critical CSS inlined - no render-blocking CSS
- ✅ DNS resolved early for third-party domains
- ✅ Connections established before resources needed
- ✅ Next-page resources prefetched during idle time

### Expected Improvements

- **FCP:** 10-20% faster (no CSS blocking)
- **LCP:** 15-25% faster (fonts and images load sooner)
- **Navigation:** 30-50% faster (prefetched resources)

## Verification

### Check Critical CSS Inlining

1. Build for production: `npm run build`
2. Inspect `dist/index.html`
3. Look for `<style>` tags with inlined CSS
4. Verify `<link rel="preload" as="style">` for non-critical CSS

### Check Resource Hints

1. Open Chrome DevTools → Network tab
2. Filter by "All" or "Other"
3. Look for early DNS/connection requests
4. Verify prefetch requests during idle time

### Measure Performance

1. Open Chrome DevTools → Lighthouse
2. Run performance audit
3. Check "Eliminate render-blocking resources" metric
4. Verify "Preconnect to required origins" passes

## Browser Support

- **Critical CSS:** All modern browsers (Critters generates standard CSS)
- **dns-prefetch:** All browsers (graceful degradation)
- **preconnect:** Chrome 46+, Firefox 39+, Safari 11.1+
- **prefetch:** Chrome 8+, Firefox 2+, Safari 13+

## Maintenance

### Adding New Third-Party Domains

1. Add `dns-prefetch` for all third-party domains
2. Add `preconnect` for critical third-party resources (API, fonts)
3. Test impact on connection timing

### Adding New Route Prefetch

1. Identify high-traffic navigation patterns
2. Add prefetch hints for likely next routes
3. Use wildcard patterns for hashed filenames
4. Monitor prefetch cache hit rate

### Updating Critical CSS Configuration

1. Adjust viewport dimensions if targeting different devices
2. Modify `inlineThreshold` based on CSS size
3. Test with different pages to ensure coverage

## Related Files

- `vite.config.ts` - Critters plugin configuration
- `index.html` - Resource hints in HTML head
- `.kiro/specs/core-web-vitals-optimization/design.md` - Design document
- `.kiro/specs/core-web-vitals-optimization/requirements.md` - Requirements

## Requirements Satisfied

- ✅ 4.1 - Extract and inline critical CSS for above-the-fold content
- ✅ 4.2 - Configure async loading for non-critical CSS
- ✅ 4.3 - Add resource hints (dns-prefetch, preconnect, prefetch)
- ✅ 4.4 - Configure deferred loading for non-critical scripts (see DEFERRED_LOADING_GUIDE.md)

## Next Steps

1. Monitor Core Web Vitals metrics in production
2. Adjust prefetch patterns based on navigation analytics
3. Consider adding more route-specific prefetch hints
4. Evaluate mobile viewport dimensions for critical CSS
