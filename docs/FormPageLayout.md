# FormPageLayout Usage Guide

## Overview

`FormPageLayout` extends `StandardPageLayout` specifically for form pages (create and edit). It provides a consistent structure with a form title, optional back button, and form action buttons (submit/cancel) positioned at the bottom of the form.

## Basic Usage

```tsx
import { FormPageLayout } from "../../components/layout/FormPageLayout"
import { Button } from "@mui/material"

function CreateListingPage() {
  const handleSubmit = () => {
    // Handle form submission
  }

  const handleCancel = () => {
    navigate("/market")
  }

  return (
    <FormPageLayout
      title="Create Listing"
      formTitle="Create New Market Listing"
      backButton={true}
      submitButton={
        <Button variant="contained" onClick={handleSubmit}>
          Create Listing
        </Button>
      }
      cancelButton={
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Market", href: "/market" },
        { label: "Create Listing" },
      ]}
    >
      <ListingForm />
    </FormPageLayout>
  )
}
```

## Props Reference

FormPageLayout accepts all props from `StandardPageLayout` plus the following:

### Form-Specific Props

#### `formTitle: string` (Required)

The title of the form displayed in the header.

```tsx
<FormPageLayout title="Create Listing" formTitle="Create New Market Listing">
  {/* ... */}
</FormPageLayout>
```

**Note:** This is different from the `title` prop (which sets the document title). The `formTitle` is what users see on the page.

#### `backButton?: boolean`

Shows a back arrow button in the header. Default: `false`.

```tsx
<FormPageLayout
  title="Edit Listing"
  formTitle="Edit Market Listing"
  backButton={true}
>
  {/* ... */}
</FormPageLayout>
```

**Best practice:** Always use `backButton={true}` on form pages to provide an easy way to cancel/exit.

#### `submitButton?: ReactNode`

The primary action button (usually "Save", "Create", "Submit"). Positioned on the right at the bottom of the form.

```tsx
<FormPageLayout
  title="Create Listing"
  formTitle="Create New Market Listing"
  submitButton={
    <Button
      variant="contained"
      onClick={handleSubmit}
      disabled={!isValid || isSubmitting}
    >
      {isSubmitting ? "Creating..." : "Create Listing"}
    </Button>
  }
>
  {/* ... */}
</FormPageLayout>
```

#### `cancelButton?: ReactNode`

The secondary action button (usually "Cancel"). Positioned to the left of the submit button at the bottom of the form.

```tsx
<FormPageLayout
  title="Create Listing"
  formTitle="Create New Market Listing"
  submitButton={<Button variant="contained">Create</Button>}
  cancelButton={
    <Button variant="outlined" onClick={() => navigate("/market")}>
      Cancel
    </Button>
  }
>
  {/* ... */}
</FormPageLayout>
```

### Layout Defaults

FormPageLayout overrides some StandardPageLayout defaults:

- `maxWidth`: Defaults to `"lg"` (narrower than detail pages for better form readability)

You can still override these:

```tsx
<FormPageLayout title="Wide Form" formTitle="Complex Data Entry" maxWidth="xl">
  {/* ... */}
</FormPageLayout>
```

## Common Use Cases

### Simple Create Form

```tsx
function CreateMarketListing() {
  const navigate = useNavigate()
  const [createListing, { isLoading }] = useCreateListingMutation()
  const [formData, setFormData] = useState({})

  const handleSubmit = async () => {
    try {
      const result = await createListing(formData).unwrap()
      navigate(`/market/${result.id}`)
    } catch (error) {
      // Handle error
    }
  }

  return (
    <FormPageLayout
      title="Create Listing"
      formTitle="Create New Market Listing"
      backButton={true}
      submitButton={
        <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Listing"}
        </Button>
      }
      cancelButton={
        <Button
          variant="outlined"
          onClick={() => navigate("/market")}
          disabled={isLoading}
        >
          Cancel
        </Button>
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Market", href: "/market" },
        { label: "Create Listing" },
      ]}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Title"
            fullWidth
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Price"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
          />
        </Grid>
      </Grid>
    </FormPageLayout>
  )
}
```

### Edit Form with Data Loading

```tsx
function EditMarketListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useGetListingQuery(id)
  const [updateListing, { isLoading: isUpdating }] = useUpdateListingMutation()
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  const handleSubmit = async () => {
    try {
      await updateListing({ id, ...formData }).unwrap()
      navigate(`/market/${id}`)
    } catch (error) {
      // Handle error
    }
  }

  return (
    <FormPageLayout
      title={`Edit ${data?.title || "Listing"}`}
      formTitle="Edit Market Listing"
      backButton={true}
      submitButton={
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isUpdating}
        >
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      }
      cancelButton={
        <Button
          variant="outlined"
          onClick={() => navigate(`/market/${id}`)}
          disabled={isUpdating}
        >
          Cancel
        </Button>
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Market", href: "/market" },
        { label: data?.title || "Loading...", href: `/market/${id}` },
        { label: "Edit" },
      ]}
      isLoading={isLoading}
      error={error}
      skeleton={<FormSkeleton />}
    >
      <ListingForm data={formData} onChange={setFormData} />
    </FormPageLayout>
  )
}
```

### Form with Validation

```tsx
function CreateOrder() {
  const navigate = useNavigate()
  const [createOrder, { isLoading }] = useCreateOrderMutation()
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!formData.service) newErrors.service = "Service is required"
    if (!formData.contractor) newErrors.contractor = "Contractor is required"
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      const result = await createOrder(formData).unwrap()
      navigate(`/orders/${result.id}`)
    } catch (error) {
      // Handle error
    }
  }

  const isValid = !errors.service && !errors.contractor && !errors.price

  return (
    <FormPageLayout
      title="Create Order"
      formTitle="Create New Service Order"
      backButton={true}
      submitButton={
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
        >
          {isLoading ? "Creating..." : "Create Order"}
        </Button>
      }
      cancelButton={
        <Button
          variant="outlined"
          onClick={() => navigate("/orders")}
          disabled={isLoading}
        >
          Cancel
        </Button>
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Orders", href: "/orders" },
        { label: "Create Order" },
      ]}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Service"
            fullWidth
            required
            value={formData.service}
            onChange={(e) =>
              setFormData({ ...formData, service: e.target.value })
            }
            error={!!errors.service}
            helperText={errors.service}
          />
        </Grid>
        {/* More fields... */}
      </Grid>
    </FormPageLayout>
  )
}
```

### Multi-Step Form

```tsx
function CreateComplexOrder() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [createOrder, { isLoading }] = useCreateOrderMutation()

  const steps = ["Service Details", "Contractor Selection", "Review"]

  const handleNext = () => setStep(step + 1)
  const handleBack = () => setStep(step - 1)

  const handleSubmit = async () => {
    try {
      const result = await createOrder(formData).unwrap()
      navigate(`/orders/${result.id}`)
    } catch (error) {
      // Handle error
    }
  }

  const isLastStep = step === steps.length - 1

  return (
    <FormPageLayout
      title="Create Order"
      formTitle={`Create Order - ${steps[step]}`}
      backButton={true}
      submitButton={
        isLastStep ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Order"}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )
      }
      cancelButton={
        step > 0 ? (
          <Button variant="outlined" onClick={handleBack}>
            Back
          </Button>
        ) : (
          <Button variant="outlined" onClick={() => navigate("/orders")}>
            Cancel
          </Button>
        )
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Orders", href: "/orders" },
        { label: "Create Order" },
      ]}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stepper activeStep={step}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Grid>
        <Grid item xs={12}>
          {step === 0 && (
            <ServiceDetailsStep data={formData} onChange={setFormData} />
          )}
          {step === 1 && (
            <ContractorSelectionStep data={formData} onChange={setFormData} />
          )}
          {step === 2 && <ReviewStep data={formData} />}
        </Grid>
      </Grid>
    </FormPageLayout>
  )
}
```

### Form with Custom Actions

```tsx
function CreateListing() {
  const navigate = useNavigate()
  const [createListing, { isLoading }] = useCreateListingMutation()
  const [formData, setFormData] = useState({})
  const [saveAsDraft, { isLoading: isSavingDraft }] = useSaveDraftMutation()

  const handleSubmit = async () => {
    try {
      const result = await createListing(formData).unwrap()
      navigate(`/market/${result.id}`)
    } catch (error) {
      // Handle error
    }
  }

  const handleSaveDraft = async () => {
    try {
      await saveAsDraft(formData).unwrap()
      navigate("/market/my-listings")
    } catch (error) {
      // Handle error
    }
  }

  return (
    <FormPageLayout
      title="Create Listing"
      formTitle="Create New Market Listing"
      backButton={true}
      submitButton={
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            disabled={isLoading || isSavingDraft}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading || isSavingDraft}
          >
            {isLoading ? "Publishing..." : "Publish Listing"}
          </Button>
        </Box>
      }
      cancelButton={
        <Button
          variant="outlined"
          onClick={() => navigate("/market")}
          disabled={isLoading || isSavingDraft}
        >
          Cancel
        </Button>
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Market", href: "/market" },
        { label: "Create Listing" },
      ]}
    >
      <ListingForm data={formData} onChange={setFormData} />
    </FormPageLayout>
  )
}
```

## Best Practices

1. **Always use backButton**: Form pages should always have a back button to provide an easy exit path.

2. **Disable buttons during submission**: Prevent double submissions by disabling buttons while the form is being submitted.

3. **Show loading states**: Update button text to show progress (e.g., "Creating..." instead of "Create").

4. **Validate before submit**: Validate form data and disable the submit button if the form is invalid.

5. **Handle errors gracefully**: Show error messages and allow users to retry.

6. **Use appropriate maxWidth**:
   - `sm` for simple forms (login, signup)
   - `lg` (default) for most forms
   - `xl` for complex forms with many fields

7. **Provide clear button labels**: Use action-specific labels like "Create Listing" instead of generic "Submit".

8. **Position actions consistently**: Submit button on the right, cancel on the left.

9. **Use Grid for form layout**: Organize form fields in a Grid for responsive layout.

10. **Consider multi-step forms**: For complex forms, break them into steps for better UX.

## Integration with React Hook Form

FormPageLayout works well with React Hook Form:

```tsx
function CreateListingWithHookForm() {
  const navigate = useNavigate()
  const [createListing, { isLoading }] = useCreateListingMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  })

  const onSubmit = async (data) => {
    try {
      const result = await createListing(data).unwrap()
      navigate(`/market/${result.id}`)
    } catch (error) {
      // Handle error
    }
  }

  return (
    <FormPageLayout
      title="Create Listing"
      formTitle="Create New Market Listing"
      backButton={true}
      submitButton={
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isLoading}
        >
          {isLoading ? "Creating..." : "Create Listing"}
        </Button>
      }
      cancelButton={
        <Button
          variant="outlined"
          onClick={() => navigate("/market")}
          disabled={isLoading}
        >
          Cancel
        </Button>
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Market", href: "/market" },
        { label: "Create Listing" },
      ]}
    >
      <form>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Title"
              fullWidth
              {...register("title", { required: "Title is required" })}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          </Grid>
          {/* More fields... */}
        </Grid>
      </form>
    </FormPageLayout>
  )
}
```

## Migration from Old Pattern

### Before (Old Pattern)

```tsx
function OldCreatePage() {
  const [formData, setFormData] = useState({})
  const [createItem, { isLoading }] = useCreateItemMutation()

  const handleSubmit = async () => {
    await createItem(formData)
  }

  return (
    <Page title="Create Item">
      <ContainerGrid maxWidth="md">
        <Grid item xs={12}>
          <PageBreadcrumbs items={breadcrumbs} />
        </Grid>
        <Grid item xs={12}>
          <HeaderTitle>Create New Item</HeaderTitle>
        </Grid>
        <Grid item xs={12}>
          <ItemForm data={formData} onChange={setFormData} />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              Create
            </Button>
          </Box>
        </Grid>
      </ContainerGrid>
    </Page>
  )
}
```

### After (New Pattern)

```tsx
function NewCreatePage() {
  const [formData, setFormData] = useState({})
  const [createItem, { isLoading }] = useCreateItemMutation()

  const handleSubmit = async () => {
    await createItem(formData)
  }

  return (
    <FormPageLayout
      title="Create Item"
      formTitle="Create New Item"
      backButton={true}
      submitButton={
        <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Creating..." : "Create"}
        </Button>
      }
      cancelButton={<Button onClick={() => navigate(-1)}>Cancel</Button>}
      breadcrumbs={breadcrumbs}
    >
      <ItemForm data={formData} onChange={setFormData} />
    </FormPageLayout>
  )
}
```

## Related Components

- **StandardPageLayout**: Base layout component that FormPageLayout extends
- **DetailPageLayout**: For entity detail pages (view mode)
- **LazySection**: Can be used within forms for lazy-loaded sections
