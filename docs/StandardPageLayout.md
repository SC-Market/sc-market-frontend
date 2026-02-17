# StandardPageLayout Usage Guide

## Overview

`StandardPageLayout` is the base layout component for all pages in the application. It provides a consistent structure with metadata, breadcrumbs, header, and content areas, along with built-in loading and error handling.

## Basic Usage

```tsx
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

function MyPage() {
  return (
    <StandardPageLayout
      title="My Page"
      headerTitle="Welcome to My Page"
    >
      <div>Page content goes here</div>
    </StandardPageLayout>
  )
}
```

## Props Reference

### Metadata Props

#### `title?: string | null`
Sets the document title (shown in browser tab). Also used for SEO.

```tsx
<StandardPageLayout title="Market Listings">
  {/* ... */}
</StandardPageLayout>
```

#### `canonicalUrl?: string`
Sets the canonical URL for SEO purposes.

```tsx
<StandardPageLayout 
  title="Market Listing"
  canonicalUrl="https://example.com/market/123"
>
  {/* ... */}
</StandardPageLayout>
```

#### `dontUseDefaultCanonUrl?: boolean`
Prevents automatic canonical URL generation. Use when you need full control over canonical URLs.

```tsx
<StandardPageLayout 
  title="Dynamic Page"
  dontUseDefaultCanonUrl={true}
>
  {/* ... */}
</StandardPageLayout>
```

### Breadcrumb Props

#### `breadcrumbs?: BreadcrumbItem[]`
Array of breadcrumb items for navigation hierarchy.

```tsx
interface BreadcrumbItem {
  label: string
  href?: string
  icon?: ReactNode
}

<StandardPageLayout
  title="Market Listing"
  breadcrumbs={[
    { label: "Home", href: "/" },
    { label: "Market", href: "/market" },
    { label: "Listing Details" }
  ]}
>
  {/* ... */}
</StandardPageLayout>
```

**Note:** The last breadcrumb (current page) typically has no `href`.

### Header Props

#### `headerTitle?: ReactNode`
Main title displayed at the top of the page content. Can be a string or custom component.

```tsx
<StandardPageLayout
  title="Market"
  headerTitle="Browse Market Listings"
>
  {/* ... */}
</StandardPageLayout>
```

With custom component:
```tsx
<StandardPageLayout
  title="Market"
  headerTitle={
    <Box display="flex" alignItems="center" gap={1}>
      <ShoppingCartIcon />
      <Typography variant="h4">Market</Typography>
    </Box>
  }
>
  {/* ... */}
</StandardPageLayout>
```

#### `headerActions?: ReactNode`
Actions displayed in the header (typically buttons). Automatically aligned to the right.

```tsx
<StandardPageLayout
  title="Market"
  headerTitle="My Listings"
  headerActions={
    <Button variant="contained" onClick={handleCreate}>
      Create Listing
    </Button>
  }
>
  {/* ... */}
</StandardPageLayout>
```

### Layout Configuration Props

#### `sidebarOpen?: boolean`
Controls whether the sidebar is open. Default: `true`.

```tsx
<StandardPageLayout
  title="Full Width Page"
  sidebarOpen={false}
>
  {/* ... */}
</StandardPageLayout>
```

#### `sidebarWidth?: number`
Custom sidebar width in pixels. Overrides the default theme value.

```tsx
<StandardPageLayout
  title="Custom Sidebar"
  sidebarWidth={300}
>
  {/* ... */}
</StandardPageLayout>
```

#### `maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false`
Maximum width of the content container. Default: `"lg"`.

```tsx
// Narrow content (forms, reading)
<StandardPageLayout
  title="Login"
  maxWidth="sm"
>
  {/* ... */}
</StandardPageLayout>

// Wide content (tables, dashboards)
<StandardPageLayout
  title="Dashboard"
  maxWidth="xl"
>
  {/* ... */}
</StandardPageLayout>

// Full width (no max width constraint)
<StandardPageLayout
  title="Full Width"
  maxWidth={false}
>
  {/* ... */}
</StandardPageLayout>
```

#### `noFooter?: boolean`
Hides the footer. Default: `false`.

```tsx
<StandardPageLayout
  title="Minimal Page"
  noFooter={true}
>
  {/* ... */}
</StandardPageLayout>
```

#### `noSidebar?: boolean`
Hides the sidebar completely. Default: `false`.

```tsx
<StandardPageLayout
  title="Landing Page"
  noSidebar={true}
>
  {/* ... */}
</StandardPageLayout>
```

#### `noMobilePadding?: boolean`
Removes padding on mobile devices for full-width content. Default: `false`.

```tsx
<StandardPageLayout
  title="Mobile Full Width"
  noMobilePadding={true}
>
  {/* ... */}
</StandardPageLayout>
```

#### `noTopSpacer?: boolean`
Removes top spacing above content. Default: `false`.

```tsx
<StandardPageLayout
  title="Compact Page"
  noTopSpacer={true}
>
  {/* ... */}
</StandardPageLayout>
```

### Content Props

#### `children: ReactNode`
The main page content. **Required**.

```tsx
<StandardPageLayout title="My Page">
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <Typography>Content here</Typography>
    </Grid>
  </Grid>
</StandardPageLayout>
```

### Loading and Error Props

#### `isLoading?: boolean`
Indicates the page is loading data. When `true` and `skeleton` is provided, shows the skeleton instead of children.

```tsx
<StandardPageLayout
  title="Market Listing"
  isLoading={isLoading}
  skeleton={<MarketListingSkeleton />}
>
  <MarketListingContent data={data} />
</StandardPageLayout>
```

#### `error?: FetchBaseQueryError | SerializedError | unknown`
Error object from data fetching. Automatically handles 404 and server errors.

```tsx
<StandardPageLayout
  title="Market Listing"
  error={error}
>
  <MarketListingContent data={data} />
</StandardPageLayout>
```

**Error Handling:**
- 404 errors: Automatically redirects to `/404`
- Server errors (5xx): Shows error page
- Other errors: Page renders normally (handle in content)

#### `skeleton?: ReactNode`
Skeleton component to show during loading.

```tsx
<StandardPageLayout
  title="Market Listing"
  isLoading={isLoading}
  skeleton={<MarketListingSkeleton />}
>
  <MarketListingContent data={data} />
</StandardPageLayout>
```

## Common Use Cases

### Simple List Page

```tsx
function MyListingsPage() {
  const { data, isLoading, error } = useGetMyListingsQuery()

  return (
    <StandardPageLayout
      title="My Listings"
      headerTitle="My Market Listings"
      headerActions={
        <Button variant="contained" href="/market/create">
          Create Listing
        </Button>
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Market", href: "/market" },
        { label: "My Listings" }
      ]}
      isLoading={isLoading}
      error={error}
      skeleton={<ListingsSkeleton />}
    >
      <ListingsGrid listings={data} />
    </StandardPageLayout>
  )
}
```

### Dashboard Page with Tabs

```tsx
function DashboardPage() {
  const [tab, setTab] = useState(0)

  return (
    <StandardPageLayout
      title="Dashboard"
      headerTitle="My Dashboard"
      maxWidth="xl"
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab label="Overview" />
            <Tab label="Analytics" />
          </Tabs>
        </Grid>
        <Grid item xs={12}>
          {tab === 0 && <OverviewTab />}
          {tab === 1 && <AnalyticsTab />}
        </Grid>
      </Grid>
    </StandardPageLayout>
  )
}
```

### Landing Page (No Sidebar/Footer)

```tsx
function LandingPage() {
  return (
    <StandardPageLayout
      title="Welcome"
      noSidebar={true}
      noFooter={true}
      maxWidth={false}
    >
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </StandardPageLayout>
  )
}
```

### Page with Dynamic Breadcrumbs

```tsx
function MarketListingPage() {
  const { id } = useParams()
  const { data, isLoading, error } = usePageMarketListing(id)

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Market", href: "/market" },
    { label: data?.title || "Loading..." }
  ]

  return (
    <StandardPageLayout
      title={data?.title || "Market Listing"}
      breadcrumbs={breadcrumbs}
      isLoading={isLoading}
      error={error}
      skeleton={<MarketListingSkeleton />}
    >
      <MarketListingContent data={data} />
    </StandardPageLayout>
  )
}
```

## Best Practices

1. **Always provide a title**: This is important for SEO and browser tabs.

2. **Use breadcrumbs for deep pages**: Help users understand where they are in the navigation hierarchy.

3. **Provide skeletons for loading states**: Improves perceived performance and prevents layout shift.

4. **Handle errors at the layout level**: Let StandardPageLayout handle 404 and server errors automatically.

5. **Choose appropriate maxWidth**: 
   - `sm` for forms and reading content
   - `lg` (default) for most pages
   - `xl` for data-heavy pages
   - `false` for full-width layouts

6. **Use headerActions for primary actions**: Keep the most important actions visible in the header.

7. **Keep children simple**: Complex logic should be in child components, not in the layout.

## Migration from Old Pattern

### Before (Old Pattern)
```tsx
function OldPage() {
  const { data, isLoading, error } = useGetDataQuery()

  if (isLoading) return <Skeleton />
  if (error) return <ErrorPage />

  return (
    <Page title="My Page">
      <ContainerGrid>
        <Grid item xs={12}>
          <PageBreadcrumbs items={breadcrumbs} />
        </Grid>
        <Grid item xs={12}>
          <HeaderTitle>My Page</HeaderTitle>
        </Grid>
        <Grid item xs={12}>
          <Content data={data} />
        </Grid>
      </ContainerGrid>
    </Page>
  )
}
```

### After (New Pattern)
```tsx
function NewPage() {
  const { data, isLoading, error } = useGetDataQuery()

  return (
    <StandardPageLayout
      title="My Page"
      headerTitle="My Page"
      breadcrumbs={breadcrumbs}
      isLoading={isLoading}
      error={error}
      skeleton={<ContentSkeleton />}
    >
      <Content data={data} />
    </StandardPageLayout>
  )
}
```

## Related Components

- **DetailPageLayout**: Extends StandardPageLayout for entity detail pages with back button
- **FormPageLayout**: Extends StandardPageLayout for form pages with form actions
- **LazySection**: Wrap content sections for lazy loading within StandardPageLayout
