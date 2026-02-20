# Deferred Loading Implementation Guide

This document describes the deferred loading strategy implemented for non-critical scripts in the SC Market frontend application.

## Overview

Deferred loading ensures that non-critical JavaScript doesn't block the critical rendering path, improving initial page load performance and Core Web Vitals metrics (particularly FCP and LCP).

## Implementation Status

✅ **All non-critical scripts are configured for deferred loading**

## Key Components

### 1. Third-Party Script Loader (`src/util/scripts/thirdPartyScripts.ts`)

Provides utilities for loading external scripts with async/defer attributes:

- `loadScript()` - Load individual scripts with async/defer
- `loadScriptsSequentially()` - Load multiple scripts in sequence
- `loadScriptsParallel()` - Load multiple scripts in parallel
- `removeScript()` - Remove loaded scripts

**Features:**

- Prevents duplicate script loading
- Supports custom attributes
- Promise-based API for easy integration
- Error handling with callbacks

### 2. Bugsnag Async Loader (`src/util/monitoring/bugsnagLoader.ts`)

Optimized Bugsnag initialization that doesn't block rendering:

- Loads Bugsnag modules dynamically after page interactive
- Uses `onPageInteractive()` to delay initialization
- Provides fallback error boundary if Bugsnag fails to load
- Gracefully handles initialization failures

**Key Functions:**

- `initializeBugsnagAsync()` - Initialize Bugsnag after page interactive
- `getBugsnagErrorBoundary()` - Get error boundary with fallback
- `notifyBugsnag()` - Report errors (only if initialized)

### 3. Delayed Script Loader (`src/util/scripts/delayedScriptLoader.ts`)

Provides timing utilities for delaying script execution:

- `onPageInteractive()` - Execute callback when page is interactive
- Uses `requestIdleCallback` with fallback to `setTimeout`
- Ensures scripts load during browser idle time

## Script Loading Strategy

### Critical Scripts (Loaded Immediately)

- React core bundle
- MUI core styles
- Redux store
- Router configuration

### Non-Critical Scripts (Deferred Loading)

1. **Analytics** - Loaded after page interactive
2. **Bugsnag** - Loaded after page interactive with fallback
3. **Third-party embeds** - Loaded on user interaction (facade pattern)

## ES Module Benefits

The application uses ES modules (`type="module"` in script tags), which provides:

- **Automatic defer behavior** - ES modules are deferred by default
- **Dependency resolution** - Browser handles module dependencies
- **Tree shaking** - Unused code is eliminated at build time

## Verification

To verify deferred loading is working:

1. Open Chrome DevTools → Performance tab
2. Record page load
3. Check "Main" thread timeline
4. Verify non-critical scripts execute after FCP/LCP

Expected behavior:

- Analytics scripts appear after page interactive event
- Bugsnag initialization happens during idle time
- No long tasks blocking initial render

## Performance Impact

Deferred loading provides:

- **Faster FCP** - Critical rendering path not blocked
- **Improved LCP** - Resources prioritized for above-fold content
- **Better INP** - Main thread available for user interactions
- **Reduced TBT** - Long tasks deferred to idle time

## Best Practices

When adding new third-party scripts:

1. Use `loadScript()` utility with `async: true`
2. Delay initialization with `onPageInteractive()`
3. Provide fallback behavior if script fails
4. Test impact on Core Web Vitals

## Related Files

- `src/util/scripts/thirdPartyScripts.ts` - Script loading utilities
- `src/util/monitoring/bugsnagLoader.ts` - Bugsnag async loader
- `src/util/scripts/delayedScriptLoader.ts` - Timing utilities
- `src/index.tsx` - Application entry point with Bugsnag initialization

## Requirements Satisfied

- ✅ 4.4 - Configure deferred loading for non-critical scripts
- ✅ 7.1 - Configure async/defer for third-party scripts
- ✅ 7.2 - Delay analytics loading until page interactive
- ✅ 7.4 - Optimize Bugsnag loading
