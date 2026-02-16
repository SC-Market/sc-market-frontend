# Migration Analysis: Manual API → Generated API

## Current State

### Manual API (src/store/*.ts)
- **15 manual API files** using `serviceApi.injectEndpoints()`
- **~151 usages** of manual hooks across codebase (e.g., `useGetUserProfileQuery`)
- Uses `serviceApi` with `reducerPath: "serviceApi"`

### Generated API (src/store/api/*.ts)
- **27 generated API files** from OpenAPI spec
- **~1 usage** currently (the problematic `useGetCurrentUserProfileQuery`)
- Uses `generatedApi` with `reducerPath: "generatedApi"`
- Generated via `npm run codegen:api` from `spec/sc-market.openapi.json`

## Key Differences

### 1. **Separate Redux Slices**
- **Manual**: Injects into `serviceApi` 
- **Generated**: Injects into `generatedApi`
- **Issue**: Two separate Redux slices means:
  - Separate cache storage
  - No cache sharing between manual and generated endpoints
  - Duplicate state management overhead

### 2. **Tag Types**
- **Manual**: Uses specific tags like `MyProfile`, `Profile`, `Orders`, etc.
- **Generated**: Uses generic tags like `Profiles`, `Email`, etc.
- **Issue**: Different tag names mean cache invalidation doesn't work across APIs

### 3. **Advanced Features in Manual API**

#### Optimistic Updates
```typescript
// Manual API has this:
async onQueryStarted(body, { dispatch, queryFulfilled }) {
  await createOptimisticUpdate(
    (dispatch) => {
      const patches = []
      const profilePatch = dispatch(
        userApi.util.updateQueryData(
          "profileGetUserProfile",
          undefined,
          (draft) => {
            Object.assign(draft.settings, body)
          }
        )
      )
      patches.push(profilePatch)
      return patches
    },
    queryFulfilled,
    dispatch
  )
}
```
Generated API doesn't have this.

#### Custom Cache Invalidation Logic
```typescript
// Manual API logout:
async onQueryStarted(_, { dispatch, queryFulfilled }) {
  await queryFulfilled
  dispatch(serviceApi.util.resetApiState())
  dispatch(serviceApi.util.invalidateTags([...]))
}
```

#### Transform Responses
```typescript
transformResponse: unwrapResponse
```

#### Fine-grained Cache Control
```typescript
keepUnusedDataFor: 300, // Per-endpoint control
providesTags: (result, error, arg) => [
  { type: "Profile", id: arg },
  { type: "MyProfile" }
]
```

### 4. **Hook Naming Conventions**
- **Manual**: `profileGetUserProfile` → `useGetUserProfileQuery`
- **Generated**: `getCurrentUserProfile` → `useGetCurrentUserProfileQuery`
- **Issue**: Different naming means all imports need updating

### 5. **Type Exports**
- **Manual**: Types defined inline or imported from datatypes
- **Generated**: Types auto-generated with `ApiResponse` and `ApiArg` suffixes

## Migration Challenges

### 1. **Dual API Architecture** (CRITICAL)
The biggest issue is having two separate Redux APIs:
- Can't share cache between them
- Can't invalidate tags across APIs
- Increases bundle size
- Confusing for developers

**Solution Options:**
a) Merge generated endpoints into `serviceApi` (requires codegen config changes)
b) Migrate all manual endpoints to generated API
c) Keep both but ensure they never overlap

### 2. **Optimistic Updates** (HIGH)
Generated API doesn't support the custom optimistic update pattern used extensively in manual API.

**Migration Required:**
- Rewrite optimistic updates using RTK Query's built-in `onQueryStarted`
- Test thoroughly as optimistic updates affect UX significantly
- Affects: profile updates, settings changes, etc.

### 3. **Custom Cache Invalidation** (HIGH)
Manual API has sophisticated invalidation logic (e.g., logout clears everything).

**Migration Required:**
- Port custom invalidation logic to generated endpoints
- Ensure logout still works correctly
- Test all cache invalidation scenarios

### 4. **Widespread Usage** (HIGH)
~151 usages of manual hooks across the codebase.

**Migration Required:**
- Update all imports from `store/profile` to `store/api/profile`
- Update hook names (e.g., `useGetUserProfileQuery` → `useGetCurrentUserProfileQuery`)
- Update type imports
- Extensive testing required

### 5. **Tag Type Mismatches** (MEDIUM)
Different tag naming conventions between manual and generated.

**Migration Required:**
- Standardize tag names
- Update all `providesTags` and `invalidatesTags` references
- Ensure cache invalidation still works correctly

### 6. **Transform Responses** (MEDIUM)
Manual API uses `unwrapResponse` helper.

**Migration Required:**
- Check if generated API needs response transformation
- Add `transformResponse` to generated endpoints if needed

### 7. **Missing Endpoints** (MEDIUM)
Some manual endpoints might not exist in OpenAPI spec yet.

**Migration Required:**
- Audit all manual endpoints
- Add missing endpoints to OpenAPI spec
- Regenerate API

## Estimated Effort

### Phase 1: Preparation (1-2 days)
- [ ] Audit all manual endpoints vs OpenAPI spec
- [ ] Identify missing endpoints in spec
- [ ] Document all custom logic (optimistic updates, cache invalidation)
- [ ] Create migration plan for each endpoint

### Phase 2: OpenAPI Spec Updates (2-3 days)
- [ ] Add missing endpoints to spec
- [ ] Ensure all request/response types are correct
- [ ] Add proper tags for cache invalidation
- [ ] Regenerate and verify generated code

### Phase 3: Merge APIs (1-2 days)
- [ ] Configure codegen to inject into `serviceApi` instead of `generatedApi`
- [ ] Update all generated files to use `serviceApi`
- [ ] Remove `generatedApi` slice
- [ ] Update store configuration

### Phase 4: Port Custom Logic (3-5 days)
- [ ] Port optimistic updates to generated endpoints
- [ ] Port custom cache invalidation logic
- [ ] Port response transformations
- [ ] Add custom `onQueryStarted` hooks where needed

### Phase 5: Update Codebase (5-7 days)
- [ ] Update all imports (~151 files)
- [ ] Update all hook names
- [ ] Update all type imports
- [ ] Fix TypeScript errors

### Phase 6: Testing (3-5 days)
- [ ] Test all API calls
- [ ] Test cache invalidation
- [ ] Test optimistic updates
- [ ] Test logout flow
- [ ] Test error handling
- [ ] E2E testing

### Phase 7: Cleanup (1 day)
- [ ] Remove manual API files
- [ ] Remove unused types
- [ ] Update documentation
- [ ] Remove old imports

**Total Estimated Time: 16-25 days**

## Risks

### High Risk
1. **Breaking cache invalidation** - Could cause stale data issues
2. **Breaking optimistic updates** - Could degrade UX
3. **Breaking logout** - Critical security issue
4. **Type mismatches** - Could cause runtime errors

### Medium Risk
1. **Missing endpoints** - Some features might break
2. **Performance regression** - Two APIs → one might affect performance
3. **Bundle size increase** - If not done carefully

### Low Risk
1. **Import updates** - Tedious but straightforward
2. **Hook name changes** - Easy to find and replace

## Recommendations

### Option 1: Full Migration (Recommended for Long-term)
**Pros:**
- Single source of truth
- Consistent API patterns
- Easier maintenance
- Smaller bundle size

**Cons:**
- High effort (16-25 days)
- High risk during migration
- Requires extensive testing

### Option 2: Hybrid Approach (Recommended for Short-term)
**Pros:**
- Lower risk
- Incremental migration
- Can test each endpoint individually

**Cons:**
- Maintains dual API architecture
- Longer overall timeline
- More complex codebase during migration

**Steps:**
1. Configure codegen to inject into `serviceApi`
2. Migrate one endpoint at a time
3. Test thoroughly after each migration
4. Remove manual endpoint only after generated one is proven

### Option 3: Keep Both (Not Recommended)
**Pros:**
- No migration effort
- No risk

**Cons:**
- Dual API architecture forever
- Confusion for developers
- Larger bundle size
- Cache invalidation issues

## Immediate Actions

1. **Fix the current issue**: Replace `useGetCurrentUserProfileQuery` with `useGetUserProfileQuery` (already done)

2. **Prevent future issues**: Add linting rule to prevent importing from `store/api` until migration is complete

3. **Document the situation**: Add comments to generated API files warning about the dual API issue

4. **Plan migration**: Decide on Option 1 or Option 2 and create detailed migration plan

## Conclusion

The generated API is not ready for production use due to:
1. Separate Redux slice causing cache issues
2. Missing optimistic updates
3. Missing custom cache invalidation logic
4. Widespread usage of manual API (~151 files)

**Recommendation**: Continue using manual API for now. Plan a full migration (Option 1) or incremental migration (Option 2) when time permits. Estimated effort: 16-25 days for full migration.
