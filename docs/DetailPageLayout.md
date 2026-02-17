# DetailPageLayout Usage Guide

## Overview

`DetailPageLayout` extends `StandardPageLayout` specifically for entity detail pages. It adds a back button and entity-specific header elements (title, subtitle, actions) that are commonly needed when viewing individual items like market listings, orders, or organizations.

## Basic Usage

```tsx
import { DetailPageLayout } from "../../components/layout/DetailPageLayout"

function ViewMarketListing() {
  const { id } = useParams()
  const { data, isLoading, error } = usePageMarketListing(id)

  return (
    <DetailPageLayout
      title={data?.title || "Market Listing"}
      backButton={true}
      entityTitle={data?.title}
      entitySubtitle={`Listed by ${data?.seller}`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Market", href: "/market" },
        { label: data?.title || "Loading..." }
      ]}
      isLoading={isLoading}
      error={error}
      skeleton={<MarketListingSkeleton />}
    >
      <MarketListingDetails listing={data} />
    </DetailPageLayout>
  )
}
```

## Props Reference

DetailPageLayout accepts all props from `StandardPageLayout` plus the following:

### Navigation Props

#### `backButton?: boolean`
Shows a back arrow button in the header. Default: `false`.

```tsx
<DetailPageLayout
  title="Market Listing"
  backButton={true}
>
  {/* ... */}
</DetailPageLayout>
```

**When to use:**
- Edit pages (always show back button)
- Detail pages where users typically navigate from a list
- Any page where going back is a common action

**When NOT to use:**
- View pages that are entry points (users might bookmark them)
- Pages where back navigation is ambiguous

#### `backTo?: string`
Specific URL to navigate to when back button is clicked. If not provided, uses browser history (`navigate(-1)`).

```tsx
<DetailPageLayout
  title="Edit Listing"
  backButton={true}
  backTo="/market/my-listings"
>
  {/* ... */}
</DetailPageLayout>
```

**Use cases:**
- When you want to ensure users go to a specific page
- When browser history might be unreliable
- When you want to preserve query parameters or state

### Entity-Specific Props

#### `entityTitle?: string`
The main title for the entity being viewed. Displayed prominently in the header.

```tsx
<DetailPageLayout
  title="Market Listing"
  backButton={true}
  entityTitle="Rare Mining Equipment"
>
  {/* ... */}
</DetailPageLayout>
```

**Note:** If `entityTitle` is provided, it takes precedence over `headerTitle`.

#### `entitySubtitle?: ReactNode`
Secondary information about the entity. Displayed below the entity title in a smaller, muted font.

```tsx
<DetailPageLayout
  title="Market Listing"
  entityTitle="Rare Mining Equipment"
  entitySubtitle="Listed by JohnDoe • 2 days ago"
>
  {/* ... */}
</DetailPageLayout>
```

Can be a custom component:
```tsx
<DetailPageLayout
  title="Order Details"
  entityTitle={`Order #${order.id}`}
  entitySubtitle={
    <Box display="flex" gap={1} alignItems="center">
      <Chip label={order.status} size="small" />
      <Typography variant="caption">
        Created {formatDate(order.createdAt)}
      </Typography>
    </Box>
  }
>
  {/* ... */}
</DetailPageLayout>
```

#### `entityActions?: ReactNode`
Actions specific to the entity (edit, delete, share, etc.). Displayed on the right side of the header.

```tsx
<DetailPageLayout
  title="Market Listing"
  entityTitle="Rare Mining Equipment"
  entityActions={
    <Box display="flex" gap={1}>
      <Button variant="outlined" onClick={handleEdit}>
        Edit
      </Button>
      <Button variant="outlined" color="error" onClick={handleDelete}>
        Delete
      </Button>
    </Box>
  }
>
  {/* ... */}
</DetailPageLayout>
```

**Note:** If `entityActions` is provided, `headerActions` from StandardPageLayout is ignored.

## Common Use Cases

### Simple Detail Page (View Mode)

```tsx
function ViewMarketListing() {
  const { id } = useParams()
  const { data, isLoading, error } = usePageMarketListing(id)

  return (
    <DetailPageLayout
      title={data?.title || "Market Listing"}
      entityTitle={data?.title}
      entitySubtitle={`${data?.quantity} units • ${data?.price} aUEC each`}
      entityActions={
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Market", href: "/market" },
        { label: data?.title || "Loading..." }
      ]}
      isLoading={isLoading}
      error={error}
      skeleton={<MarketListingSkeleton />}
    >
      <LazySection
        component={lazy(() => import("../../features/market/components/MarketListingView"))}
        skeleton={<MarketListingDetailsSkeleton />}
        componentProps={{ listing: data }}
      />
    </DetailPageLayout>
  )
}
```

### Edit Page with Back Button

```tsx
function EditMarketListing() {
  const { id } = useParams()
  const { data, isLoading, error } = usePageMarketListing(id)

  return (
    <DetailPageLayout
      title={`Edit ${data?.title || "Listing"}`}
      backButton={true}
      backTo={`/market/${id}`}
      entityTitle={data?.title}
      entitySubtitle="Edit your listing details"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Market", href: "/market" },
        { label: data?.title || "Loading...", href: `/market/${id}` },
        { label: "Edit" }
      ]}
      isLoading={isLoading}
      error={error}
      skeleton={<MarketListingSkeleton />}
    >
      <MarketListingEditForm listing={data} />
    </DetailPageLayout>
  )
}
```

### Organization Detail Page

```tsx
function ViewOrg() {
  const { spectrumId } = useParams()
  const { data, isLoading, error } = usePageOrg(spectrumId)

  return (
    <DetailPageLayout
      title={data?.name || "Organization"}
      entityTitle={data?.name}
      entitySubtitle={
        <Box display="flex" gap={2} alignItems="center">
          <Typography variant="caption">
            {data?.memberCount} members
          </Typography>
          <Chip label={data?.type} size="small" />
        </Box>
      }
      entityActions={
        data?.canEdit && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            href={`/org/${spectrumId}/edit`}
          >
            Edit
          </Button>
        )
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Organizations", href: "/contractors" },
        { label: data?.name || "Loading..." }
      ]}
      maxWidth="xl"
      isLoading={isLoading}
      error={error}
      skeleton={<OrgSkeleton />}
    >
      <LazySection
        component={lazy(() => import("../../features/contractor/components/OrgInfo"))}
        skeleton={<OrgInfoSkeleton />}
        componentProps={{ org: data }}
      />
    </DetailPageLayout>
  )
}
```

### Order Detail Page with Status

```tsx
function ViewOrder() {
  const { id } = useParams()
  const { data, isLoading, error } = usePageOrder(id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "success"
      case "cancelled": return "error"
      case "in_progress": return "info"
      default: return "default"
    }
  }

  return (
    <DetailPageLayout
      title={`Order #${data?.id || id}`}
      entityTitle={`Order #${data?.id}`}
      entitySubtitle={
        <Box display="flex" gap={1} alignItems="center">
          <Chip 
            label={data?.status} 
            color={getStatusColor(data?.status)}
            size="small" 
          />
          <Typography variant="caption">
            {formatDate(data?.createdAt)}
          </Typography>
        </Box>
      }
      entityActions={
        <Box display="flex" gap={1}>
          {data?.canCancel && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancel}
            >
              Cancel Order
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<MessageIcon />}
            onClick={handleMessage}
          >
            Message Seller
          </Button>
        </Box>
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Orders", href: "/orders" },
        { label: `Order #${data?.id || id}` }
      ]}
      isLoading={isLoading}
      error={error}
      skeleton={<OrderSkeleton />}
    >
      <OrderDetails order={data} />
    </DetailPageLayout>
  )
}
```

### Detail Page with Multiple Actions

```tsx
function ViewContract() {
  const { id } = useParams()
  const { data, isLoading, error } = usePageContract(id)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <DetailPageLayout
      title={data?.title || "Contract"}
      entityTitle={data?.title}
      entitySubtitle={`${data?.contractor} • ${data?.type}`}
      entityActions={
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            onClick={handleAccept}
            disabled={!data?.canAccept}
          >
            Accept Contract
          </Button>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={handleShare}>Share</MenuItem>
            <MenuItem onClick={handleReport}>Report</MenuItem>
            <MenuItem onClick={handleSave}>Save for Later</MenuItem>
          </Menu>
        </Box>
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Contracts", href: "/contracts" },
        { label: data?.title || "Loading..." }
      ]}
      isLoading={isLoading}
      error={error}
      skeleton={<ContractSkeleton />}
    >
      <ContractDetails contract={data} />
    </DetailPageLayout>
  )
}
```

## Best Practices

1. **Use backButton on edit pages**: Always show a back button on edit/create pages to help users navigate back to the detail view.

2. **Don't use backButton on view pages**: View pages are often bookmarked or shared, so back navigation might not make sense.

3. **Provide meaningful entitySubtitle**: Use this to show key metadata that helps users understand the entity at a glance.

4. **Keep entityActions focused**: Only show the most important actions in the header. Use a menu for secondary actions.

5. **Use entityTitle for dynamic content**: The entity title should reflect the actual entity name, not a generic label.

6. **Combine with LazySection**: Use LazySection for content sections to enable lazy loading and improve performance.

7. **Handle loading states properly**: Always provide a skeleton that matches the layout of your content.

8. **Use appropriate maxWidth**: Detail pages often benefit from wider layouts (`xl`) to show more information.

## Integration with Page Hooks

DetailPageLayout works seamlessly with page hooks:

```tsx
function ViewMarketListing() {
  const { id } = useParams()
  
  // Page hook handles all data fetching
  const { data, isLoading, isFetching, error, refetch } = usePageMarketListing(id)

  return (
    <DetailPageLayout
      title={data?.title || "Market Listing"}
      entityTitle={data?.title}
      entitySubtitle={`${data?.seller} • ${formatDate(data?.createdAt)}`}
      entityActions={
        <Button onClick={refetch} disabled={isFetching}>
          Refresh
        </Button>
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Market", href: "/market" },
        { label: data?.title || "Loading..." }
      ]}
      isLoading={isLoading}
      error={error}
      skeleton={<MarketListingSkeleton />}
    >
      <MarketListingContent listing={data} />
    </DetailPageLayout>
  )
}
```

## Migration from Old Pattern

### Before (Old Pattern)
```tsx
function OldViewPage() {
  const { id } = useParams()
  const { data, isLoading, error } = useGetDataQuery(id)

  if (isLoading) return <Skeleton />
  if (error) return <ErrorPage />

  return (
    <Page title={data.title}>
      <ContainerGrid>
        <Grid item xs={12}>
          <PageBreadcrumbs items={breadcrumbs} />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography variant="h4">{data.title}</Typography>
              <Typography variant="caption">{data.subtitle}</Typography>
            </Box>
            <Box>
              <Button onClick={handleEdit}>Edit</Button>
            </Box>
          </Box>
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
function NewViewPage() {
  const { id } = useParams()
  const { data, isLoading, error } = usePageData(id)

  return (
    <DetailPageLayout
      title={data?.title || "Loading..."}
      entityTitle={data?.title}
      entitySubtitle={data?.subtitle}
      entityActions={
        <Button onClick={handleEdit}>Edit</Button>
      }
      breadcrumbs={breadcrumbs}
      isLoading={isLoading}
      error={error}
      skeleton={<ContentSkeleton />}
    >
      <Content data={data} />
    </DetailPageLayout>
  )
}
```

## Related Components

- **StandardPageLayout**: Base layout component that DetailPageLayout extends
- **FormPageLayout**: For form pages (create/edit with form actions)
- **LazySection**: Wrap content sections for lazy loading within DetailPageLayout
