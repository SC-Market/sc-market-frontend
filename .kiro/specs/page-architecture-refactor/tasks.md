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

- [x] 4. Checkpoint - Ensure all tests pass
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

- [x] 8. Checkpoint - Validate pilot migration
  - Ensure all tests pass, ask the user if questions arise.

- [-] 9. Create migration documentation and examples
  - [x] 9.1 Document StandardPageLayout usage
    - Create examples for common use cases
    - Document all props and their purposes
    - Include code snippets for typical pages
    - _Requirements: 12.3, 12.4_
  
  - [x] 9.2 Document DetailPageLayout usage
    - Create examples for entity detail pages
    - Show how to integrate with page hooks
    - Include breadcrumb and navigation examples
    - _Requirements: 12.3, 12.4_
  
  - [x] 9.3 Document FormPageLayout usage
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

- [x] 11. Migrate ViewOrg page
  - [x] 11.1 Refactor ViewOrg to use new architecture
    - Update `src/pages/contractor/ViewOrg.tsx`
    - Use DetailPageLayout
    - Use usePageOrg hook
    - Use LazySection for OrgInfo component
    - _Requirements: 1.1, 1.2, 1.3, 6.3, 6.4, 12.2_
  
  - [x] 11.2 Write integration test for ViewOrg
    - Test page renders correctly
    - Test error handling
    - _Requirements: 7.1, 7.2, 12.2_

- [x] 12. Create property tests for breadcrumbs
  - [x] 12.1 Write property test for breadcrumb rendering
    - **Property 12: Breadcrumbs render all provided items**
    - **Validates: Requirements 9.1**
  
  - [x] 12.2 Write property test for current page breadcrumb
    - **Property 13: Current page is last breadcrumb**
    - **Validates: Requirements 9.2**
  
  - [x] 12.3 Write unit test for dynamic breadcrumb labels
    - Test breadcrumbs update when data loads
    - _Requirements: 9.3_

- [x] 13. Create property tests for metadata
  - [x] 13.1 Write property test for document title
    - **Property 15: Document title is set from props**
    - **Validates: Requirements 10.2**
  
  - [x] 13.2 Write unit test for canonical URL
    - Test canonical URL is set in page metadata
    - _Requirements: 10.3_
  
  - [x] 13.3 Write unit test for loading state title
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

## Phase 2: Full Application Migration

### Market Feature Pages

- [x] 16. Migrate market detail pages
  - [x] 16.1 Create usePageMarketAggregate hook
    - Create `src/features/market/hooks/usePageMarketAggregate.ts`
    - Compose aggregate market data queries
    - Return standard page hook interface
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  
  - [x] 16.2 Migrate ViewMarketAggregate page
    - Update `src/pages/market/ViewMarketAggregate.tsx`
    - Use DetailPageLayout
    - Use usePageMarketAggregate hook
    - Use LazySection for content sections
    - _Requirements: 1.1, 1.2, 1.3, 12.2_
  
  - [x] 16.3 Migrate ViewMarketMultiple page
    - Update `src/pages/market/ViewMarketMultiple.tsx`
    - Use DetailPageLayout
    - Create usePageMarketMultiple hook if needed
    - Use LazySection for content sections
    - _Requirements: 1.1, 1.2, 1.3, 12.2_

- [x] 17. Migrate market form pages
  - [x] 17.1 Migrate MarketCreate page
    - Update `src/pages/market/MarketCreate.tsx`
    - Use FormPageLayout
    - Extract form logic to page hook
    - _Requirements: 1.1, 1.2, 2.6, 12.2_
  
  - [x] 17.2 Migrate CreateBuyOrder page
    - Update `src/pages/market/CreateBuyOrder.tsx`
    - Use FormPageLayout
    - Extract form logic to page hook
    - _Requirements: 1.1, 1.2, 2.6, 12.2_
  
  - [x] 17.3 Migrate SellMaterials page
    - Update `src/pages/market/SellMaterials.tsx`
    - Use FormPageLayout
    - Extract form logic to page hook
    - _Requirements: 1.1, 1.2, 2.6, 12.2_

- [x] 18. Migrate market management pages
  - [x] 18.1 Migrate MyMarketListings page
    - Update `src/pages/market/MyMarketListings.tsx`
    - Use StandardPageLayout
    - Create usePageMyMarketListings hook
    - Use LazySection for listing sections
    - _Requirements: 1.1, 1.2, 1.3, 12.2_
  
  - [x] 18.2 Migrate ManageStock page
    - Update `src/pages/market/ManageStock.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 18.3 Migrate ManageStockLots page
    - Update `src/pages/market/ManageStockLots.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 18.4 Migrate ManageListingStock page
    - Update `src/pages/market/ManageListingStock.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 18.5 Migrate MarketCart page
    - Update `src/pages/market/MarketCart.tsx`
    - Use StandardPageLayout
    - Extract cart logic to page hook
    - _Requirements: 1.1, 1.2, 12.2_

### Contracting Feature Pages

- [x] 19. Migrate contracting detail pages
  - [x] 19.1 Create usePageOrder hook
    - Create `src/features/contracting/hooks/usePageOrder.ts`
    - Compose order-related queries (order, chat, notifications, offer session)
    - Return standard page hook interface
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 19.2 Migrate ViewOrder page
    - Update `src/pages/contracting/ViewOrder.tsx`
    - Use DetailPageLayout
    - Use usePageOrder hook
    - Use LazySection for OrderDetailsArea, OrderMessagesArea, etc.
    - Simplify tab logic with new architecture
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.3, 12.2_
  
  - [x] 19.3 Create usePageContract hook
    - Create `src/features/contracting/hooks/usePageContract.ts`
    - Compose contract-related queries
    - Return standard page hook interface
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  
  - [x] 19.4 Migrate ContractInfo page
    - Update `src/pages/contracting/ContractInfo.tsx`
    - Use DetailPageLayout
    - Use usePageContract hook
    - Use LazySection for content sections
    - _Requirements: 1.1, 1.2, 1.3, 12.2_
  
  - [x] 19.5 Create usePagePublicContract hook
    - Create `src/features/contracting/hooks/usePagePublicContract.ts`
    - Compose public contract queries
    - Return standard page hook interface
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  
  - [x] 19.6 Migrate ViewPublicContract page
    - Update `src/pages/contracting/ViewPublicContract.tsx`
    - Use DetailPageLayout
    - Use usePagePublicContract hook
    - Use LazySection for content sections
    - _Requirements: 1.1, 1.2, 1.3, 12.2_

- [x] 20. Migrate contracting form pages
  - [x] 20.1 Migrate CreateOrder page
    - Update `src/pages/contracting/CreateOrder.tsx`
    - Use StandardPageLayout (list view)
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 20.2 Migrate ServiceCreateOrder page
    - Update `src/pages/contracting/CreateOrder.tsx` (ServiceCreateOrder component)
    - Use FormPageLayout
    - Create usePageServiceOrder hook
    - _Requirements: 1.1, 1.2, 2.6, 12.2_
  
  - [x] 20.3 Migrate CreateService page
    - Update `src/pages/contracting/CreateService.tsx`
    - Use FormPageLayout
    - Extract form logic to page hook
    - _Requirements: 1.1, 1.2, 2.6, 12.2_
  
  - [x] 20.4 Migrate CreatePublicContractPage
    - Update `src/pages/contracting/CreatePublicContractPage.tsx`
    - Use FormPageLayout
    - Extract form logic to page hook
    - _Requirements: 1.1, 1.2, 2.6, 12.2_

- [x] 21. Migrate contracting list pages
  - [x] 21.1 Migrate Contracts page
    - Update `src/pages/contracting/Contracts.tsx`
    - Use StandardPageLayout with custom layout for tabs
    - Extract sidebar state management
    - Use LazySection for tab content
    - _Requirements: 1.1, 1.2, 3.1, 3.3, 12.2_
  
  - [x] 21.2 Migrate Services page
    - Update `src/pages/contracting/Services.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 21.3 Migrate MyServices page
    - Update `src/pages/contracting/MyServices.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 21.4 Migrate OrdersAssigned page
    - Update `src/pages/contracting/OrdersAssigned.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 21.5 Migrate AcceptOrgInvite page
    - Update `src/pages/contracting/AcceptOrgInvite.tsx`
    - Use StandardPageLayout
    - Extract logic to page hook
    - _Requirements: 1.1, 1.2, 12.2_

### Contractor/Organization Pages

- [x] 22. Migrate contractor pages
  - [x] 22.1 Migrate Contractors page
    - Update `src/pages/contractor/Contractors.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 22.2 Migrate OrgManage page
    - Update `src/pages/contractor/OrgManage.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - Use LazySection for management sections
    - _Requirements: 1.1, 1.2, 1.3, 12.2_
  
  - [x] 22.3 Migrate OrgMoney page
    - Update `src/pages/contractor/OrgMoney.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 22.4 Migrate OrgOrders page
    - Update `src/pages/contractor/OrgOrders.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 22.5 Migrate OrgRegister page
    - Update `src/pages/contractor/OrgRegister.tsx`
    - Use FormPageLayout
    - Extract form logic to page hook
    - _Requirements: 1.1, 1.2, 2.6, 12.2_
  
  - [x] 22.6 Migrate MemberDashboard page
    - Update `src/pages/contractor/MemberDashboard.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - Use LazySection for dashboard sections
    - _Requirements: 1.1, 1.2, 1.3, 12.2_
  
  - [x] 22.7 Migrate MemberFleet page
    - Update `src/pages/contractor/MemberFleet.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_

### People/Profile Pages

- [x] 23. Migrate profile pages
  - [x] 23.1 Create usePageUserProfile hook
    - Create `src/features/profile/hooks/usePageUserProfile.ts`
    - Compose user profile queries
    - Return standard page hook interface
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  
  - [x] 23.2 Migrate Profile page
    - Update `src/pages/people/Profile.tsx`
    - Use DetailPageLayout
    - Use usePageUserProfile hook
    - Use LazySection for ViewProfile component
    - _Requirements: 1.1, 1.2, 1.3, 12.2_
  
  - [x] 23.3 Migrate MyProfile page
    - Update `src/pages/people/MyProfile.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - Use LazySection for profile sections
    - _Requirements: 1.1, 1.2, 1.3, 12.2_
  
  - [x] 23.4 Migrate People page
    - Update `src/pages/people/People.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 23.5 Migrate SettingsPage
    - Update `src/pages/people/SettingsPage.tsx`
    - Use StandardPageLayout
    - Extract settings logic to page hook
    - Use LazySection for settings sections
    - _Requirements: 1.1, 1.2, 1.3, 12.2_

### Offers Pages

- [x] 24. Migrate offer pages
  - [x] 24.1 Create usePageOffer hook
    - Create `src/features/offers/hooks/usePageOffer.ts`
    - Compose offer-related queries
    - Return standard page hook interface
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  
  - [x] 24.2 Migrate ViewOfferPage
    - Update `src/pages/offers/ViewOfferPage.tsx`
    - Use DetailPageLayout
    - Use usePageOffer hook
    - Use LazySection for offer sections
    - _Requirements: 1.1, 1.2, 1.3, 12.2_
  
  - [x] 24.3 Migrate CounterOfferPage
    - Update `src/pages/offers/CounterOfferPage.tsx`
    - Use FormPageLayout
    - Extract form logic to page hook
    - _Requirements: 1.1, 1.2, 2.6, 12.2_
  
  - [x] 24.4 Migrate ReceivedOffersPage
    - Update `src/pages/offers/ReceivedOffersPage.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_

### Recruiting Pages

- [x] 25. Migrate recruiting pages
  - [x] 25.1 Create usePageRecruitingPost hook
    - Create `src/features/recruiting/hooks/usePageRecruitingPost.ts`
    - Compose recruiting post queries
    - Return standard page hook interface
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  
  - [x] 25.2 Migrate RecruitingPostPage
    - Update `src/pages/recruiting/RecruitingPostPage.tsx`
    - Use DetailPageLayout
    - Use usePageRecruitingPost hook
    - Use LazySection for post sections
    - _Requirements: 1.1, 1.2, 1.3, 12.2_
  
  - [x] 25.3 Migrate CreateRecruitingPostPage
    - Update `src/pages/recruiting/CreateRecruitingPostPage.tsx`
    - Use FormPageLayout
    - Extract form logic to page hook
    - _Requirements: 1.1, 1.2, 2.6, 12.2_
  
  - [x] 25.4 Migrate Recruiting page
    - Update `src/pages/recruiting/Recruiting.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_

### Fleet Pages

- [x] 26. Migrate fleet pages
  - [x] 26.1 Migrate Fleet page
    - Update `src/pages/fleet/Fleet.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - Use LazySection for fleet sections
    - _Requirements: 1.1, 1.2, 1.3, 12.2_
  
  - [x] 26.2 Migrate ImportFleet page
    - Update `src/pages/fleet/ImportFleet.tsx`
    - Use FormPageLayout
    - Extract import logic to page hook
    - _Requirements: 1.1, 1.2, 2.6, 12.2_

### Availability Pages

- [x] 27. Migrate availability pages
  - [x] 27.1 Migrate Availability page
    - Update `src/pages/availability/Availability.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_

### Messaging Pages

- [x] 28. Migrate messaging pages
  - [x] 28.1 Migrate Messages page
    - Update `src/pages/messaging/Messages.tsx`
    - Use StandardPageLayout with custom layout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 28.2 Migrate MessagesList page
    - Update `src/pages/messaging/MessagesList.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_

### Money Pages

- [x] 29. Migrate money pages
  - [x] 29.1 Migrate SendMoney page
    - Update `src/pages/money/SendMoney.tsx`
    - Use FormPageLayout
    - Extract form logic to page hook
    - _Requirements: 1.1, 1.2, 2.6, 12.2_

### Notifications Pages

- [x] 30. Migrate notifications pages
  - [x] 30.1 Migrate NotificationsPage
    - Update `src/pages/notifications/NotificationsPage.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_

### Admin Pages

- [x] 31. Migrate admin pages
  - [x] 31.1 Migrate AllMarketListings page
    - Update `src/pages/admin/AllMarketListings.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - Use LazySection for listing sections
    - _Requirements: 1.1, 1.2, 1.3, 12.2_
  
  - [x] 31.2 Migrate AdminAlerts page
    - Update `src/pages/admin/AdminAlerts.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 31.3 Migrate AdminAttributeDefinitions page
    - Update `src/pages/admin/AdminAttributeDefinitions.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 31.4 Migrate AdminAuditLogs page
    - Update `src/pages/admin/AdminAuditLogs.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 31.5 Migrate AdminGameItemAttributes page
    - Update `src/pages/admin/AdminGameItemAttributes.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 31.6 Migrate AdminImportMonitoring page
    - Update `src/pages/admin/AdminImportMonitoring.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 31.7 Migrate AdminModeration page
    - Update `src/pages/admin/AdminModeration.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 31.8 Migrate AdminNotificationTest page
    - Update `src/pages/admin/AdminNotificationTest.tsx`
    - Use StandardPageLayout
    - Extract logic to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 31.9 Migrate AdminOrderStats page
    - Update `src/pages/admin/AdminOrderStats.tsx`
    - Use StandardPageLayout
    - Extract data fetching to page hook
    - Use LazySection for stats sections
    - _Requirements: 1.1, 1.2, 1.3, 12.2_

### Authentication Pages

- [x] 32. Migrate authentication pages
  - [x] 32.1 Migrate LoginPage
    - Update `src/pages/authentication/LoginPage.tsx`
    - Use FormPageLayout with minimal layout
    - Extract auth logic to page hook
    - _Requirements: 1.1, 1.2, 2.6, 12.2_
  
  - [x] 32.2 Migrate SignUpPage
    - Update `src/pages/authentication/SignUpPage.tsx`
    - Use FormPageLayout with minimal layout
    - Extract auth logic to page hook
    - _Requirements: 1.1, 1.2, 2.6, 12.2_
  
  - [x] 32.3 Migrate AuthenticateRSI page
    - Update `src/pages/authentication/AuthenticateRSI.tsx`
    - Use StandardPageLayout with minimal layout
    - Extract auth logic to page hook
    - _Requirements: 1.1, 1.2, 12.2_

### Email Pages

- [x] 33. Migrate email pages
  - [x] 33.1 Migrate EmailVerificationPage
    - Update `src/pages/email/EmailVerificationPage.tsx`
    - Use StandardPageLayout with minimal layout
    - Extract verification logic to page hook
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 33.2 Migrate UnsubscribePage
    - Update `src/pages/email/UnsubscribePage.tsx`
    - Use StandardPageLayout with minimal layout
    - Extract unsubscribe logic to page hook
    - _Requirements: 1.1, 1.2, 12.2_

### Home Pages

- [x] 34. Migrate home pages
  - [x] 34.1 Migrate LandingPage
    - Update `src/pages/home/LandingPage.tsx`
    - Use StandardPageLayout with custom layout
    - Use LazySection for landing sections
    - Follow LANDING_PAGE_IMPORT_STRATEGY.md guidance
    - _Requirements: 1.1, 1.2, 3.1, 12.2_

### Widget Pages

- [ ] 35. Migrate widget pages
  - [ ] 35.1 Migrate OrdersWidget page
    - Update `src/pages/widget/OrdersWidget.tsx`
    - Use StandardPageLayout with minimal layout
    - Extract data fetching to page hook
    - _Requirements: 1.1, 1.2, 12.2_

### Error Pages

- [x] 36. Migrate error pages
  - [x] 36.1 Migrate Error404 page
    - Update `src/pages/errors/Error404.tsx`
    - Use StandardPageLayout with minimal layout
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 36.2 Migrate ErrorPage
    - Update `src/pages/errors/ErrorPage.tsx`
    - Use StandardPageLayout with minimal layout
    - _Requirements: 1.1, 1.2, 12.2_
  
  - [x] 36.3 Migrate FrontendError page
    - Update `src/pages/errors/FrontendError.tsx`
    - Use StandardPageLayout with minimal layout
    - _Requirements: 1.1, 1.2, 12.2_

- [ ] 37. Final migration checkpoint
  - Ensure all pages have been migrated
  - Verify all tests pass
  - Review migration completeness
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Migration is incremental - old and new patterns coexist
- Focus on two pilot pages (ViewMarketListing, ViewOrg) before broader migration
- Documentation is created alongside implementation for immediate reference
- Phase 2 migration tasks are organized by feature area for easier tracking
- Complex pages (ViewOrder, Contracts) may require additional sub-tasks during implementation
- Page hooks should be created before migrating pages that need them
- LazySection usage is recommended for pages with multiple independent content areas
