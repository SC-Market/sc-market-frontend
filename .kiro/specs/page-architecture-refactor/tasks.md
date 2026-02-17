# Implementation Plan: Page Architecture Refactor

## Overview

This implementation plan breaks down the page architecture refactor into incremental steps. The approach focuses on:

1. Creating reusable layout components first
2. Building the LazySection wrapper for lazy loading
3. Creating example page hooks and content sections
4. Migrating a pilot page to validate the pattern
5. Documenting the migration process for other pages

Each task builds on previous work, ensuring the system remains functional throughout the refactor.

## Tasks

- [x] 1. Create core layout components
  - [x] 1.1 Implement StandardPageLayout component
    - Create `src/components/layout/StandardPageLayout.tsx`
    - Accept props for metadata, breadcrumbs, header, sidebar configuration
    - Integrate with existing Page, PageBreadcrumbs, and ContainerGrid components
    - Handle loading state with skeleton prop
    - Handle error states (404 redirect, error page display)
    - _Requirements: 2.1, 2.2, 2.3, 7.1, 7.2, 10.1, 10.2, 10.4, 11.1, 11.2, 11.3, 11.4_
  
  - [x] 1.2 Write property test for StandardPageLayout configuration
    - **Property 2: Layout configuration is applied correctly**
    - **Validates: Requirements 2.3, 2.7, 10.4**
  
  - [x] 1.3 Write unit tests for StandardPageLayout
    - Test rendering with typical props
    - Test 404 error triggers navigation
    - Test server error displays error page
    - Test empty breadcrumbs are not rendered
    - _Requirements: 2.2, 7.1, 7.2, 9.5_

- [x] 2. Create specialized layout components
  - [x] 2.1 Implement DetailPageLayout component
    - Create `src/components/layout/DetailPageLayout.tsx`
    - Extend StandardPageLayout with back button and entity-specific props
    - Render entity title, subtitle, and actions
    - _Requirements: 2.4, 2.5_
  
  - [x] 2.2 Write property test for DetailPageLayout navigation
    - **Property 3: DetailPageLayout includes navigation elements**
    - **Validates: Requirements 2.5**
  
  - [x] 2.3 Implement FormPageLayout component
    - Create `src/components/layout/FormPageLayout.tsx`
    - Extend StandardPageLayout with form-specific props
    - Position form actions (submit, cancel buttons)
    - Use narrower max width for forms
    - _Requirements: 2.6_
  
  - [x] 2.4 Write unit tests for specialized layouts
    - Test DetailPageLayout renders back button when configured
    - Test FormPageLayout renders form actions
    - _Requirements: 2.5, 2.6_

- [x] 3. Implement LazySection wrapper component
  - [x] 3.1 Create LazySection component with error boundary
    - Create `src/components/layout/LazySection.tsx`
    - Wrap lazy component in React.Suspense
    - Include error boundary for error isolation
    - Accept skeleton and errorFallback props
    - Apply grid props to container
    - Log errors to console
    - _Requirements: 3.1, 3.2, 3.5, 7.3, 7.5, 8.1, 8.2, 8.3, 8.4_
  
  - [x] 3.2 Write property test for lazy loading skeleton display
    - **Property 4: Lazy sections display skeletons during loading**
    - **Validates: Requirements 3.2, 8.2**
  
  - [x] 3.3 Write property test for error isolation
    - **Property 5: Error isolation between content sections**
    - **Validates: Requirements 3.4, 7.4**
  
  - [x] 3.4 Write unit tests for LazySection
    - Test multiple sections load in parallel
    - Test error boundary catches errors
    - Test errors are logged
    - _Requirements: 3.3, 3.5, 7.5_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create page hook utilities and patterns
  - [x] 5.1 Create usePageMarketListing hook
    - Create `src/features/market/hooks/usePageMarketListing.ts`
    - Compose useGetMarketListingQuery
    - Return data, isLoading, isFetching, error, refetch
    - Handle conditional queries for related data
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 5.2 Write property test for page hook return shape
    - **Property 6: Page hooks return required properties**
    - **Validates: Requirements 5.2, 5.5**
  
  - [x] 5.3 Write property test for page hook error handling
    - **Property 7: Page hooks expose error information**
    - **Validates: Requirements 5.3**
  
  - [x] 5.4 Write unit test for page hook composition
    - Test hook composes multiple API queries
    - Test refetch function calls all queries
    - _Requirements: 5.4_

- [x] 6. Create content section components for market listing
  - [x] 6.1 Extract MarketListingDetails section component
    - Create `src/features/market/components/MarketListingDetails.tsx`
    - Extract details section from MarketListingView
    - Accept listing data via props only
    - Focus on presentation without data fetching
    - _Requirements: 1.3, 6.1, 6.4_
  
  - [x] 6.2 Create MarketListingDetailsSkeleton component
    - Create `src/features/market/components/MarketListingDetails.skeleton.tsx`
    - Match layout structure of MarketListingDetails
    - Use same grid layout and spacing
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 6.3 Make MarketListingDetails lazy-loadable
    - Create lazy export in feature index
    - Ensure component is code-splittable
    - _Requirements: 8.1, 8.5_

- [x] 7. Migrate ViewMarketListing page as pilot
  - [x] 7.1 Refactor ViewMarketListing to use new architecture
    - Update `src/pages/market/ViewMarketListing.tsx`
    - Use DetailPageLayout instead of ContainerGrid
    - Use usePageMarketListing hook for data fetching
    - Use LazySection for content sections
    - Keep only orchestration logic in page component
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.3, 6.4, 12.2_
  
  - [x] 7.2 Write integration test for refactored page
    - Test page renders with loading state
    - Test page renders with data
    - Test page handles 404 error
    - Test page handles server error
    - _Requirements: 7.1, 7.2, 12.2_

- [ ] 8. Checkpoint - Validate pilot migration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Create migration documentation and examples
  - [ ] 9.1 Document StandardPageLayout usage
    - Create examples for common use cases
    - Document all props and their purposes
    - Include code snippets for typical pages
    - _Requirements: 12.3, 12.4_
  
  - [ ] 9.2 Document DetailPageLayout usage
    - Create examples for entity detail pages
    - Show how to integrate with page hooks
    - Include breadcrumb and navigation examples
    - _Requirements: 12.3, 12.4_
  
  - [ ] 9.3 Document FormPageLayout usage
    - Create examples for create and edit pages
    - Show form action integration
    - Include validation and error handling patterns
    - _Requirements: 12.3, 12.4_
  
  - [ ] 9.4 Create page hook pattern documentation
    - Document how to create page hooks
    - Show examples of composing multiple queries
    - Document error handling patterns
    - _Requirements: 12.3, 12.4_
  
  - [ ] 9.5 Create LazySection usage guide
    - Document how to lazy load content sections
    - Show skeleton creation patterns
    - Include error boundary examples
    - _Requirements: 12.3, 12.4_
  
  - [ ] 9.6 Create migration checklist for each page type
    - Standard pages migration steps
    - Detail pages migration steps
    - Form pages migration steps
    - Document complexity assessment criteria
    - _Requirements: 12.3, 12.4_

- [ ] 10. Create additional page hook examples
  - [ ] 10.1 Create usePageOrg hook
    - Create `src/features/contractor/hooks/usePageOrg.ts`
    - Compose useGetContractorBySpectrumIDQuery
    - Return standard page hook interface
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  
  - [ ] 10.2 Create usePageProfile hook
    - Create `src/features/profile/hooks/usePageProfile.ts`
    - Compose profile-related queries
    - Return standard page hook interface
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [-] 11. Migrate ViewOrg page
  - [x] 11.1 Refactor ViewOrg to use new architecture
    - Update `src/pages/contractor/ViewOrg.tsx`
    - Use DetailPageLayout
    - Use usePageOrg hook
    - Use LazySection for OrgInfo component
    - _Requirements: 1.1, 1.2, 1.3, 6.3, 6.4, 12.2_
  
  - [-] 11.2 Write integration test for ViewOrg
    - Test page renders correctly
    - Test error handling
    - _Requirements: 7.1, 7.2, 12.2_

- [ ] 12. Create property tests for breadcrumbs
  - [ ] 12.1 Write property test for breadcrumb rendering
    - **Property 12: Breadcrumbs render all provided items**
    - **Validates: Requirements 9.1**
  
  - [ ] 12.2 Write property test for current page breadcrumb
    - **Property 13: Current page is last breadcrumb**
    - **Validates: Requirements 9.2**
  
  - [ ] 12.3 Write unit test for dynamic breadcrumb labels
    - Test breadcrumbs update when data loads
    - _Requirements: 9.3_

- [ ] 13. Create property tests for metadata
  - [ ] 13.1 Write property test for document title
    - **Property 15: Document title is set from props**
    - **Validates: Requirements 10.2**
  
  - [ ] 13.2 Write unit test for canonical URL
    - Test canonical URL is set in page metadata
    - _Requirements: 10.3_
  
  - [ ] 13.3 Write unit test for loading state title
    - Test default title displays during loading
    - _Requirements: 10.5_

- [ ] 14. Create property tests for responsive behavior
  - [ ]* 14.1 Write property test for mobile layout adjustments
    - **Property 16: Mobile viewports adjust layout**
    - **Validates: Requirements 11.1**
  
  - [ ]* 14.2 Write property test for mobile sidebar behavior
    - **Property 17: Mobile sidebar behavior adapts**
    - **Validates: Requirements 11.2**
  
  - [ ]* 14.3 Write property test for bottom navigation spacing
    - **Property 18: Bottom navigation spacing on mobile**
    - **Validates: Requirements 11.3**
  
  - [ ]* 14.4 Write property test for mobile padding removal
    - **Property 19: Mobile padding can be disabled**
    - **Validates: Requirements 11.4**

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Migration is incremental - old and new patterns coexist
- Focus on two pilot pages (ViewMarketListing, ViewOrg) before broader migration
- Documentation is created alongside implementation for immediate reference
