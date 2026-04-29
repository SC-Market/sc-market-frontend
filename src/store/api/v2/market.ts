import { generatedApiV2 as api } from "../../generatedApiV2"
export const addTagTypes = [
  "Variant Types V2",
  "Stock Lots V2",
  "Orders V2",
  "Offers V2",
  "Listings V2",
  "Inventory V2",
  "Admin Imports",
  "Health",
  "Game Items V2",
  "Game Data - Wishlists",
  "Game Data - Wiki",
  "Game Data - Versions",
  "Game Data - Resources",
  "Game Data - Missions",
  "Game Data - Crafting",
  "Game Data - Blueprints",
  "Debug V2",
  "Cart V2",
  "Buy Orders V2",
  "Availability",
  "Auctions V2",
  "Analytics V2",
  "Admin Migration",
  "Admin Feature Flags",
  "Admin",
] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getVariantTypes: build.query<
        GetVariantTypesApiResponse,
        GetVariantTypesApiArg
      >({
        query: () => ({ url: `/variant-types` }),
        providesTags: ["Variant Types V2"],
      }),
      createStockLot: build.mutation<
        CreateStockLotApiResponse,
        CreateStockLotApiArg
      >({
        query: (queryArg) => ({
          url: `/stock-lots`,
          method: "POST",
          body: queryArg.createStockLotRequest,
        }),
        invalidatesTags: ["Stock Lots V2"],
      }),
      getStockLots: build.query<GetStockLotsApiResponse, GetStockLotsApiArg>({
        query: (queryArg) => ({
          url: `/stock-lots`,
          params: {
            listing_id: queryArg.listingId,
            game_item_id: queryArg.gameItemId,
            location_id: queryArg.locationId,
            listed: queryArg.listed,
            variant_id: queryArg.variantId,
            quality_tier_min: queryArg.qualityTierMin,
            quality_tier_max: queryArg.qualityTierMax,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Stock Lots V2"],
      }),
      updateStockLot: build.mutation<
        UpdateStockLotApiResponse,
        UpdateStockLotApiArg
      >({
        query: (queryArg) => ({
          url: `/stock-lots/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateStockLotRequest,
        }),
        invalidatesTags: ["Stock Lots V2"],
      }),
      deleteStockLot: build.mutation<
        DeleteStockLotApiResponse,
        DeleteStockLotApiArg
      >({
        query: (queryArg) => ({
          url: `/stock-lots/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Stock Lots V2"],
      }),
      bulkUpdateStockLots: build.mutation<
        BulkUpdateStockLotsApiResponse,
        BulkUpdateStockLotsApiArg
      >({
        query: (queryArg) => ({
          url: `/stock-lots/bulk-update`,
          method: "POST",
          body: queryArg.bulkUpdateStockLotsRequest,
        }),
        invalidatesTags: ["Stock Lots V2"],
      }),
      createOrder: build.mutation<CreateOrderApiResponse, CreateOrderApiArg>({
        query: (queryArg) => ({
          url: `/orders`,
          method: "POST",
          body: queryArg.createOrderRequest,
        }),
        invalidatesTags: ["Orders V2"],
      }),
      getOrders: build.query<GetOrdersApiResponse, GetOrdersApiArg>({
        query: (queryArg) => ({
          url: `/orders`,
          params: {
            status: queryArg.status,
            role: queryArg.role,
            quality_tier_min: queryArg.qualityTierMin,
            quality_tier_max: queryArg.qualityTierMax,
            page: queryArg.page,
            page_size: queryArg.pageSize,
            sort_by: queryArg.sortBy,
            sort_order: queryArg.sortOrder,
          },
        }),
        providesTags: ["Orders V2"],
      }),
      getOrderDetail: build.query<
        GetOrderDetailApiResponse,
        GetOrderDetailApiArg
      >({
        query: (queryArg) => ({ url: `/orders/${queryArg.orderId}` }),
        providesTags: ["Orders V2"],
      }),
      getOrdersByListing: build.query<
        GetOrdersByListingApiResponse,
        GetOrdersByListingApiArg
      >({
        query: (queryArg) => ({
          url: `/orders/by-listing/${queryArg.listingId}`,
        }),
        providesTags: ["Orders V2"],
      }),
      getOfferSession: build.query<
        GetOfferSessionApiResponse,
        GetOfferSessionApiArg
      >({
        query: (queryArg) => ({ url: `/offers/${queryArg.sessionId}` }),
        providesTags: ["Offers V2"],
      }),
      searchOffers: build.query<SearchOffersApiResponse, SearchOffersApiArg>({
        query: (queryArg) => ({
          url: `/offers/search`,
          params: {
            role: queryArg.role,
            status: queryArg.status,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Offers V2"],
      }),
      createListing: build.mutation<
        CreateListingApiResponse,
        CreateListingApiArg
      >({
        query: (queryArg) => ({
          url: `/listings`,
          method: "POST",
          body: queryArg.createListingRequest,
        }),
        invalidatesTags: ["Listings V2"],
      }),
      searchListings: build.query<
        SearchListingsApiResponse,
        SearchListingsApiArg
      >({
        query: (queryArg) => ({
          url: `/listings/search`,
          params: {
            text: queryArg.text,
            game_item_id: queryArg.gameItemId,
            quality_tier_min: queryArg.qualityTierMin,
            quality_tier_max: queryArg.qualityTierMax,
            price_min: queryArg.priceMin,
            price_max: queryArg.priceMax,
            page: queryArg.page,
            page_size: queryArg.pageSize,
            item_type: queryArg.itemType,
            quantity_min: queryArg.quantityMin,
            status: queryArg.status,
            sort_by: queryArg.sortBy,
            sort_order: queryArg.sortOrder,
            language_codes: queryArg.languageCodes,
            listing_type: queryArg.listingType,
            seller_username: queryArg.sellerUsername,
            contractor_spectrum_id: queryArg.contractorSpectrumId,
          },
        }),
        providesTags: ["Listings V2"],
      }),
      getMyListings: build.query<GetMyListingsApiResponse, GetMyListingsApiArg>(
        {
          query: (queryArg) => ({
            url: `/listings/mine`,
            params: {
              status: queryArg.status,
              page: queryArg.page,
              page_size: queryArg.pageSize,
              sort_by: queryArg.sortBy,
              sort_order: queryArg.sortOrder,
              spectrum_id: queryArg.spectrumId,
            },
          }),
          providesTags: ["Listings V2"],
        },
      ),
      getInventorySummary: build.query<
        GetInventorySummaryApiResponse,
        GetInventorySummaryApiArg
      >({
        query: (queryArg) => ({
          url: `/listings/inventory-summary`,
          params: {
            spectrum_id: queryArg.spectrumId,
          },
        }),
        providesTags: ["Listings V2"],
      }),
      getListingDetail: build.query<
        GetListingDetailApiResponse,
        GetListingDetailApiArg
      >({
        query: (queryArg) => ({ url: `/listings/${queryArg.id}` }),
        providesTags: ["Listings V2"],
      }),
      updateListing: build.mutation<
        UpdateListingApiResponse,
        UpdateListingApiArg
      >({
        query: (queryArg) => ({
          url: `/listings/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateListingRequest,
        }),
        invalidatesTags: ["Listings V2"],
      }),
      deleteListing: build.mutation<
        DeleteListingApiResponse,
        DeleteListingApiArg
      >({
        query: (queryArg) => ({
          url: `/listings/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Listings V2"],
      }),
      refreshListing: build.mutation<
        RefreshListingApiResponse,
        RefreshListingApiArg
      >({
        query: (queryArg) => ({
          url: `/listings/${queryArg.id}/refresh`,
          method: "POST",
        }),
        invalidatesTags: ["Listings V2"],
      }),
      trackView: build.mutation<TrackViewApiResponse, TrackViewApiArg>({
        query: (queryArg) => ({
          url: `/listings/${queryArg.id}/views`,
          method: "POST",
        }),
        invalidatesTags: ["Listings V2"],
      }),
      uploadPhotos: build.mutation<UploadPhotosApiResponse, UploadPhotosApiArg>(
        {
          query: (queryArg) => {
            const formData = new FormData()
            for (const file of queryArg.photos) {
              formData.append("photos", file)
            }
            return {
              url: `/listings/${queryArg.id}/photos`,
              method: "POST",
              body: formData,
            }
          },
          invalidatesTags: ["Listings V2"],
        },
      ),
      getInventory: build.query<GetInventoryApiResponse, GetInventoryApiArg>({
        query: (queryArg) => ({
          url: `/inventory`,
          params: {
            game_item_id: queryArg.gameItemId,
            listing_id: queryArg.listingId,
            listed: queryArg.listed,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Inventory V2"],
      }),
      createInventoryLot: build.mutation<
        CreateInventoryLotApiResponse,
        CreateInventoryLotApiArg
      >({
        query: (queryArg) => ({
          url: `/inventory`,
          method: "POST",
          body: queryArg.createInventoryLotRequest,
        }),
        invalidatesTags: ["Inventory V2"],
      }),
      linkToListing: build.mutation<
        LinkToListingApiResponse,
        LinkToListingApiArg
      >({
        query: (queryArg) => ({
          url: `/inventory/${queryArg.lotId}/list`,
          method: "POST",
          body: queryArg.linkToListingRequest,
        }),
        invalidatesTags: ["Inventory V2"],
      }),
      unlinkFromListing: build.mutation<
        UnlinkFromListingApiResponse,
        UnlinkFromListingApiArg
      >({
        query: (queryArg) => ({
          url: `/inventory/${queryArg.lotId}/unlist`,
          method: "POST",
        }),
        invalidatesTags: ["Inventory V2"],
      }),
      deleteInventoryLot: build.mutation<
        DeleteInventoryLotApiResponse,
        DeleteInventoryLotApiArg
      >({
        query: (queryArg) => ({
          url: `/inventory/${queryArg.lotId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Inventory V2"],
      }),
      startImport: build.mutation<StartImportApiResponse, StartImportApiArg>({
        query: (queryArg) => ({
          url: `/admin/imports/${queryArg.source}`,
          method: "POST",
        }),
        invalidatesTags: ["Admin Imports"],
      }),
      getJobStatus: build.query<GetJobStatusApiResponse, GetJobStatusApiArg>({
        query: (queryArg) => ({ url: `/admin/imports/${queryArg.jobId}` }),
        providesTags: ["Admin Imports"],
      }),
      listJobs: build.query<ListJobsApiResponse, ListJobsApiArg>({
        query: () => ({ url: `/admin/imports` }),
        providesTags: ["Admin Imports"],
      }),
      getHealth: build.query<GetHealthApiResponse, GetHealthApiArg>({
        query: () => ({ url: `/health` }),
        providesTags: ["Health"],
      }),
      searchGameItems: build.query<
        SearchGameItemsApiResponse,
        SearchGameItemsApiArg
      >({
        query: (queryArg) => ({
          url: `/game-items/search`,
          params: {
            query: queryArg.query,
          },
        }),
        providesTags: ["Game Items V2"],
      }),
      getCategories: build.query<GetCategoriesApiResponse, GetCategoriesApiArg>(
        {
          query: () => ({ url: `/game-items/categories` }),
          providesTags: ["Game Items V2"],
        },
      ),
      getListings: build.query<GetListingsApiResponse, GetListingsApiArg>({
        query: (queryArg) => ({
          url: `/game-items/${queryArg.id}/listings`,
          params: {
            quality_tier: queryArg.qualityTier,
            sort_by: queryArg.sortBy,
            sort_order: queryArg.sortOrder,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Game Items V2"],
      }),
      searchGameItemAggregates: build.query<
        SearchGameItemAggregatesApiResponse,
        SearchGameItemAggregatesApiArg
      >({
        query: (queryArg) => ({
          url: `/game-items/aggregates`,
          params: {
            text: queryArg.text,
            item_type: queryArg.itemType,
            price_min: queryArg.priceMin,
            price_max: queryArg.priceMax,
            quantity_min: queryArg.quantityMin,
            quantity_max: queryArg.quantityMax,
            sort_by: queryArg.sortBy,
            sort_order: queryArg.sortOrder,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Game Items V2"],
      }),
      getWishlists: build.query<GetWishlistsApiResponse, GetWishlistsApiArg>({
        query: () => ({ url: `/game-data/wishlists` }),
        providesTags: ["Game Data - Wishlists"],
      }),
      createWishlist: build.mutation<
        CreateWishlistApiResponse,
        CreateWishlistApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/wishlists`,
          method: "POST",
          body: queryArg.createWishlistRequest,
        }),
        invalidatesTags: ["Game Data - Wishlists"],
      }),
      getWishlist: build.query<GetWishlistApiResponse, GetWishlistApiArg>({
        query: (queryArg) => ({
          url: `/game-data/wishlists/${queryArg.wishlistId}`,
          params: {
            share_token: queryArg.shareToken,
          },
        }),
        providesTags: ["Game Data - Wishlists"],
      }),
      updateWishlist: build.mutation<
        UpdateWishlistApiResponse,
        UpdateWishlistApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/wishlists/${queryArg.wishlistId}`,
          method: "PUT",
          body: queryArg.updateWishlistRequest,
        }),
        invalidatesTags: ["Game Data - Wishlists"],
      }),
      deleteWishlist: build.mutation<
        DeleteWishlistApiResponse,
        DeleteWishlistApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/wishlists/${queryArg.wishlistId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Game Data - Wishlists"],
      }),
      addWishlistItem: build.mutation<
        AddWishlistItemApiResponse,
        AddWishlistItemApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/wishlists/${queryArg.wishlistId}/items`,
          method: "POST",
          body: queryArg.addWishlistItemRequest,
        }),
        invalidatesTags: ["Game Data - Wishlists"],
      }),
      removeWishlistItem: build.mutation<
        RemoveWishlistItemApiResponse,
        RemoveWishlistItemApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/wishlists/${queryArg.wishlistId}/items/${queryArg.itemId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Game Data - Wishlists"],
      }),
      updateWishlistItem: build.mutation<
        UpdateWishlistItemApiResponse,
        UpdateWishlistItemApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/wishlists/${queryArg.wishlistId}/items/${queryArg.itemId}`,
          method: "PUT",
          body: queryArg.updateWishlistItemRequest,
        }),
        invalidatesTags: ["Game Data - Wishlists"],
      }),
      generateShoppingList: build.query<
        GenerateShoppingListApiResponse,
        GenerateShoppingListApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/wishlists/${queryArg.wishlistId}/shopping-list`,
        }),
        providesTags: ["Game Data - Wishlists"],
      }),
      searchItems: build.query<SearchItemsApiResponse, SearchItemsApiArg>({
        query: (queryArg) => ({
          url: `/game-data/wiki/items`,
          params: {
            text: queryArg.text,
            type: queryArg["type"],
            sub_type: queryArg.subType,
            size: queryArg.size,
            grade: queryArg.grade,
            manufacturer: queryArg.manufacturer,
            category: queryArg.category,
            version_id: queryArg.versionId,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Game Data - Wiki"],
      }),
      getItemDetail: build.query<GetItemDetailApiResponse, GetItemDetailApiArg>(
        {
          query: (queryArg) => ({
            url: `/game-data/wiki/items/${queryArg.id}`,
          }),
          providesTags: ["Game Data - Wiki"],
        },
      ),
      getShips: build.query<GetShipsApiResponse, GetShipsApiArg>({
        query: (queryArg) => ({
          url: `/game-data/wiki/ships`,
          params: {
            manufacturer: queryArg.manufacturer,
            focus: queryArg.focus,
            size: queryArg.size,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Game Data - Wiki"],
      }),
      getShipDetail: build.query<GetShipDetailApiResponse, GetShipDetailApiArg>(
        {
          query: (queryArg) => ({
            url: `/game-data/wiki/ships/${queryArg.id}`,
          }),
          providesTags: ["Game Data - Wiki"],
        },
      ),
      getCommodities: build.query<
        GetCommoditiesApiResponse,
        GetCommoditiesApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/wiki/commodities`,
          params: {
            category: queryArg.category,
            can_be_mined: queryArg.canBeMined,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Game Data - Wiki"],
      }),
      getLocations: build.query<GetLocationsApiResponse, GetLocationsApiArg>({
        query: (queryArg) => ({
          url: `/game-data/wiki/locations`,
          params: {
            parent_id: queryArg.parentId,
          },
        }),
        providesTags: ["Game Data - Wiki"],
      }),
      getManufacturers: build.query<
        GetManufacturersApiResponse,
        GetManufacturersApiArg
      >({
        query: () => ({ url: `/game-data/wiki/manufacturers` }),
        providesTags: ["Game Data - Wiki"],
      }),
      getManufacturerDetail: build.query<
        GetManufacturerDetailApiResponse,
        GetManufacturerDetailApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/wiki/manufacturers/${queryArg.id}`,
        }),
        providesTags: ["Game Data - Wiki"],
      }),
      listVersions: build.query<ListVersionsApiResponse, ListVersionsApiArg>({
        query: () => ({ url: `/game-data/versions` }),
        providesTags: ["Game Data - Versions"],
      }),
      getActiveVersions: build.query<
        GetActiveVersionsApiResponse,
        GetActiveVersionsApiArg
      >({
        query: () => ({ url: `/game-data/versions/active` }),
        providesTags: ["Game Data - Versions"],
      }),
      selectVersion: build.mutation<
        SelectVersionApiResponse,
        SelectVersionApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/versions/select`,
          method: "POST",
          body: queryArg.selectVersionRequest,
        }),
        invalidatesTags: ["Game Data - Versions"],
      }),
      searchResources: build.query<
        SearchResourcesApiResponse,
        SearchResourcesApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/resources/search`,
          params: {
            text: queryArg.text,
            resource_category: queryArg.resourceCategory,
            resource_subcategory: queryArg.resourceSubcategory,
            acquisition_method: queryArg.acquisitionMethod,
            version_id: queryArg.versionId,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Game Data - Resources"],
      }),
      getResource: build.query<GetResourceApiResponse, GetResourceApiArg>({
        query: (queryArg) => ({
          url: `/game-data/resources/${queryArg.resourceId}`,
        }),
        providesTags: ["Game Data - Resources"],
      }),
      getResourceCategories: build.query<
        GetResourceCategoriesApiResponse,
        GetResourceCategoriesApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/resources/categories`,
          params: {
            version_id: queryArg.versionId,
          },
        }),
        providesTags: ["Game Data - Resources"],
      }),
      searchMissions: build.query<
        SearchMissionsApiResponse,
        SearchMissionsApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/missions/search`,
          params: {
            text: queryArg.text,
            category: queryArg.category,
            career_type: queryArg.careerType,
            star_system: queryArg.starSystem,
            planet_moon: queryArg.planetMoon,
            faction: queryArg.faction,
            mission_giver_org: queryArg.missionGiverOrg,
            legal_status: queryArg.legalStatus,
            difficulty_min: queryArg.difficultyMin,
            difficulty_max: queryArg.difficultyMax,
            is_shareable: queryArg.isShareable,
            availability_type: queryArg.availabilityType,
            associated_event: queryArg.associatedEvent,
            is_chain_starter: queryArg.isChainStarter,
            has_blueprint_rewards: queryArg.hasBlueprintRewards,
            credit_reward_min: queryArg.creditRewardMin,
            community_difficulty_min: queryArg.communityDifficultyMin,
            community_satisfaction_min: queryArg.communitySatisfactionMin,
            event_code: queryArg.eventCode,
            exclude_events: queryArg.excludeEvents,
            version_id: queryArg.versionId,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Game Data - Missions"],
      }),
      getMissionDetail: build.query<
        GetMissionDetailApiResponse,
        GetMissionDetailApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/missions/${queryArg.missionId}`,
        }),
        providesTags: ["Game Data - Missions"],
      }),
      getMissionDetailByCode: build.query<
        GetMissionDetailByCodeApiResponse,
        GetMissionDetailByCodeApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/missions/by-code/${queryArg.missionCode}`,
        }),
        providesTags: ["Game Data - Missions"],
      }),
      getMissionBlueprints: build.query<
        GetMissionBlueprintsApiResponse,
        GetMissionBlueprintsApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/missions/${queryArg.missionId}/blueprints`,
        }),
        providesTags: ["Game Data - Missions"],
      }),
      completeMission: build.mutation<
        CompleteMissionApiResponse,
        CompleteMissionApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/missions/${queryArg.missionId}/complete`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Game Data - Missions"],
      }),
      rateMission: build.mutation<RateMissionApiResponse, RateMissionApiArg>({
        query: (queryArg) => ({
          url: `/game-data/missions/${queryArg.missionId}/rate`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Game Data - Missions"],
      }),
      getMissionChains: build.query<
        GetMissionChainsApiResponse,
        GetMissionChainsApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/missions/chains`,
          params: {
            version_id: queryArg.versionId,
          },
        }),
        providesTags: ["Game Data - Missions"],
      }),
      getReputationRanks: build.query<
        GetReputationRanksApiResponse,
        GetReputationRanksApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/missions/reputation-ranks`,
          params: {
            scope_code: queryArg.scopeCode,
          },
        }),
        providesTags: ["Game Data - Missions"],
      }),
      getGameEvents: build.query<GetGameEventsApiResponse, GetGameEventsApiArg>(
        {
          query: () => ({ url: `/game-data/missions/events` }),
          providesTags: ["Game Data - Missions"],
        },
      ),
      calculateQuality: build.mutation<
        CalculateQualityApiResponse,
        CalculateQualityApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/crafting/calculate-quality`,
          method: "POST",
          body: queryArg.calculateQualityRequest,
        }),
        invalidatesTags: ["Game Data - Crafting"],
      }),
      simulateCrafting: build.mutation<
        SimulateCraftingApiResponse,
        SimulateCraftingApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/crafting/simulate`,
          method: "POST",
          body: queryArg.simulateCraftingRequest,
        }),
        invalidatesTags: ["Game Data - Crafting"],
      }),
      recordCrafting: build.mutation<
        RecordCraftingApiResponse,
        RecordCraftingApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/crafting/craft`,
          method: "POST",
          body: queryArg.recordCraftingRequest,
        }),
        invalidatesTags: ["Game Data - Crafting"],
      }),
      getCraftingHistory: build.query<
        GetCraftingHistoryApiResponse,
        GetCraftingHistoryApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/crafting/history`,
          params: {
            blueprint_id: queryArg.blueprintId,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Game Data - Crafting"],
      }),
      getCraftableItems: build.query<
        GetCraftableItemsApiResponse,
        GetCraftableItemsApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/crafting/craftable-items`,
          params: {
            item_category: queryArg.itemCategory,
            rarity: queryArg.rarity,
            tier: queryArg.tier,
            craftable_only: queryArg.craftableOnly,
            version_id: queryArg.versionId,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Game Data - Crafting"],
      }),
      getCraftingStatistics: build.query<
        GetCraftingStatisticsApiResponse,
        GetCraftingStatisticsApiArg
      >({
        query: () => ({ url: `/game-data/crafting/statistics` }),
        providesTags: ["Game Data - Crafting"],
      }),
      searchBlueprints: build.query<
        SearchBlueprintsApiResponse,
        SearchBlueprintsApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/blueprints/search`,
          params: {
            text: queryArg.text,
            item_category: queryArg.itemCategory,
            item_subcategory: queryArg.itemSubcategory,
            rarity: queryArg.rarity,
            tier: queryArg.tier,
            crafting_station_type: queryArg.craftingStationType,
            output_game_item_id: queryArg.outputGameItemId,
            user_owned_only: queryArg.userOwnedOnly,
            source: queryArg.source,
            manufacturer: queryArg.manufacturer,
            ingredient_name: queryArg.ingredientName,
            version_id: queryArg.versionId,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Game Data - Blueprints"],
      }),
      getBlueprintDetail: build.query<
        GetBlueprintDetailApiResponse,
        GetBlueprintDetailApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/blueprints/${queryArg.blueprintId}`,
        }),
        providesTags: ["Game Data - Blueprints"],
      }),
      getBlueprintDetailByCode: build.query<
        GetBlueprintDetailByCodeApiResponse,
        GetBlueprintDetailByCodeApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/blueprints/by-code/${queryArg.blueprintCode}`,
        }),
        providesTags: ["Game Data - Blueprints"],
      }),
      getBlueprintMissions: build.query<
        GetBlueprintMissionsApiResponse,
        GetBlueprintMissionsApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/blueprints/${queryArg.blueprintId}/missions`,
          params: {
            version_id: queryArg.versionId,
          },
        }),
        providesTags: ["Game Data - Blueprints"],
      }),
      addBlueprintToInventory: build.mutation<
        AddBlueprintToInventoryApiResponse,
        AddBlueprintToInventoryApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/blueprints/${queryArg.blueprintId}/inventory`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Game Data - Blueprints"],
      }),
      removeBlueprintFromInventory: build.mutation<
        RemoveBlueprintFromInventoryApiResponse,
        RemoveBlueprintFromInventoryApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/blueprints/${queryArg.blueprintId}/inventory`,
          method: "DELETE",
        }),
        invalidatesTags: ["Game Data - Blueprints"],
      }),
      getBlueprintCategories: build.query<
        GetBlueprintCategoriesApiResponse,
        GetBlueprintCategoriesApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/blueprints/categories`,
          params: {
            version_id: queryArg.versionId,
          },
        }),
        providesTags: ["Game Data - Blueprints"],
      }),
      getUserBlueprintInventory: build.query<
        GetUserBlueprintInventoryApiResponse,
        GetUserBlueprintInventoryApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/blueprints/inventory`,
          params: {
            item_category: queryArg.itemCategory,
            rarity: queryArg.rarity,
            version_id: queryArg.versionId,
            sort_by: queryArg.sortBy,
            sort_order: queryArg.sortOrder,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Game Data - Blueprints"],
      }),
      getOrgBlueprintOwners: build.query<
        GetOrgBlueprintOwnersApiResponse,
        GetOrgBlueprintOwnersApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/blueprints/${queryArg.blueprintId}/org-owners/${queryArg.spectrumId}`,
        }),
        providesTags: ["Game Data - Blueprints"],
      }),
      findCraftableBlueprints: build.mutation<
        FindCraftableBlueprintsApiResponse,
        FindCraftableBlueprintsApiArg
      >({
        query: (queryArg) => ({
          url: `/game-data/blueprints/craftable`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Game Data - Blueprints"],
      }),
      getFeatureFlag: build.query<
        GetFeatureFlagApiResponse,
        GetFeatureFlagApiArg
      >({
        query: () => ({ url: `/debug/feature-flag` }),
        providesTags: ["Debug V2"],
      }),
      setFeatureFlag: build.mutation<
        SetFeatureFlagApiResponse,
        SetFeatureFlagApiArg
      >({
        query: (queryArg) => ({
          url: `/debug/feature-flag`,
          method: "POST",
          body: queryArg.setFeatureFlagRequest,
        }),
        invalidatesTags: ["Debug V2"],
      }),
      getCart: build.query<GetCartApiResponse, GetCartApiArg>({
        query: () => ({ url: `/cart` }),
        providesTags: ["Cart V2"],
      }),
      addToCart: build.mutation<AddToCartApiResponse, AddToCartApiArg>({
        query: (queryArg) => ({
          url: `/cart/add`,
          method: "POST",
          body: queryArg.addToCartRequest,
        }),
        invalidatesTags: ["Cart V2"],
      }),
      updateCartItem: build.mutation<
        UpdateCartItemApiResponse,
        UpdateCartItemApiArg
      >({
        query: (queryArg) => ({
          url: `/cart/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateCartItemRequest,
        }),
        invalidatesTags: ["Cart V2"],
      }),
      removeCartItem: build.mutation<
        RemoveCartItemApiResponse,
        RemoveCartItemApiArg
      >({
        query: (queryArg) => ({
          url: `/cart/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Cart V2"],
      }),
      checkoutCart: build.mutation<CheckoutCartApiResponse, CheckoutCartApiArg>(
        {
          query: (queryArg) => ({
            url: `/cart/checkout`,
            method: "POST",
            body: queryArg.checkoutCartRequest,
          }),
          invalidatesTags: ["Cart V2"],
        },
      ),
      createPurchase: build.mutation<
        CreatePurchaseApiResponse,
        CreatePurchaseApiArg
      >({
        query: (queryArg) => ({
          url: `/buy-orders`,
          method: "POST",
          body: queryArg.createBuyOrderRequest,
        }),
        invalidatesTags: ["Buy Orders V2"],
      }),
      createStandingBuyOrder: build.mutation<
        CreateStandingBuyOrderApiResponse,
        CreateStandingBuyOrderApiArg
      >({
        query: (queryArg) => ({
          url: `/buy-orders/standing`,
          method: "POST",
          body: queryArg.createStandingBuyOrderRequest,
        }),
        invalidatesTags: ["Buy Orders V2"],
      }),
      searchBuyOrders: build.query<
        SearchBuyOrdersApiResponse,
        SearchBuyOrdersApiArg
      >({
        query: (queryArg) => ({
          url: `/buy-orders/search`,
          params: {
            game_item_id: queryArg.gameItemId,
            quality_tier_min: queryArg.qualityTierMin,
            quality_tier_max: queryArg.qualityTierMax,
            quality_value_min: queryArg.qualityValueMin,
            quality_value_max: queryArg.qualityValueMax,
            sort_by: queryArg.sortBy,
            sort_order: queryArg.sortOrder,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Buy Orders V2"],
      }),
      getMyBuyOrders: build.query<
        GetMyBuyOrdersApiResponse,
        GetMyBuyOrdersApiArg
      >({
        query: (queryArg) => ({
          url: `/buy-orders/mine`,
          params: {
            status: queryArg.status,
            page: queryArg.page,
            page_size: queryArg.pageSize,
          },
        }),
        providesTags: ["Buy Orders V2"],
      }),
      updateBuyOrder: build.mutation<
        UpdateBuyOrderApiResponse,
        UpdateBuyOrderApiArg
      >({
        query: (queryArg) => ({
          url: `/buy-orders/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateStandingBuyOrderRequest,
        }),
        invalidatesTags: ["Buy Orders V2"],
      }),
      cancelBuyOrder: build.mutation<
        CancelBuyOrderApiResponse,
        CancelBuyOrderApiArg
      >({
        query: (queryArg) => ({
          url: `/buy-orders/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Buy Orders V2"],
      }),
      fulfillBuyOrder: build.mutation<
        FulfillBuyOrderApiResponse,
        FulfillBuyOrderApiArg
      >({
        query: (queryArg) => ({
          url: `/buy-orders/${queryArg.id}/fulfill`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Buy Orders V2"],
      }),
      getNextAvailable: build.query<
        GetNextAvailableApiResponse,
        GetNextAvailableApiArg
      >({
        query: (queryArg) => ({
          url: `/availability/next`,
          params: {
            username: queryArg.username,
            spectrum_id: queryArg.spectrumId,
          },
        }),
        providesTags: ["Availability"],
      }),
      getAuctionDetail: build.query<
        GetAuctionDetailApiResponse,
        GetAuctionDetailApiArg
      >({
        query: (queryArg) => ({ url: `/auctions/${queryArg.listingId}` }),
        providesTags: ["Auctions V2"],
      }),
      placeBid: build.mutation<PlaceBidApiResponse, PlaceBidApiArg>({
        query: (queryArg) => ({
          url: `/auctions/${queryArg.listingId}/bids`,
          method: "POST",
          body: queryArg.placeBidRequest,
        }),
        invalidatesTags: ["Auctions V2"],
      }),
      getPriceHistory: build.query<
        GetPriceHistoryApiResponse,
        GetPriceHistoryApiArg
      >({
        query: (queryArg) => ({
          url: `/analytics/price-history`,
          params: {
            game_item_id: queryArg.gameItemId,
            quality_tier: queryArg.qualityTier,
            start_date: queryArg.startDate,
            end_date: queryArg.endDate,
            interval: queryArg.interval,
          },
        }),
        providesTags: ["Analytics V2"],
      }),
      getQualityDistribution: build.query<
        GetQualityDistributionApiResponse,
        GetQualityDistributionApiArg
      >({
        query: (queryArg) => ({
          url: `/analytics/quality-distribution`,
          params: {
            game_item_id: queryArg.gameItemId,
            start_date: queryArg.startDate,
            end_date: queryArg.endDate,
          },
        }),
        providesTags: ["Analytics V2"],
      }),
      getSellerStats: build.query<
        GetSellerStatsApiResponse,
        GetSellerStatsApiArg
      >({
        query: (queryArg) => ({
          url: `/analytics/seller-stats`,
          params: {
            seller_id: queryArg.sellerId,
          },
        }),
        providesTags: ["Analytics V2"],
      }),
      getMigrationStatus: build.query<
        GetMigrationStatusApiResponse,
        GetMigrationStatusApiArg
      >({
        query: () => ({ url: `/admin/migration/status` }),
        providesTags: ["Admin Migration"],
      }),
      listMigrationJobs: build.query<
        ListMigrationJobsApiResponse,
        ListMigrationJobsApiArg
      >({
        query: () => ({ url: `/admin/migration/jobs` }),
        providesTags: ["Admin Migration"],
      }),
      getMigrationJob: build.query<
        GetMigrationJobApiResponse,
        GetMigrationJobApiArg
      >({
        query: (queryArg) => ({
          url: `/admin/migration/jobs/${queryArg.jobId}`,
        }),
        providesTags: ["Admin Migration"],
      }),
      runMigration: build.mutation<RunMigrationApiResponse, RunMigrationApiArg>(
        {
          query: (queryArg) => ({
            url: `/admin/migration/run`,
            method: "POST",
            body: queryArg.migrationRunRequest,
          }),
          invalidatesTags: ["Admin Migration"],
        },
      ),
      getConfig: build.query<GetConfigApiResponse, GetConfigApiArg>({
        query: () => ({ url: `/admin/feature-flags/config` }),
        providesTags: ["Admin Feature Flags"],
      }),
      updateConfig: build.mutation<UpdateConfigApiResponse, UpdateConfigApiArg>(
        {
          query: (queryArg) => ({
            url: `/admin/feature-flags/config`,
            method: "PUT",
            body: queryArg.updateConfigRequest,
          }),
          invalidatesTags: ["Admin Feature Flags"],
        },
      ),
      getStats: build.query<GetStatsApiResponse, GetStatsApiArg>({
        query: () => ({ url: `/admin/feature-flags/stats` }),
        providesTags: ["Admin Feature Flags"],
      }),
      getUserOverrides: build.query<
        GetUserOverridesApiResponse,
        GetUserOverridesApiArg
      >({
        query: (queryArg) => ({
          url: `/admin/feature-flags/overrides`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            search: queryArg.search,
            flag_name: queryArg.flagName,
          },
        }),
        providesTags: ["Admin Feature Flags"],
      }),
      setUserOverride: build.mutation<
        SetUserOverrideApiResponse,
        SetUserOverrideApiArg
      >({
        query: (queryArg) => ({
          url: `/admin/feature-flags/overrides`,
          method: "POST",
          body: queryArg.setUserOverrideRequest,
        }),
        invalidatesTags: ["Admin Feature Flags"],
      }),
      removeUserOverride: build.mutation<
        RemoveUserOverrideApiResponse,
        RemoveUserOverrideApiArg
      >({
        query: (queryArg) => ({
          url: `/admin/feature-flags/overrides/${queryArg.username}`,
          method: "DELETE",
          params: {
            flag_name: queryArg.flagName,
          },
        }),
        invalidatesTags: ["Admin Feature Flags"],
      }),
      importGameData: build.mutation<
        ImportGameDataApiResponse,
        ImportGameDataApiArg
      >({
        query: () => ({ url: `/admin/import-game-data`, method: "POST" }),
        invalidatesTags: ["Admin"],
      }),
      listGameDataImportJobs: build.query<
        ListGameDataImportJobsApiResponse,
        ListGameDataImportJobsApiArg
      >({
        query: () => ({ url: `/admin/import-game-data` }),
        providesTags: ["Admin"],
      }),
      getImportJobStatus: build.query<
        GetImportJobStatusApiResponse,
        GetImportJobStatusApiArg
      >({
        query: (queryArg) => ({
          url: `/admin/import-game-data/${queryArg.jobId}`,
        }),
        providesTags: ["Admin"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as marketV2Api }
export type GetVariantTypesApiResponse =
  /** status 200 All variant type definitions with validation rules */ GetVariantTypesResponse
export type GetVariantTypesApiArg = void
export type CreateStockLotApiResponse =
  /** status 200 Created stock lot */ UpdateStockLotResponse
export type CreateStockLotApiArg = {
  /** Create request with item_id, quantity, variant_attributes */
  createStockLotRequest: CreateStockLotRequest
}
export type GetStockLotsApiResponse =
  /** status 200 Stock lots with pagination metadata */ GetStockLotsResponse
export type GetStockLotsApiArg = {
  /** Filter by listing UUID */
  listingId?: string
  /** Filter by game item UUID */
  gameItemId?: string
  /** Filter by location UUID */
  locationId?: string
  /** Filter by listed status */
  listed?: boolean
  /** Filter by variant UUID */
  variantId?: string
  /** Minimum quality tier (1-5) */
  qualityTierMin?: number
  /** Maximum quality tier (1-5) */
  qualityTierMax?: number
  /** Page number for pagination (default: 1) */
  page?: number
  /** Number of results per page (default: 20, max: 100) */
  pageSize?: number
}
export type UpdateStockLotApiResponse =
  /** status 200 Updated stock lot */ UpdateStockLotResponse
export type UpdateStockLotApiArg = {
  /** Stock lot UUID */
  id: string
  /** Update request with optional fields */
  updateStockLotRequest: UpdateStockLotRequest
}
export type DeleteStockLotApiResponse = /** status 200 Ok */ {
  message: string
}
export type DeleteStockLotApiArg = {
  /** Stock lot UUID */
  id: string
}
export type BulkUpdateStockLotsApiResponse =
  /** status 200 Bulk update results with success/failure counts */ BulkUpdateStockLotsResponse
export type BulkUpdateStockLotsApiArg = {
  /** Bulk update request with array of lot updates */
  bulkUpdateStockLotsRequest: BulkUpdateStockLotsRequest
}
export type CreateOrderApiResponse =
  /** status 200 Created order with order_id and item details */ CreateOrderResponse
export type CreateOrderApiArg = {
  /** Order creation request with items array */
  createOrderRequest: CreateOrderRequest
}
export type GetOrdersApiResponse =
  /** status 200 Orders list with pagination metadata */ GetOrdersResponse
export type GetOrdersApiArg = {
  status?: "pending" | "completed" | "cancelled"
  role?: "buyer" | "seller"
  qualityTierMin?: number
  qualityTierMax?: number
  page?: number
  pageSize?: number
  sortBy?: "created_at" | "updated_at" | "total_price"
  sortOrder?: "asc" | "desc"
}
export type GetOrderDetailApiResponse =
  /** status 200 Order details with buyer/seller info and variant details */ GetOrderDetailResponse
export type GetOrderDetailApiArg = {
  /** UUID of the order to retrieve */
  orderId: string
}
export type GetOrdersByListingApiResponse =
  /** status 200 Ok */ OrdersByListingResponse
export type GetOrdersByListingApiArg = {
  /** Listing UUID */
  listingId: string
}
export type GetOfferSessionApiResponse =
  /** status 200 Ok */ GetOfferSessionV2Response
export type GetOfferSessionApiArg = {
  sessionId: string
}
export type SearchOffersApiResponse =
  /** status 200 Ok */ SearchOffersV2Response
export type SearchOffersApiArg = {
  role?: "customer" | "seller"
  status?: "active" | "closed"
  page?: number
  pageSize?: number
}
export type CreateListingApiResponse =
  /** status 200 Created listing with listing_id */ CreateListingResponse
export type CreateListingApiArg = {
  /** Listing creation request with title, description, pricing, and lots */
  createListingRequest: CreateListingRequest
}
export type SearchListingsApiResponse =
  /** status 200 Search results with pagination metadata */ SearchListingsResponse
export type SearchListingsApiArg = {
  /** Full-text search query */
  text?: string
  /** Filter by specific game item UUID */
  gameItemId?: string
  /** Minimum quality tier (1-5) */
  qualityTierMin?: number
  /** Maximum quality tier (1-5) */
  qualityTierMax?: number
  /** Minimum price filter */
  priceMin?: number
  /** Maximum price filter */
  priceMax?: number
  /** Page number for pagination (default: 1) */
  page?: number
  /** Number of results per page (default: 20, max: 100) */
  pageSize?: number
  itemType?: string
  quantityMin?: number
  status?: "active" | "sold" | "expired" | "cancelled"
  /** Sort field (default: created_at) */
  sortBy?:
    | "created_at"
    | "updated_at"
    | "price"
    | "quality"
    | "seller_rating"
    | "quantity"
  /** Sort order (default: desc) */
  sortOrder?: "asc" | "desc"
  languageCodes?: string
  listingType?: "single" | "bundle" | "bulk"
  sellerUsername?: string
  contractorSpectrumId?: string
}
export type GetMyListingsApiResponse =
  /** status 200 Updated listing with variant breakdown */ GetMyListingsResponse
export type GetMyListingsApiArg = {
  /** Filter by listing status */
  status?: "active" | "sold" | "expired" | "cancelled"
  /** Page number for pagination (default: 1) */
  page?: number
  /** Number of results per page (default: 20, max: 100) */
  pageSize?: number
  /** Sort field (default: created_at) */
  sortBy?: "created_at" | "updated_at" | "price" | "quantity"
  /** Sort order (default: desc) */
  sortOrder?: "asc" | "desc"
  spectrumId?: string
}
export type GetInventorySummaryApiResponse =
  /** status 200 Complete listing detail with variant breakdown */ InventorySummaryResponse
export type GetInventorySummaryApiArg = {
  spectrumId?: string
}
export type GetListingDetailApiResponse =
  /** status 200 Ok */ GetListingDetailResponse
export type GetListingDetailApiArg = {
  id: string
}
export type UpdateListingApiResponse =
  /** status 200 Search results with pagination metadata */ GetListingDetailResponse
export type UpdateListingApiArg = {
  id: string
  updateListingRequest: UpdateListingRequest
}
export type DeleteListingApiResponse = /** status 200 Success message */ {
  message: string
}
export type DeleteListingApiArg = {
  /** Listing UUID */
  id: string
}
export type RefreshListingApiResponse =
  /** status 200 Success message with next refresh time */ {
    next_refresh_at: string
    message: string
  }
export type RefreshListingApiArg = {
  /** Listing UUID */
  id: string
}
export type TrackViewApiResponse = /** status 200 Ok */ {
  views: number
}
export type TrackViewApiArg = {
  /** Listing UUID */
  id: string
}
export type UploadPhotosApiResponse = /** status 200 Ok */ {
  photos: {
    url: string
    resource_id: string
  }[]
}
export type UploadPhotosApiArg = {
  /** Listing UUID */
  id: string
  /** Photo files to upload */
  photos: File[]
}
export type GetInventoryApiResponse = /** status 200 Ok */ InventoryResponse
export type GetInventoryApiArg = {
  gameItemId?: string
  listingId?: string
  listed?: boolean
  page?: number
  pageSize?: number
}
export type CreateInventoryLotApiResponse = /** status 200 Ok */ {
  lot: InventoryLotDetail
}
export type CreateInventoryLotApiArg = {
  createInventoryLotRequest: CreateInventoryLotRequest
}
export type LinkToListingApiResponse = /** status 200 Ok */ {
  lot: InventoryLotDetail
}
export type LinkToListingApiArg = {
  lotId: string
  linkToListingRequest: LinkToListingRequest
}
export type UnlinkFromListingApiResponse = /** status 200 Ok */ {
  lot: InventoryLotDetail
}
export type UnlinkFromListingApiArg = {
  lotId: string
}
export type DeleteInventoryLotApiResponse = unknown
export type DeleteInventoryLotApiArg = {
  lotId: string
}
export type StartImportApiResponse = /** status 200 Ok */ {
  job: ImportJob
}
export type StartImportApiArg = {
  /** Import source: cstone-items, uex-items, or uex-attributes */
  source: ImportSource
}
export type GetJobStatusApiResponse = /** status 200 Ok */ {
  job: ImportJob | null
}
export type GetJobStatusApiArg = {
  /** The job ID returned from startImport */
  jobId: string
}
export type ListJobsApiResponse = /** status 200 Ok */ {
  jobs: ImportJob[]
}
export type ListJobsApiArg = void
export type GetHealthApiResponse = /** status 200 Ok */ HealthResponse
export type GetHealthApiArg = void
export type SearchGameItemsApiResponse =
  /** status 200 Ok */ GameItemSearchResult[]
export type SearchGameItemsApiArg = {
  /** Search text */
  query?: string
}
export type GetCategoriesApiResponse = /** status 200 Ok */ GameItemCategory[]
export type GetCategoriesApiArg = void
export type GetListingsApiResponse =
  /** status 200 Game item listings with quality distribution */ GetGameItemListingsResponse
export type GetListingsApiArg = {
  /** Game item UUID (required) */
  id: string
  /** Optional quality tier filter (1-5) */
  qualityTier?: number
  /** Sort field (default: price) */
  sortBy?: "price" | "quality" | "quantity" | "seller_rating"
  /** Sort order (default: asc) */
  sortOrder?: "asc" | "desc"
  /** Page number for pagination (default: 1) */
  page?: number
  /** Number of results per page (default: 20, max: 100) */
  pageSize?: number
}
export type SearchGameItemAggregatesApiResponse =
  /** status 200 Ok */ SearchGameItemAggregatesResponse
export type SearchGameItemAggregatesApiArg = {
  text?: string
  itemType?: string
  priceMin?: number
  priceMax?: number
  quantityMin?: number
  quantityMax?: number
  sortBy?: "price" | "quantity" | "name" | "seller_count"
  sortOrder?: "asc" | "desc"
  page?: number
  pageSize?: number
}
export type GetWishlistsApiResponse =
  /** status 200 List of user wishlists with statistics */ ListWishlistsResponse
export type GetWishlistsApiArg = void
export type CreateWishlistApiResponse =
  /** status 200 Created wishlist */ Wishlist
export type CreateWishlistApiArg = {
  createWishlistRequest: CreateWishlistRequest
}
export type GetWishlistApiResponse =
  /** status 200 Wishlist with items and statistics */ GetWishlistResponse
export type GetWishlistApiArg = {
  /** Wishlist UUID */
  wishlistId: string
  /** Optional share token for public wishlists */
  shareToken?: string
}
export type UpdateWishlistApiResponse =
  /** status 200 Updated wishlist */ Wishlist
export type UpdateWishlistApiArg = {
  /** Wishlist UUID */
  wishlistId: string
  updateWishlistRequest: UpdateWishlistRequest
}
export type DeleteWishlistApiResponse = /** status 200 Success response */ {
  success: boolean
}
export type DeleteWishlistApiArg = {
  /** Wishlist UUID */
  wishlistId: string
}
export type AddWishlistItemApiResponse =
  /** status 200 Created wishlist item */ WishlistItemWithDetails
export type AddWishlistItemApiArg = {
  /** Wishlist UUID */
  wishlistId: string
  addWishlistItemRequest: AddWishlistItemRequest
}
export type RemoveWishlistItemApiResponse = /** status 200 Success response */ {
  success: boolean
}
export type RemoveWishlistItemApiArg = {
  /** Wishlist UUID */
  wishlistId: string
  /** Item UUID */
  itemId: string
}
export type UpdateWishlistItemApiResponse =
  /** status 200 Updated wishlist item */ WishlistItemWithDetails
export type UpdateWishlistItemApiArg = {
  /** Wishlist UUID */
  wishlistId: string
  /** Item UUID */
  itemId: string
  updateWishlistItemRequest: UpdateWishlistItemRequest
}
export type GenerateShoppingListApiResponse =
  /** status 200 Shopping list with material requirements */ ShoppingListResponse
export type GenerateShoppingListApiArg = {
  /** Wishlist UUID */
  wishlistId: string
}
export type SearchItemsApiResponse =
  /** status 200 Wiki item search results with pagination */ SearchWikiItemsResponse
export type SearchItemsApiArg = {
  /** Full-text search on item name */
  text?: string
  /** Filter by item type (e.g., WeaponGun, Shield, PowerPlant) */
  type?: string
  /** Filter by item sub-type */
  subType?: string
  /** Filter by item size (1-5, S1-S5) */
  size?: string
  /** Filter by item grade (A, B, C, D, F) */
  grade?: string
  /** Filter by manufacturer name */
  manufacturer?: string
  /** Filter by game item category */
  category?: string
  /** Game version ID (defaults to active LIVE version) */
  versionId?: string
  /** Page number (default: 1) */
  page?: number
  /** Results per page (default: 20, max: 100) */
  pageSize?: number
}
export type GetItemDetailApiResponse =
  /** status 200 Complete item details with attributes, recipes, and missions */ WikiItemDetail
export type GetItemDetailApiArg = {
  /** Game item UUID */
  id: string
}
export type GetShipsApiResponse =
  /** status 200 Ship search results with pagination */ {
    page_size: number
    page: number
    total: number
    ships: WikiShipSearchResult[]
  }
export type GetShipsApiArg = {
  /** Filter by manufacturer */
  manufacturer?: string
  /** Filter by ship focus (e.g., Combat, Exploration, Mining) */
  focus?: string
  /** Filter by ship size */
  size?: string
  /** Page number (default: 1) */
  page?: number
  /** Results per page (default: 20, max: 100) */
  pageSize?: number
}
export type GetShipDetailApiResponse =
  /** status 200 Complete ship details with loadout */ WikiShipDetail
export type GetShipDetailApiArg = {
  /** Ship game item UUID */
  id: string
}
export type GetCommoditiesApiResponse =
  /** status 200 Commodity search results with pagination */ {
    page_size: number
    page: number
    total: number
    commodities: WikiCommoditySearchResult[]
  }
export type GetCommoditiesApiArg = {
  /** Filter by resource category */
  category?: string
  /** Filter to mineable resources only */
  canBeMined?: boolean
  /** Page number (default: 1) */
  page?: number
  /** Results per page (default: 20, max: 100) */
  pageSize?: number
}
export type GetLocationsApiResponse =
  /** status 200 Location hierarchy nodes */ WikiLocationNode[]
export type GetLocationsApiArg = {
  /** Optional parent location ID to get children */
  parentId?: string
}
export type GetManufacturersApiResponse =
  /** status 200 Manufacturer list */ WikiManufacturerSearchResult[]
export type GetManufacturersApiArg = void
export type GetManufacturerDetailApiResponse =
  /** status 200 Complete manufacturer details with items */ WikiManufacturerDetail
export type GetManufacturerDetailApiArg = {
  /** Manufacturer name */
  id: string
}
export type ListVersionsApiResponse =
  /** status 200 Array of all game versions */ GameVersion[]
export type ListVersionsApiArg = void
export type GetActiveVersionsApiResponse =
  /** status 200 Active versions by type */ ActiveVersionsResponse
export type GetActiveVersionsApiArg = void
export type SelectVersionApiResponse =
  /** status 200 Success response with selected version */ SelectVersionResponse
export type SelectVersionApiArg = {
  /** Version selection request */
  selectVersionRequest: SelectVersionRequest
}
export type SearchResourcesApiResponse =
  /** status 200 Resource search results with pagination */ SearchResourcesResponse
export type SearchResourcesApiArg = {
  /** Full-text search on resource name */
  text?: string
  /** Filter by resource category */
  resourceCategory?: string
  /** Filter by resource subcategory */
  resourceSubcategory?: string
  /** Filter by acquisition method */
  acquisitionMethod?: "mined" | "purchased" | "salvaged" | "looted"
  /** Game version ID (defaults to active LIVE version) */
  versionId?: string
  /** Page number (default: 1) */
  page?: number
  /** Results per page (default: 20, max: 100) */
  pageSize?: number
}
export type GetResourceApiResponse =
  /** status 200 Complete resource details with blueprints and locations */ ResourceDetailResponse
export type GetResourceApiArg = {
  /** Resource UUID */
  resourceId: string
}
export type GetResourceCategoriesApiResponse =
  /** status 200 Array of categories with counts */ ResourceCategory[]
export type GetResourceCategoriesApiArg = {
  /** Optional game version ID (defaults to active LIVE version) */
  versionId?: string
}
export type SearchMissionsApiResponse =
  /** status 200 Mission search results with pagination */ SearchMissionsResponse
export type SearchMissionsApiArg = {
  /** Full-text search on mission name */
  text?: string
  /** Filter by mission category */
  category?: string
  /** Filter by career type */
  careerType?: string
  /** Filter by star system */
  starSystem?: string
  /** Filter by planet or moon */
  planetMoon?: string
  /** Filter by faction */
  faction?: string
  missionGiverOrg?: string
  /** Filter by legal status */
  legalStatus?: "LEGAL" | "ILLEGAL"
  /** Minimum difficulty level (1-5) */
  difficultyMin?: number
  /** Maximum difficulty level (1-5) */
  difficultyMax?: number
  /** Filter by shareable status */
  isShareable?: boolean
  /** Filter by availability type */
  availabilityType?: string
  /** Filter by associated event */
  associatedEvent?: string
  /** Filter for chain starter missions */
  isChainStarter?: boolean
  /** Filter for missions with blueprint rewards */
  hasBlueprintRewards?: boolean
  /** Minimum credit reward */
  creditRewardMin?: number
  /** Minimum community difficulty rating */
  communityDifficultyMin?: number
  /** Minimum community satisfaction rating */
  communitySatisfactionMin?: number
  /** Filter by event code (show only missions for this event) */
  eventCode?: string
  /** Exclude event-only missions (default: true — hides seasonal missions) */
  excludeEvents?: boolean
  /** Game version ID (defaults to active LIVE version) */
  versionId?: string
  /** Page number (default: 1) */
  page?: number
  /** Results per page (default: 20, max: 100) */
  pageSize?: number
}
export type GetMissionDetailApiResponse =
  /** status 200 Complete mission details with reward pools */ MissionDetailResponse
export type GetMissionDetailApiArg = {
  /** Mission UUID */
  missionId: string
}
export type GetMissionDetailByCodeApiResponse =
  /** status 200 Ok */ MissionDetailResponse
export type GetMissionDetailByCodeApiArg = {
  /** The mission code string (e.g., pu_eliminatespecific_lawful_stanton4_intro) */
  missionCode: string
}
export type GetMissionBlueprintsApiResponse =
  /** status 200 Array of blueprint details with reward information */ BlueprintDetail[]
export type GetMissionBlueprintsApiArg = {
  /** Mission UUID */
  missionId: string
}
export type CompleteMissionApiResponse = /** status 200 Success response */ {
  completion_id: string
  success: boolean
}
export type CompleteMissionApiArg = {
  /** Mission UUID */
  missionId: string
  /** Completion details */
  body: {
    completion_notes?: string
    blueprints_rewarded?: string[]
  }
}
export type RateMissionApiResponse = /** status 200 Success response */ {
  rating_id: string
  success: boolean
}
export type RateMissionApiArg = {
  /** Mission UUID */
  missionId: string
  /** Rating details */
  body: {
    rating_comment?: string
    satisfaction_rating: number
    difficulty_rating: number
  }
}
export type GetMissionChainsApiResponse =
  /** status 200 Array of mission chains */ {
    total_missions: number
    chain_missions: Mission[]
    starter_mission: Mission
    chain_name: string
    chain_id: string
  }[]
export type GetMissionChainsApiArg = {
  /** Game version ID (defaults to active LIVE version) */
  versionId?: string
}
export type GetReputationRanksApiResponse = /** status 200 Ok */ {
  display_name: string
  scopes: string[]
  ranks: ReputationRank[]
}
export type GetReputationRanksApiArg = {
  /** The reputation scope code */
  scopeCode?: string
}
export type GetGameEventsApiResponse = /** status 200 Ok */ {
  events: GameEvent[]
}
export type GetGameEventsApiArg = void
export type CalculateQualityApiResponse =
  /** status 200 Quality calculation result with breakdown and predicted stats */ CalculateQualityResponse
export type CalculateQualityApiArg = {
  calculateQualityRequest: CalculateQualityRequest
}
export type SimulateCraftingApiResponse =
  /** status 200 Simulation results with best/worst/cost-effective options */ SimulateCraftingResponse
export type SimulateCraftingApiArg = {
  simulateCraftingRequest: SimulateCraftingRequest
}
export type RecordCraftingApiResponse =
  /** status 200 Success response with session ID */ RecordCraftingResponse
export type RecordCraftingApiArg = {
  recordCraftingRequest: RecordCraftingRequest
}
export type GetCraftingHistoryApiResponse =
  /** status 200 Paginated crafting history */ GetCraftingHistoryResponse
export type GetCraftingHistoryApiArg = {
  /** Optional blueprint filter */
  blueprintId?: string
  /** Page number (default: 1) */
  page?: number
  /** Results per page (default: 20, max: 100) */
  pageSize?: number
}
export type GetCraftableItemsApiResponse =
  /** status 200 Craftable items with material availability */ GetCraftableItemsResponse
export type GetCraftableItemsApiArg = {
  /** Filter by item category */
  itemCategory?: string
  /** Filter by rarity */
  rarity?: string
  /** Filter by tier (1-5) */
  tier?: number
  /** Show only items that can be crafted with current stock */
  craftableOnly?: boolean
  /** Game version ID (defaults to active LIVE version) */
  versionId?: string
  /** Page number (default: 1) */
  page?: number
  /** Results per page (default: 20, max: 100) */
  pageSize?: number
}
export type GetCraftingStatisticsApiResponse =
  /** status 200 Crafting statistics */ GetCraftingStatisticsResponse
export type GetCraftingStatisticsApiArg = void
export type SearchBlueprintsApiResponse =
  /** status 200 Blueprint search results with pagination */ SearchBlueprintsResponse
export type SearchBlueprintsApiArg = {
  /** Full-text search on blueprint name */
  text?: string
  /** Filter by item category */
  itemCategory?: string
  /** Filter by item subcategory */
  itemSubcategory?: string
  /** Filter by rarity */
  rarity?: string
  /** Filter by tier (1-5) */
  tier?: number
  /** Filter by crafting station type */
  craftingStationType?: string
  /** Filter by output game item ID */
  outputGameItemId?: string
  /** Filter to show only user-owned blueprints */
  userOwnedOnly?: boolean
  /** Filter by blueprint source (default, mission_reward) */
  source?: string
  /** Filter by manufacturer name */
  manufacturer?: string
  /** Filter by ingredient material name */
  ingredientName?: string
  /** Game version ID (defaults to active LIVE version) */
  versionId?: string
  /** Page number (default: 1) */
  page?: number
  /** Results per page (default: 20, max: 100) */
  pageSize?: number
}
export type GetBlueprintDetailApiResponse =
  /** status 200 Complete blueprint details with ingredients and missions */ BlueprintDetailResponse
export type GetBlueprintDetailApiArg = {
  /** Blueprint UUID */
  blueprintId: string
}
export type GetBlueprintDetailByCodeApiResponse =
  /** status 200 Ok */ BlueprintDetailResponse
export type GetBlueprintDetailByCodeApiArg = {
  /** The blueprint code string */
  blueprintCode: string
}
export type GetBlueprintMissionsApiResponse =
  /** status 200 Array of missions that reward this blueprint */ MissionRewardingBlueprint[]
export type GetBlueprintMissionsApiArg = {
  /** Blueprint UUID */
  blueprintId: string
  /** Optional game version ID */
  versionId?: string
}
export type AddBlueprintToInventoryApiResponse =
  /** status 200 Success response with inventory ID */ {
    inventory_id: string
    success: boolean
  }
export type AddBlueprintToInventoryApiArg = {
  /** Blueprint UUID */
  blueprintId: string
  /** Acquisition details */
  body: {
    acquisition_notes?: string
    acquisition_location?: string
    acquisition_method?: string
  }
}
export type RemoveBlueprintFromInventoryApiResponse =
  /** status 200 Success response */ {
    success: boolean
  }
export type RemoveBlueprintFromInventoryApiArg = {
  /** Blueprint UUID */
  blueprintId: string
}
export type GetBlueprintCategoriesApiResponse =
  /** status 200 Array of categories with counts */ BlueprintCategory[]
export type GetBlueprintCategoriesApiArg = {
  /** Optional game version ID (defaults to active LIVE version) */
  versionId?: string
}
export type GetUserBlueprintInventoryApiResponse =
  /** status 200 User's blueprint inventory with statistics */ {
    page_size: number
    page: number
    total: number
    statistics: {
      recently_acquired_count: number
      completion_percentage: number
      total_available: number
      total_owned: number
    }
    blueprints: {
      acquisition_notes?: string
      acquisition_location?: string
      acquisition_method?: string
      acquisition_date: string
      tier?: number
      rarity?: string
      item_category?: string
      output_item_icon?: string
      output_item_name: string
      blueprint_name: string
      blueprint_id: string
    }[]
  }
export type GetUserBlueprintInventoryApiArg = {
  /** Filter by item category */
  itemCategory?: string
  /** Filter by rarity */
  rarity?: string
  /** Game version ID (defaults to active LIVE version) */
  versionId?: string
  /** Sort field (acquisition_date, blueprint_name) */
  sortBy?: "acquisition_date" | "blueprint_name"
  /** Sort order (asc, desc) */
  sortOrder?: "asc" | "desc"
  /** Page number (default: 1) */
  page?: number
  /** Results per page (default: 50, max: 100) */
  pageSize?: number
}
export type GetOrgBlueprintOwnersApiResponse = /** status 200 Ok */ {
  members: {
    acquisition_date?: string
    avatar?: string
    display_name: string
    username: string
    user_id: string
  }[]
}
export type GetOrgBlueprintOwnersApiArg = {
  /** Blueprint UUID */
  blueprintId: string
  /** Org spectrum ID */
  spectrumId: string
}
export type FindCraftableBlueprintsApiResponse =
  /** status 200 Ok */ CraftableBlueprintResult[]
export type FindCraftableBlueprintsApiArg = {
  body: {
    owned_only?: boolean
    materials: {
      quality_value?: number
      quantity_scu: number
      game_item_id: string
    }[]
  }
}
export type GetFeatureFlagApiResponse =
  /** status 200 Current feature flag setting */ GetFeatureFlagResponse
export type GetFeatureFlagApiArg = void
export type SetFeatureFlagApiResponse =
  /** status 200 Updated feature flag setting */ SetFeatureFlagResponse
export type SetFeatureFlagApiArg = {
  /** Feature flag setting request */
  setFeatureFlagRequest: SetFeatureFlagRequest
}
export type GetCartApiResponse =
  /** status 200 Cart contents with variant details and availability */ GetCartResponse
export type GetCartApiArg = void
export type AddToCartApiResponse =
  /** status 200 Cart item ID and success message */ AddToCartResponse
export type AddToCartApiArg = {
  /** Add to cart request with listing, variant, and quantity */
  addToCartRequest: AddToCartRequest
}
export type UpdateCartItemApiResponse = /** status 200 Success message */ {
  message: string
}
export type UpdateCartItemApiArg = {
  /** Cart item UUID */
  id: string
  /** Update request with optional quantity and variant_id */
  updateCartItemRequest: UpdateCartItemRequest
}
export type RemoveCartItemApiResponse = /** status 200 Success message */ {
  message: string
}
export type RemoveCartItemApiArg = {
  /** Cart item UUID */
  id: string
}
export type CheckoutCartApiResponse =
  /** status 200 Offer session details (session_id, offer_id, discord_invite) */ CheckoutCartResponse
export type CheckoutCartApiArg = {
  /** Checkout request with optional price change confirmation and note */
  checkoutCartRequest: CheckoutCartRequest
}
export type CreatePurchaseApiResponse =
  /** status 200 Created order with order_id and purchase details */ CreateBuyOrderResponse
export type CreatePurchaseApiArg = {
  /** Purchase request with listing, variant, and quantity */
  createBuyOrderRequest: CreateBuyOrderRequest
}
export type CreateStandingBuyOrderApiResponse =
  /** status 200 Ok */ StandingBuyOrder
export type CreateStandingBuyOrderApiArg = {
  createStandingBuyOrderRequest: CreateStandingBuyOrderRequest
}
export type SearchBuyOrdersApiResponse =
  /** status 200 Ok */ SearchBuyOrdersResponse
export type SearchBuyOrdersApiArg = {
  gameItemId?: string
  qualityTierMin?: number
  qualityTierMax?: number
  qualityValueMin?: number
  qualityValueMax?: number
  /** Sort by: created_at, price_per_unit, quality_tier_min, quality_value_min */
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  pageSize?: number
}
export type GetMyBuyOrdersApiResponse =
  /** status 200 Ok */ SearchBuyOrdersResponse
export type GetMyBuyOrdersApiArg = {
  status?: "active" | "fulfilled" | "cancelled" | "expired"
  page?: number
  pageSize?: number
}
export type UpdateBuyOrderApiResponse = /** status 200 Ok */ StandingBuyOrder
export type UpdateBuyOrderApiArg = {
  id: string
  updateStandingBuyOrderRequest: UpdateStandingBuyOrderRequest
}
export type CancelBuyOrderApiResponse = /** status 200 Ok */ {
  message: string
}
export type CancelBuyOrderApiArg = {
  id: string
}
export type FulfillBuyOrderApiResponse =
  /** status 200 Ok */ CreateBuyOrderResponse
export type FulfillBuyOrderApiArg = {
  id: string
  body: {
    variant_id: string
    listing_id: string
  }
}
export type GetNextAvailableApiResponse =
  /** status 200 Ok */ SellerNextAvailableResponse
export type GetNextAvailableApiArg = {
  /** Username (for user sellers) */
  username?: string
  /** Spectrum ID (for contractor sellers) */
  spectrumId?: string
}
export type GetAuctionDetailApiResponse =
  /** status 200 Ok */ AuctionDetailResponse
export type GetAuctionDetailApiArg = {
  listingId: string
}
export type PlaceBidApiResponse = /** status 200 Ok */ PlaceBidResponse
export type PlaceBidApiArg = {
  listingId: string
  placeBidRequest: PlaceBidRequest
}
export type GetPriceHistoryApiResponse =
  /** status 200 Price history time-series data */ GetPriceHistoryResponse
export type GetPriceHistoryApiArg = {
  /** Game item UUID (required) */
  gameItemId: string
  /** Optional quality tier filter (1-5) */
  qualityTier?: number
  /** Optional start date (ISO 8601 format, defaults to 30 days ago) */
  startDate?: string
  /** Optional end date (ISO 8601 format, defaults to now) */
  endDate?: string
  /** Time interval for aggregation (default: 'day') */
  interval?: "hour" | "day" | "week" | "month"
}
export type GetQualityDistributionApiResponse =
  /** status 200 Quality tier distribution histogram data */ GetQualityDistributionResponse
export type GetQualityDistributionApiArg = {
  /** Game item UUID (required) */
  gameItemId: string
  /** Optional start date (ISO 8601 format) */
  startDate?: string
  /** Optional end date (ISO 8601 format) */
  endDate?: string
}
export type GetSellerStatsApiResponse =
  /** status 200 Seller analytics with sales and inventory breakdown */ GetSellerStatsResponse
export type GetSellerStatsApiArg = {
  /** Optional seller ID (defaults to current user) */
  sellerId?: string
}
export type GetMigrationStatusApiResponse =
  /** status 200 Ok */ MigrationStatusResponse
export type GetMigrationStatusApiArg = void
export type ListMigrationJobsApiResponse = /** status 200 Ok */ {
  jobs: MigrationJob[]
}
export type ListMigrationJobsApiArg = void
export type GetMigrationJobApiResponse = /** status 200 Ok */ {
  job: MigrationJob | null
}
export type GetMigrationJobApiArg = {
  jobId: string
}
export type RunMigrationApiResponse = /** status 200 Ok */ {
  job_id: string
}
export type RunMigrationApiArg = {
  migrationRunRequest: MigrationRunRequest
}
export type GetConfigApiResponse = /** status 200 Ok */ FeatureFlagConfig
export type GetConfigApiArg = void
export type UpdateConfigApiResponse = /** status 200 Ok */ FeatureFlagConfig
export type UpdateConfigApiArg = {
  updateConfigRequest: UpdateConfigRequest
}
export type GetStatsApiResponse = /** status 200 Ok */ FeatureFlagStats[]
export type GetStatsApiArg = void
export type GetUserOverridesApiResponse =
  /** status 200 Ok */ UserOverridesResponse
export type GetUserOverridesApiArg = {
  page?: number
  pageSize?: number
  search?: string
  flagName?: string
}
export type SetUserOverrideApiResponse = /** status 200 Ok */ {
  message: string
}
export type SetUserOverrideApiArg = {
  setUserOverrideRequest: SetUserOverrideRequest
}
export type RemoveUserOverrideApiResponse = /** status 200 Ok */ {
  message: string
}
export type RemoveUserOverrideApiArg = {
  username: string
  flagName?: string
}
export type ImportGameDataApiResponse =
  /** status 200 Ok */
  | {
      job_id: string
    }
  | ImportErrorResponse
export type ImportGameDataApiArg = void
export type ListGameDataImportJobsApiResponse = /** status 200 Ok */ {
  jobs: GameDataImportJob[]
}
export type ListGameDataImportJobsApiArg = void
export type GetImportJobStatusApiResponse = /** status 200 Ok */ {
  job: GameDataImportJob | null
}
export type GetImportJobStatusApiArg = {
  jobId: string
}
export type VariantType = {
  /** Unique identifier for the variant type */
  variant_type_id: string
  /** Internal name (e.g., 'quality_tier', 'quality_value') */
  name: string
  /** Display name for UI (e.g., 'Quality Tier', 'Quality Value') */
  display_name: string
  /** Description of the variant type */
  description?: string
  /** Whether this attribute affects pricing */
  affects_pricing: boolean
  /** Whether this attribute is searchable */
  searchable: boolean
  /** Whether this attribute is filterable */
  filterable: boolean
  /** Data type of the value ('integer', 'decimal', 'string', 'enum') */
  value_type: "integer" | "decimal" | "string" | "enum"
  /** Minimum allowed value (for numeric types) */
  min_value?: number
  /** Maximum allowed value (for numeric types) */
  max_value?: number
  /** Allowed values (for enum types) */
  allowed_values?: string[]
  /** Display order for UI presentation */
  display_order: number
  /** Optional icon identifier */
  icon?: string
  /** Creation timestamp */
  created_at: string
}
export type GetVariantTypesResponse = {
  /** Array of variant type definitions */
  variant_types: VariantType[]
  /** Total count of variant types */
  total: number
}
export type VariantAttributes = {
  /** Quality tier from 1 (lowest) to 5 (highest) */
  quality_tier?: number
  /** Precise quality value from 0 to 1000 */
  quality_value?: number
  /** How the item was obtained */
  crafted_source?: "crafted" | "store" | "looted" | "unknown" | "duped"
  /** Blueprint quality tier for craftable items (1-5) */
  blueprint_tier?: number
}
export type StockLotVariant = {
  /** Variant UUID */
  variant_id: string
  /** Variant attributes */
  attributes: VariantAttributes
  /** Display name (e.g., "Tier 5 (95.5%) - Crafted") */
  display_name: string
  /** Short name (e.g., "T5 Crafted") */
  short_name: string
}
export type LocationInfo = {
  /** Location UUID */
  location_id: string
  /** Location name */
  name: string
  /** Whether this is a preset location (vs custom) */
  is_preset: boolean
}
export type OwnerInfo = {
  /** User UUID */
  user_id: string
  /** Username */
  username: string
  /** Display name */
  display_name?: string
  /** Avatar URL */
  avatar_url?: string
}
export type StockLotDetail = {
  /** Stock lot UUID */
  lot_id: string
  /** Item UUID this lot belongs to */
  item_id: string
  /** Listing UUID this lot belongs to */
  listing_id: string
  /** Listing title */
  listing_title: string
  /** Variant information */
  variant: StockLotVariant
  /** Total quantity in this lot */
  quantity_total: number
  /** Location information (null if unspecified) */
  location: LocationInfo | null
  /** Owner information (null if unassigned) */
  owner: OwnerInfo | null
  /** Whether this lot is listed for sale */
  listed: boolean
  /** Optional notes about this lot */
  notes: string | null
  /** User who crafted this item (if applicable) */
  crafted_by?: string
  /** Timestamp when item was crafted (if applicable) */
  crafted_at?: string
  /** ISO 8601 timestamp when lot was created */
  created_at: string
  /** ISO 8601 timestamp when lot was last updated */
  updated_at: string
}
export type UpdateStockLotResponse = {
  /** Updated stock lot */
  lot: StockLotDetail
}
export type CreateStockLotRequest = {
  /** Listing item UUID */
  item_id: string
  /** Quantity (must be > 0) */
  quantity: number
  /** Variant attributes for this lot */
  variant_attributes: VariantAttributes
  /** Optional location UUID */
  location_id?: string
  /** Whether to list for sale (default: true) */
  listed?: boolean
  /** Optional notes */
  notes?: string
}
export type GetStockLotsResponse = {
  /** Array of stock lots */
  lots: StockLotDetail[]
  /** Total number of lots matching filters */
  total: number
  /** Current page number */
  page: number
  /** Number of results per page */
  page_size: number
}
export type UpdateStockLotRequest = {
  /** New total quantity (optional) */
  quantity_total?: number
  /** New listed status (optional) */
  listed?: boolean
  /** New location UUID (optional, null to clear) */
  location_id?: string | null
  /** New notes (optional, null to clear) */
  notes?: string | null
  /** New variant attributes (optional — changes the lot's variant via getOrCreateVariant) */
  variant_attributes?: VariantAttributes
}
export type BulkUpdateResult = {
  /** Stock lot UUID */
  lot_id: string
  /** Whether the update succeeded */
  success: boolean
  /** Error message if update failed */
  error?: string
}
export type BulkUpdateStockLotsResponse = {
  /** Array of update results */
  results: BulkUpdateResult[]
  /** Number of successful updates */
  success_count: number
  /** Number of failed updates */
  failure_count: number
}
export type BulkLotUpdate = {
  /** Stock lot UUID */
  lot_id: string
  /** New total quantity (optional) */
  quantity_total?: number
  /** New listed status (optional) */
  listed?: boolean
  /** New location UUID (optional) */
  location_id?: string | null
}
export type BulkUpdateStockLotsRequest = {
  /** Array of lot updates */
  updates: BulkLotUpdate[]
}
export type OrderVariantDetail = {
  /** UUID of the variant */
  variant_id: string
  /** Variant attributes (quality_tier, quality_value, crafted_source, etc) */
  attributes: VariantAttributes
  /** Human-readable display name (e.g., "Tier 5 (95.5%) - Crafted") */
  display_name: string
  /** Short name for compact display (e.g., "T5 Crafted") */
  short_name: string
}
export type OrderItemDetail = {
  /** UUID of the order item */
  order_item_id: string
  /** UUID of the listing */
  listing_id: string
  /** UUID of the listing item */
  item_id: string
  /** Listing title */
  listing_title: string
  /** Variant details with quality attributes */
  variant: OrderVariantDetail
  /** Quantity purchased */
  quantity: number
  /** Price per unit at time of purchase (snapshot) */
  price_per_unit: number
  /** Subtotal for this item (quantity * price_per_unit) */
  subtotal: number
}
export type CreateOrderResponse = {
  /** UUID of the created order */
  order_id: string
  /** UUID of the buyer */
  buyer_id: string
  /** UUID of the seller */
  seller_id: string
  /** Total price in aUEC (atomic units) */
  total_price: number
  /** Order status */
  status: string
  /** ISO 8601 timestamp of order creation */
  created_at: string
  /** Array of order items with variant details */
  items: OrderItemDetail[]
  /** Stock allocation result summary */
  allocation_result?: {
    total_allocated: number
    total_requested: number
    has_partial_allocations: boolean
  }
}
export type OrderItemInput = {
  /** UUID of the listing */
  listing_id: string
  /** UUID of the specific variant to purchase */
  variant_id: string
  /** Quantity to purchase (must be > 0) */
  quantity: number
}
export type CreateOrderRequest = {
  /** Array of items to purchase */
  items: OrderItemInput[]
}
export type OrderPreview = {
  /** UUID of the order */
  order_id: string
  /** Order title (from first listing) */
  title: string
  /** Total price in aUEC */
  total_price: number
  /** Order status */
  status: string
  /** ISO 8601 timestamp of order creation */
  created_at: string
  /** ISO 8601 timestamp of last update */
  updated_at: string
  /** Buyer username */
  buyer_username: string
  /** Seller username */
  seller_username: string
  /** Number of items in order */
  item_count: number
  /** Minimum quality tier across all items */
  quality_tier_min?: number
  /** Maximum quality tier across all items */
  quality_tier_max?: number
  /** Buyer avatar URL */
  buyer_avatar?: string | null
  /** Seller avatar URL */
  seller_avatar?: string | null
}
export type GetOrdersResponse = {
  /** Array of order previews */
  orders: OrderPreview[]
  /** Total number of orders matching filters */
  total: number
  /** Current page number */
  page: number
  /** Number of results per page */
  page_size: number
}
export type OrderMarketListingV1 = {
  listing_id: string
  quantity: number
  title: string
  price: number
}
export type OrderVariantItem = {
  order_item_id: string
  variant_id: string
  quantity: number
  price_per_unit: number
  attributes: VariantAttributes
  display_name: string
  short_name: string
}
export type OrderMarketListingV2 = {
  listing_id: string
  quantity: number
  title: string
  price: number
  /** First photo URL */
  photo?: string
  /** V2 variant items for this listing */
  v2_variants: OrderVariantItem[]
}
export type GetOrderDetailResponse = {
  /** UUID of the order */
  order_id: string
  /** Buyer information */
  buyer: {
    avatar: string | null
    display_name: string
    username: string
    user_id: string
  }
  /** Seller information */
  seller: {
    avatar: string | null
    display_name: string
    username: string
    user_id: string
  }
  /** Total price in aUEC (atomic units) */
  total_price: number
  /** Order status */
  status: string
  /** Order kind (Delivery, Escort, etc.) */
  kind: string
  /** Order title */
  title: string
  /** Order description */
  description: string
  /** Payment type */
  payment_type: string
  /** Offer session ID (if created from offer) */
  offer_session_id?: string | null
  /** ISO 8601 timestamp of order creation */
  created_at: string
  /** ISO 8601 timestamp of last update */
  updated_at: string
  /** V1 market listings from market_orders */
  market_listings: OrderMarketListingV1[]
  /** V2 market listings with variant data from order_market_items_v2 */
  market_listings_v2: OrderMarketListingV2[]
  /** V2-only order items (from order_market_items_v2) */
  items: OrderItemDetail[]
}
export type ListingOrderSummary = {
  order_id: string
  status: string
  created_at: string
  buyer_name: string
  quantity: number
  price_per_unit: number
}
export type ListingOfferSummary = {
  session_id: string
  status: string
  created_at: string
  buyer_name: string
  quantity: number
  price_per_unit: number
}
export type OrdersByListingResponse = {
  orders: ListingOrderSummary[]
  offers: ListingOfferSummary[]
}
export type Rating = {
  avg_rating: number
  rating_count: number
  streak: number
  total_rating: number
  total_orders?: number
  response_rate?: number
  total_assignments?: number
}
export type BadgeMetadata = {
  avg_rating: number
  rating_count: number
  rating_streak: number
  total_orders: number
  fulfilled_orders: number
  total_assignments: number
  response_rate: number
  total_rating: number
  orders_last_30_days: number
  orders_last_90_days: number
  avg_completion_time_hours: number | null
  account_age_months: number
  account_created_at: string | null
  donor_duration_months: number | null
  calculated_at: string
}
export type BadgeData = {
  badge_ids: string[]
  metadata?: BadgeMetadata
}
export type MinimalUser = {
  username: string
  avatar: string
  display_name: string
  rating: Rating
  badges?: BadgeData | null
  last_seen?: string
  in_game?: boolean
}
export type MinimalContractor = {
  spectrum_id: string
  name: string
  avatar: string
  rating: Rating
  badges?: BadgeData | null
  last_seen?: string
  members_online?: number
}
export type OfferMarketListingV1 = {
  listing_id: string
  quantity: number
  title: string
  price: number
}
export type OfferVariantItem = {
  variant_id: string
  quantity: number
  price_per_unit: number
  attributes: VariantAttributes
  display_name: string
  short_name: string
}
export type OfferMarketListingV2 = {
  listing_id: string
  quantity: number
  title: string
  price: number
  /** First photo URL */
  photo?: string
  /** V2 variant items for this listing */
  v2_variants: OfferVariantItem[]
}
export type OfferV2 = {
  offer_id: string
  kind: string
  cost: number
  title: string
  description: string
  payment_type: string
  status: string
  created_at: string
  collateral?: number
  /** Username of the user who created this offer */
  actor_username: string
  /** V1 market listings from offer_market_items (empty when V2 data exists) */
  market_listings: OfferMarketListingV1[]
  /** V2 market listings with variant data from offer_market_items_v2 */
  market_listings_v2: OfferMarketListingV2[]
  service?: {
    title: string
    service_id: string
  } | null
}
export type DbAvailabilityEntry = {
  contractor_id: string | null
  user_id: string
  start: number
  finish: number
}
export type OfferAvailability = {
  customer: DbAvailabilityEntry[] | null
  assigned: DbAvailabilityEntry[] | null
}
export type GetOfferSessionV2Response = {
  session_id: string
  status: string
  created_at: string
  order_id?: string
  contract_id?: string | null
  discord_thread_id?: string | null
  discord_server_id?: string | null
  discord_invite?: string | null
  customer: MinimalUser
  assigned_to: MinimalUser | null
  contractor: MinimalContractor | null
  offers: OfferV2[]
  availability?: OfferAvailability | null
}
export type OfferSessionV2 = {
  session_id: string
  status: string
  created_at: string
  order_id?: string
  contract_id?: string | null
  discord_thread_id?: string | null
  discord_server_id?: string | null
  discord_invite?: string | null
  customer: MinimalUser
  assigned_to: MinimalUser | null
  contractor: MinimalContractor | null
  offers: OfferV2[]
  availability?: OfferAvailability | null
}
export type SearchOffersV2Response = {
  offers: OfferSessionV2[]
  total: number
  page: number
  page_size: number
}
export type CreateListingResponse = {
  listing_id: string
  seller_id: string
  seller_type: "user" | "contractor"
  title: string
  description: string
  status: "active" | "sold" | "expired" | "cancelled"
  created_at: string
  updated_at: string
}
export type StockLotInput = {
  /** Quantity of items in this lot (must be > 0) */
  quantity: number
  /** Variant attributes for this lot */
  variant_attributes: VariantAttributes
  /** Optional location ID where items are stored */
  location_id?: string
  /** Price for this variant (required if pricing_mode is 'per_variant') */
  price?: number
}
export type BulkDiscountTier = {
  /** Minimum quantity to qualify for this discount */
  min_quantity: number
  /** Discount percentage (0-100) */
  discount_percent: number
}
export type CreateListingRequest = {
  /** Listing title (max 500 chars) */
  title: string
  /** Listing description (markdown supported) */
  description: string
  /** Game item UUID being sold */
  game_item_id: string
  /** Pricing strategy: unified price for all variants or per-variant pricing */
  pricing_mode: "unified" | "per_variant"
  /** Base price for all variants (required if pricing_mode is 'unified') */
  base_price?: number
  /** Array of stock lots with variant attributes */
  lots: StockLotInput[]
  /** Optional array of image resource UUIDs to attach as photos */
  photo_resource_ids?: string[]
  /** Pickup method: how the buyer receives the item */
  pickup_method?: "delivery" | "pickup" | "any"
  /** Quantity unit: 'unit' for discrete items, 'scu' for cargo measured in cSCU */
  quantity_unit?: "unit" | "scu"
  /** Minimum quantity per order for this listing */
  min_order_quantity?: number
  /** Maximum quantity per order for this listing */
  max_order_quantity?: number
  /** Minimum order value (aUEC) for this listing */
  min_order_value?: number
  /** Maximum order value (aUEC) for this listing */
  max_order_value?: number
  /** Optional bulk discount tiers sorted by min_quantity ascending */
  bulk_discount_tiers?: BulkDiscountTier[]
  /** Optional contractor spectrum_id — if provided, listing is created on behalf of the org */
  contractor_spectrum_id?: string
  /** Sale type: fixed price, auction, or negotiable */
  sale_type?: "fixed" | "auction" | "negotiable"
  /** Auction details — required when sale_type is 'auction' */
  auction_details?: {
    /** Optional reserve price — auction won't sell below this */
    reserve_price?: number
    /** Optional buyout price in aUEC */
    buyout_price?: number
    /** Minimum bid increment in aUEC */
    min_bid_increment: number
    /** When the auction ends (ISO 8601) */
    end_time: string
  }
}
export type ListingSearchResult = {
  /** Listing UUID */
  listing_id: string
  /** Listing title */
  title: string
  /** Seller username or contractor name */
  seller_name: string
  /** Seller rating (0-5) */
  seller_rating: number
  /** Minimum price across all variants */
  price_min: number
  /** Maximum price across all variants */
  price_max: number
  /** Total quantity available across all variants */
  quantity_available: number
  /** Minimum quality tier available (1-5) */
  quality_tier_min?: number
  /** Maximum quality tier available (1-5) */
  quality_tier_max?: number
  /** Minimum quality value available (0-1000) */
  quality_value_min?: number
  /** Maximum quality value available (0-1000) */
  quality_value_max?: number
  /** Number of unique variants in this listing */
  variant_count: number
  /** Seller type (user or contractor) */
  seller_type: "user" | "contractor"
  /** Username (for user sellers) or spectrum_id (for contractor sellers) - use for profile links */
  seller_slug: string
  /** ISO 8601 timestamp when listing was created */
  created_at: string
  /** ISO 8601 timestamp when listing was last updated */
  updated_at: string
  /** Game item name */
  game_item_name: string
  /** Game item type/category */
  game_item_type: string
  /** Seller rating count */
  seller_rating_count: number
  /** Seller's supported languages (ISO 639-1 codes) */
  seller_languages?: string[]
  /** First photo URL (null if no photos) */
  photo?: string
  /** Pickup method: delivery, pickup, any, or null (not specified) */
  pickup_method?: ("delivery" | "pickup" | "any" | null) | null
  /** Quantity unit: 'unit' or 'scu' */
  quantity_unit: "unit" | "scu"
  /** Whether this listing has bulk discount tiers defined */
  has_bulk_discount?: boolean
}
export type SearchListingsResponse = {
  /** Array of listing results */
  listings: ListingSearchResult[]
  /** Total number of listings matching filters */
  total: number
  /** Current page number */
  page: number
  /** Number of results per page */
  page_size: number
}
export type MyListingItem = {
  /** Listing UUID */
  listing_id: string
  /** Listing title */
  title: string
  /** Current status */
  status: string
  /** ISO 8601 timestamp when listing was created */
  created_at: string
  /** ISO 8601 timestamp when listing was last updated */
  updated_at: string
  /** Number of unique variants */
  variant_count: number
  /** Total quantity available across all variants */
  quantity_available: number
  /** Minimum price across all variants */
  price_min: number
  /** Maximum price across all variants */
  price_max: number
  /** Minimum quality tier available (1-5) */
  quality_tier_min?: number
  /** Maximum quality tier available (1-5) */
  quality_tier_max?: number
  /** Primary photo URL */
  photo?: string
  /** ISO 8601 timestamp when listing expires (null if no expiry) */
  expires_at?: string
}
export type GetMyListingsResponse = {
  /** Array of user's listings */
  listings: MyListingItem[]
  /** Total number of listings matching filters */
  total: number
  /** Current page number */
  page: number
  /** Number of results per page */
  page_size: number
}
export type InventoryMaterial = {
  game_item_id: string
  game_item_name: string
  game_item_type?: string
  game_item_icon?: string
  total_quantity: number
  avg_quality_value?: number
  max_quality_value?: number
}
export type InventorySummaryResponse = {
  materials: InventoryMaterial[]
}
export type ListingDetail = {
  /** Listing UUID */
  listing_id: string
  /** Seller UUID */
  seller_id: string
  /** Type of seller */
  seller_type: "user" | "contractor"
  /** Listing title */
  title: string
  /** Listing description (markdown) */
  description: string
  /** Current listing status */
  status: "active" | "sold" | "expired" | "cancelled"
  /** Visibility setting */
  visibility: "public" | "private" | "unlisted"
  /** Sale type */
  sale_type: "fixed" | "auction" | "negotiable"
  /** Listing type */
  listing_type: "single" | "bundle" | "bulk"
  /** ISO 8601 timestamp when listing was created */
  created_at: string
  /** ISO 8601 timestamp when listing was last updated */
  updated_at: string
  /** Optional ISO 8601 timestamp when listing expires */
  expires_at?: string
  /** Array of photo URLs */
  photos?: string[]
  /** Pickup method: delivery, pickup, any, or null (not specified) */
  pickup_method?: ("delivery" | "pickup" | "any" | null) | null
  /** Quantity unit: 'unit' or 'scu' */
  quantity_unit: "unit" | "scu"
  /** Per-listing order limits (null = no limit) */
  min_order_quantity?: number | null
  max_order_quantity?: number | null
  min_order_value?: number | null
  max_order_value?: number | null
  /** Number of views this listing has received */
  view_count?: number
}
export type SellerInfo = {
  /** Seller username or contractor name */
  name: string
  /** Seller type */
  type: "user" | "contractor"
  /** Username (for users) or spectrum_id (for contractors) - use for profile links */
  slug: string
  /** Seller rating (0-5) */
  rating: number
  /** Optional seller avatar URL */
  avatar_url?: string
  /** Seller's supported languages (ISO 639-1 codes) */
  languages?: string[]
}
export type GameItemInfo = {
  /** Game item UUID */
  id: string
  /** Item name */
  name: string
  /** Item type/category */
  type: string
  /** Optional item image URL */
  image_url?: string
}
export type VariantDetail = {
  /** Variant UUID */
  variant_id: string
  /** Variant attributes (quality tier, crafted source, etc) */
  attributes: VariantAttributes
  /** Human-readable display name (e.g., "Tier 5 (95.5%) - Crafted") */
  display_name: string
  /** Short name for compact display (e.g., "T5 Crafted") */
  short_name: string
  /** Total quantity available for this variant */
  quantity: number
  /** Price for this variant */
  price: number
  /** Location names where this variant is stored */
  locations: string[]
}
export type ListingItemDetail = {
  /** Item UUID */
  item_id: string
  /** Game item information */
  game_item: GameItemInfo
  /** Pricing strategy for this item */
  pricing_mode: "unified" | "per_variant"
  /** Base price (used when pricing_mode is 'unified') */
  base_price?: number
  /** Array of variants with quantities and prices */
  variants: VariantDetail[]
  /** Bulk discount tiers (null if none defined) */
  bulk_discount_tiers?: BulkDiscountTier[] | null
}
export type GetListingDetailResponse = {
  /** Core listing metadata */
  listing: ListingDetail
  /** Seller information */
  seller: SellerInfo
  /** Array of items being sold with variant breakdown */
  items: ListingItemDetail[]
}
export type VariantPriceUpdate = {
  /** Variant UUID */
  variant_id: string
  /** New price for this variant */
  price: number
}
export type LotUpdate = {
  /** Stock lot UUID */
  lot_id: string
  /** New total quantity (optional) */
  quantity_total?: number
  /** New listed status (optional) */
  listed?: boolean
  /** New location ID (optional) */
  location_id?: string
}
export type UpdateListingRequest = {
  /** New title (optional) */
  title?: string
  /** New status (optional) — active, sold, expired, cancelled */
  status?: "active" | "sold" | "expired" | "cancelled"
  /** New description (optional) */
  description?: string
  /** New base price for unified pricing mode (optional) */
  base_price?: number
  /** Array of variant price updates for per_variant pricing mode (optional) */
  variant_prices?: VariantPriceUpdate[]
  /** Array of stock lot updates (optional) */
  lot_updates?: LotUpdate[]
  /** Pickup method: how the buyer receives the item */
  pickup_method?: ("delivery" | "pickup" | "any" | null) | null
  /** Quantity unit */
  quantity_unit?: "unit" | "scu"
  /** Per-listing order limits (null to remove) */
  min_order_quantity?: number | null
  max_order_quantity?: number | null
  min_order_value?: number | null
  max_order_value?: number | null
  /** Updated bulk discount tiers (pass [] to remove, omit to keep unchanged) */
  bulk_discount_tiers?: BulkDiscountTier[]
}
export type InventoryLotDetail = {
  lot_id: string
  owner_id: string
  game_item_id: string | null
  game_item_name: string | null
  variant_id: string | null
  variant_display_name: string | null
  listing_id: string | null
  listing_title: string | null
  quantity_total: number
  location_id: string | null
  location_name: string | null
  listed: boolean
  notes: string | null
  created_at: string
  updated_at: string
}
export type InventoryResponse = {
  lots: InventoryLotDetail[]
  total: number
  page: number
  page_size: number
}
export type CreateInventoryLotRequest = {
  game_item_id?: string | null
  variant_id?: string | null
  quantity: number
  location_id?: string | null
  notes?: string | null
}
export type LinkToListingRequest = {
  listing_id: string
}
export type ImportSource = "cstone-items" | "uex-items" | "uex-attributes"
export type JobStatus = "running" | "completed" | "failed"
export type RecordStringAny = {
  [key: string]: any
}
export type ImportJob = {
  id: string
  source: ImportSource
  status: JobStatus
  startedAt: string
  completedAt: string | null
  result: RecordStringAny | null
  error: string | null
}
export type HealthResponse = {
  status: string
  version: string
  timestamp: string
}
export type GameItemSearchResult = {
  id: string
  name: string
  type: string
}
export type GameItemCategory = {
  category: string
  game_item_categories: string
  subcategory?: string
}
export type GameItemMetadata = {
  /** Game item UUID */
  id: string
  /** Game item name */
  name: string
  /** Game item type */
  type: string
  /** Game item image URL */
  image_url?: string
}
export type GameItemQualityDistribution = {
  /** Quality tier (1-5) */
  quality_tier: number
  /** Total quantity available for this tier across all listings */
  quantity_available: number
  /** Minimum price for this tier */
  price_min: number
  /** Maximum price for this tier */
  price_max: number
  /** Average price for this tier */
  price_avg: number
  /** Number of unique sellers offering this tier */
  seller_count: number
  /** Number of listings offering this tier */
  listing_count: number
}
export type GameItemListingResult = {
  /** Listing UUID */
  listing_id: string
  /** Listing title */
  title: string
  /** Seller ID */
  seller_id: string
  /** Seller name */
  seller_name: string
  /** Seller rating (0-5) */
  seller_rating: number
  /** Seller type */
  seller_type: "user" | "contractor"
  /** Username (for user sellers) or spectrum_id (for contractor sellers) */
  seller_slug: string
  /** Minimum price across all variants in this listing */
  price_min: number
  /** Maximum price across all variants in this listing */
  price_max: number
  /** Total quantity available in this listing */
  quantity_available: number
  /** Minimum quality tier in this listing */
  quality_tier_min?: number
  /** Maximum quality tier in this listing */
  quality_tier_max?: number
  /** Number of variants in this listing */
  variant_count: number
  /** Listing created timestamp */
  created_at: string
}
export type GetGameItemListingsResponse = {
  /** Game item metadata */
  game_item: GameItemMetadata
  /** Quality distribution across all listings */
  quality_distribution: GameItemQualityDistribution[]
  /** Individual listings for this game item */
  listings: GameItemListingResult[]
  /** Total number of listings (for pagination) */
  total: number
  /** Current page number */
  page: number
  /** Page size */
  page_size: number
}
export type GameItemAggregate = {
  /** Game item UUID */
  game_item_id: string
  /** Game item name */
  name: string
  /** Game item type/category */
  type: string
  /** Game item image URL */
  image_url?: string
  /** Minimum price across all listings for this item */
  min_price: number
  /** Maximum price across all listings for this item */
  max_price: number
  /** Total quantity available across all sellers */
  total_quantity: number
  /** Number of active listings */
  listing_count: number
  /** Number of unique sellers */
  seller_count: number
  /** Minimum quality tier available */
  quality_tier_min?: number
  /** Maximum quality tier available */
  quality_tier_max?: number
}
export type SearchGameItemAggregatesResponse = {
  /** Array of game item aggregates */
  items: GameItemAggregate[]
  /** Total number of game items with active listings */
  total: number
  /** Current page */
  page: number
  /** Page size */
  page_size: number
}
export type Wishlist = {
  wishlist_id: string
  user_id: string
  wishlist_name: string
  wishlist_description?: string
  is_public: boolean
  share_token?: string
  organization_id?: string
  is_collaborative: boolean
  created_at: string
  updated_at: string
}
export type ListWishlistsResponse = {
  wishlists: (Wishlist & {
    progress_percentage: number
    completed_items: number
    item_count: number
  })[]
}
export type CreateWishlistRequest = {
  /** Wishlist name */
  wishlist_name: string
  /** Optional description */
  wishlist_description?: string
  /** Is wishlist public */
  is_public: boolean
  /** Optional organization ID for org wishlists */
  organization_id?: string
  /** Is collaborative (multiple users can edit) */
  is_collaborative: boolean
}
export type AcquisitionMode = "buy" | "craft"
export type WishlistItemWithDetails = {
  item_id: string
  wishlist_id: string
  game_item_id: string
  desired_quantity: number
  desired_quality_tier?: number
  blueprint_id?: string
  acquisition_mode: AcquisitionMode
  priority: number
  notes?: string
  is_acquired: boolean
  acquired_quantity: number
  created_at: string
  updated_at: string
  game_item_name: string
  game_item_icon?: string
  game_item_type: string
  blueprint_name?: string
  estimated_cost?: number
  crafting_available: boolean
}
export type GetWishlistResponse = {
  wishlist: Wishlist
  items: WishlistItemWithDetails[]
  statistics: {
    total_estimated_cost: number
    progress_percentage: number
    completed_items: number
    total_items: number
  }
}
export type UpdateWishlistRequest = {
  /** Updated wishlist name */
  wishlist_name?: string
  /** Updated description */
  wishlist_description?: string
  /** Updated public status */
  is_public?: boolean
  /** Updated collaborative status */
  is_collaborative?: boolean
}
export type AddWishlistItemRequest = {
  /** Game item ID */
  game_item_id: string
  /** Desired quantity */
  desired_quantity: number
  /** Desired quality tier (1-5) */
  desired_quality_tier?: number
  /** Optional blueprint ID if item is craftable */
  blueprint_id?: string
  /** How to acquire: "buy" from market or "craft" from ingredients (default: "buy") */
  acquisition_mode?: AcquisitionMode
  /** Priority level (1-5, higher is more important) */
  priority: number
  /** Optional notes */
  notes?: string
}
export type UpdateWishlistItemRequest = {
  /** Updated desired quantity */
  desired_quantity?: number
  /** Updated desired quality tier */
  desired_quality_tier?: number
  /** Updated priority */
  priority?: number
  /** Updated notes */
  notes?: string
  /** Updated acquisition mode */
  acquisition_mode?: AcquisitionMode
  /** Updated acquired status */
  is_acquired?: boolean
  /** Updated acquired quantity */
  acquired_quantity?: number
}
export type ShoppingListMaterial = {
  /** Game item ID */
  game_item_id: string
  /** Game item name */
  game_item_name: string
  /** Game item icon */
  game_item_icon?: string
  /** Total quantity needed across all wishlist items */
  total_quantity_needed: number
  /** Desired quality tier */
  desired_quality_tier?: number
  /** User inventory quantity */
  user_inventory_quantity: number
  /** Quantity still needed */
  quantity_to_acquire: number
  /** Estimated unit price */
  estimated_unit_price?: number
  /** Estimated total cost */
  estimated_total_cost?: number
  /** Acquisition methods (mining, purchase, salvage, etc.) */
  acquisition_methods: string[]
  /** Which wishlist items use this material */
  used_by_items: {
    quantity_for_this_item: number
    item_name: string
    wishlist_item_id: string
  }[]
}
export type ShoppingListResponse = {
  wishlist_id: string
  wishlist_name: string
  materials_needed: ShoppingListMaterial[]
  total_estimated_cost: number
  materials_fully_stocked: number
  materials_partially_stocked: number
  materials_not_stocked: number
}
export type WikiItemSearchResult = {
  id: string
  name: string
  type?: string
  sub_type?: string
  size?: string
  grade?: string
  manufacturer?: string
  image_url?: string
  thumbnail_path?: string
  display_type?: string
}
export type SearchWikiItemsResponse = {
  items: WikiItemSearchResult[]
  total: number
  page: number
  page_size: number
}
export type BlueprintReference = {
  blueprint_id: string
  blueprint_name: string
  rarity?: string
  tier?: number
  crafting_time_seconds?: number
}
export type MissionRewardReference = {
  mission_id: string
  mission_name: string
  star_system?: string
  drop_probability: number
  blueprint_id: string
  blueprint_name: string
}
export type MarketStats = {
  listing_count: number
  min_price?: number
  max_price?: number
  total_quantity: number
}
export type WikiItemDetail = {
  id: string
  name: string
  type?: string
  sub_type?: string
  size?: string
  grade?: string
  manufacturer?: string
  image_url?: string
  thumbnail_path?: string
  display_type?: string
  p4k_id?: string
  p4k_file?: string
  name_key?: string
  attributes: RecordStringAny
  craftable_from: BlueprintReference[]
  rewarded_by: MissionRewardReference[]
  market_stats: MarketStats
}
export type WikiShipSearchResult = {
  id: string
  name: string
  manufacturer?: string
  focus?: string
  size?: string
  image_url?: string
}
export type WikiShipDetail = {
  id: string
  name: string
  manufacturer?: string
  focus?: string
  size?: string
  description?: string
  movement_class?: string
  image_url?: string
  default_loadout?: any
  attributes: RecordStringAny
}
export type WikiCommoditySearchResult = {
  resource_id: string
  game_item_id: string
  name: string
  resource_category: string
  resource_subcategory?: string
  can_be_mined: boolean
  can_be_purchased: boolean
  can_be_salvaged: boolean
  can_be_looted: boolean
  image_url?: string
}
export type WikiLocationNode = {
  id: string
  name: string
  type: string
  parent_id?: string
  children: WikiLocationNode[]
}
export type WikiManufacturerSearchResult = {
  manufacturer: string
  item_count: number
}
export type ManufacturerItem = {
  id: string
  name: string
  type?: string
  size?: string
  grade?: string
  image_url?: string
}
export type WikiManufacturerDetail = {
  manufacturer: string
  description?: string
  item_count: number
  items: ManufacturerItem[]
}
export type GameVersion = {
  /** Version UUID */
  version_id: string
  /** Version type (LIVE, PTU, EPTU) */
  version_type: "LIVE" | "PTU" | "EPTU"
  /** Version number (e.g., "4.7.0") */
  version_number: string
  /** Build number (e.g., "11592622") */
  build_number?: string
  /** Release date */
  release_date?: string
  /** Is this version currently active */
  is_active: boolean
  /** Last data update timestamp */
  last_data_update?: string
  /** Created timestamp */
  created_at: string
  /** Updated timestamp */
  updated_at: string
}
export type ActiveVersionsResponse = {
  /** Active LIVE version */
  LIVE?: GameVersion
  /** Active PTU version */
  PTU?: GameVersion
  /** Active EPTU version */
  EPTU?: GameVersion
}
export type SelectVersionResponse = {
  /** Success status */
  success: boolean
  /** Selected version */
  version?: GameVersion
}
export type SelectVersionRequest = {
  /** Version ID to select */
  version_id: string
}
export type ResourceSearchResult = {
  /** Resource UUID */
  resource_id: string
  /** Game item ID */
  game_item_id: string
  /** Resource name */
  resource_name: string
  /** Resource icon URL */
  resource_icon?: string
  /** Resource category */
  resource_category: string
  /** Resource subcategory */
  resource_subcategory?: string
  /** Maximum stack size */
  max_stack_size?: number
  /** Base value in UEC */
  base_value?: number
  /** Can be mined */
  can_be_mined: boolean
  /** Can be purchased */
  can_be_purchased: boolean
  /** Can be salvaged */
  can_be_salvaged: boolean
  /** Can be looted */
  can_be_looted: boolean
  /** Number of blueprints that require this resource */
  blueprint_count: number
}
export type SearchResourcesResponse = {
  /** Resource search results */
  resources: ResourceSearchResult[]
  /** Total number of resources matching filters */
  total: number
  /** Current page number */
  page: number
  /** Page size */
  page_size: number
}
export type MiningLocation = {
  /** Star system */
  star_system?: string
  /** Planet or moon */
  planet_moon?: string
  /** Location detail */
  location_detail?: string
  /** Abundance level */
  abundance?: string
}
export type PurchaseLocation = {
  /** Star system */
  star_system?: string
  /** Planet or moon */
  planet_moon?: string
  /** Station or outpost */
  station?: string
  /** Average price */
  average_price?: number
}
export type Resource = {
  resource_id: string
  version_id: string
  game_item_id: string
  resource_name: string
  resource_icon?: string
  resource_category: string
  resource_subcategory?: string
  max_stack_size?: number
  base_value?: number
  can_be_mined: boolean
  can_be_purchased: boolean
  can_be_salvaged: boolean
  can_be_looted: boolean
  mining_locations?: MiningLocation[]
  purchase_locations?: PurchaseLocation[]
  created_at: string
  updated_at: string
}
export type BlueprintRequiringResource = {
  /** Blueprint UUID */
  blueprint_id: string
  /** Blueprint name */
  blueprint_name: string
  /** Output item name */
  output_item_name: string
  /** Output item icon */
  output_item_icon?: string
  /** Quantity required */
  quantity_required: number
  /** Minimum quality tier */
  min_quality_tier?: number
  /** Recommended quality tier */
  recommended_quality_tier?: number
}
export type ResourceDetailResponse = {
  /** Complete resource data */
  resource: Resource
  /** Blueprints that require this resource */
  blueprints_requiring: BlueprintRequiringResource[]
  /** Market price data (if available) */
  market_price?: {
    last_updated?: string
    average_price?: number
    max_price?: number
    min_price?: number
  }
}
export type ResourceCategory = {
  /** Category name */
  category: string
  /** Subcategory name */
  subcategory?: string
  /** Number of resources in this category */
  count: number
}
export type HaulingOrder = {
  resource_name: string
  min_scu: number
  max_scu: number
}
export type MissionSearchResult = {
  /** Mission UUID */
  mission_id: string
  /** Mission code (internal name for URL-friendly links) */
  mission_code: string
  /** Mission name */
  mission_name: string
  /** Mission category */
  category: string
  /** Career type */
  career_type?: string
  /** Legal status */
  legal_status?: string
  /** Difficulty level (1-5) */
  difficulty_level?: number
  /** Star system */
  star_system?: string
  /** Planet or moon */
  planet_moon?: string
  /** Faction */
  faction?: string
  /** Minimum credit reward */
  credit_reward_min?: number
  /** Maximum credit reward */
  credit_reward_max?: number
  /** Number of blueprint rewards */
  blueprint_reward_count: number
  /** Names of blueprint reward output items */
  blueprint_reward_names?: string[]
  /** Average community difficulty rating */
  community_difficulty_avg?: number
  /** Average community satisfaction rating */
  community_satisfaction_avg?: number
  /** Is chain starter mission */
  is_chain_starter: boolean
  /** Is part of a chain */
  is_chain_mission: boolean
  /** Is shareable mission */
  is_shareable: boolean
  /** Is unique (one-time) mission */
  is_unique_mission: boolean
  /** Is illegal */
  is_illegal?: boolean
  /** Reputation XP reward */
  reputation_reward?: number
  /** Reputation scope (e.g., headhunter, salvage) */
  reward_scope?: string
  /** Mission giver organization */
  mission_giver_org?: string
  /** Associated event name (e.g., "Nyx Mission Pack") */
  associated_event?: string
  /** Total ship encounter count */
  ship_encounter_count: number
  /** Hauling order summaries for material badges */
  hauling_orders?: HaulingOrder[]
}
export type SearchMissionsResponse = {
  /** Mission search results */
  missions: MissionSearchResult[]
  /** Total number of missions matching filters */
  total: number
  /** Current page number */
  page: number
  /** Page size */
  page_size: number
}
export type ItemReward = {
  name: string
  ref: string
}
export type RecordStringString = {
  [key: string]: string
}
export type Mission = {
  mission_id: string
  version_id: string
  mission_code: string
  mission_name: string
  mission_description?: string
  category: string
  mission_type?: string
  career_type?: string
  legal_status?: "LEGAL" | "ILLEGAL" | "UNKNOWN"
  difficulty_level?: number
  star_system?: string
  planet_moon?: string
  location_detail?: string
  mission_giver_org?: string
  faction?: string
  credit_reward_min?: number
  credit_reward_max?: number
  reputation_reward?: number
  is_shareable: boolean
  availability_type?: string
  associated_event?: string
  required_rank?: number
  required_reputation?: number
  is_chain_starter: boolean
  is_chain_mission: boolean
  is_unique_mission: boolean
  prerequisite_missions?: any
  estimated_uec_per_hour?: number
  estimated_rep_per_hour?: number
  rank_index?: number
  reward_scope?: string
  /** Faction name for reputation reward */
  reputation_reward_faction?: string
  min_standing?: string
  /** Standing requirement — max (e.g. "Elite Contractor") */
  max_standing?: string
  /** Friendly display name for min standing */
  min_standing_display?: string
  /** Friendly display name for max standing */
  max_standing_display?: string
  /** Can re-accept after failing */
  can_reaccept_after_failing?: boolean
  /** Can re-accept after abandoning */
  can_reaccept_after_abandoning?: boolean
  /** Cooldown after abandoning (seconds) */
  abandoned_cooldown_time?: number
  /** Personal cooldown between accepts (seconds) */
  personal_cooldown_time?: number
  /** Mission deadline (seconds) */
  deadline_seconds?: number
  /** Available in prison */
  available_in_prison?: boolean
  /** Is illegal */
  is_illegal?: boolean
  /** Is lawful */
  is_lawful?: boolean
  /** Max crimestat allowed */
  max_crimestat?: number
  /** Difficulty from broker (raw) */
  difficulty_from_broker?: number
  /** Time to complete the mission (seconds) */
  time_to_complete?: number
  /** Accept locations (where the mission can be picked up) */
  accept_locations?: string[]
  /** Destinations (pickup/dropoff location names) */
  destinations?: string[]
  /** Non-blueprint item rewards */
  item_rewards?: ItemReward[]
  /** Token substitutions for description placeholders */
  token_substitutions?: RecordStringString
  community_difficulty_avg?: number
  community_difficulty_count: number
  community_satisfaction_avg?: number
  community_satisfaction_count: number
  data_source: string
  is_verified: boolean
  created_at: string
  updated_at: string
}
export type MissionBlueprintReward = {
  /** Blueprint UUID */
  blueprint_id: string
  /** Blueprint code for URL-friendly links */
  blueprint_code: string
  /** Blueprint name */
  blueprint_name: string
  /** Output item name */
  output_item_name: string
  /** Output item icon URL */
  output_item_icon?: string
  /** Drop probability percentage (0-100) */
  drop_probability: number
  /** Is guaranteed reward */
  is_guaranteed: boolean
  /** Blueprint rarity */
  rarity?: string
  /** Blueprint tier (1-5) */
  tier?: number
  /** Does user own this blueprint */
  user_owns?: boolean
}
export type MissionRewardPool = {
  /** Reward pool ID */
  reward_pool_id: number
  /** Pool name from game data (e.g. "BP_MISSIONREWARD_CFP_Outpost_RegionC") */
  pool_name?: string
  /** Pool-level chance (0-1, e.g. 1.0 = 100%) */
  pool_chance?: number
  /** Total number of blueprints in pool */
  reward_pool_size: number
  /** Number of blueprints selected from pool */
  selection_count: number
  /** Blueprints in this reward pool */
  blueprints: MissionBlueprintReward[]
}
export type ShipWave = {
  name: string
  min_ships: number
  max_ships: number
}
export type ShipEncounter = {
  role: string
  alignment: "hostile" | "friendly" | "neutral"
  waves: ShipWave[]
  ship_pool?: string[]
}
export type NpcEncounter = {
  name: string
  count: number
}
export type EntitySpawn = {
  name: string
  count: number
}
export type UserMissionRating = {
  /** Difficulty rating (1-5) */
  difficulty_rating: number
  /** Satisfaction rating (1-5) */
  satisfaction_rating: number
  /** Optional comment */
  rating_comment?: string
}
export type MissionDetailResponse = {
  /** Complete mission data */
  mission: Mission
  /** Blueprint reward pools */
  blueprint_rewards: MissionRewardPool[]
  /** Prerequisite missions (if any) */
  prerequisite_missions?: Mission[]
  /** Ship encounters (Combat tab) */
  ship_encounters?: ShipEncounter[]
  /** NPC encounters (Combat tab) */
  npc_encounters?: NpcEncounter[]
  /** Hauling orders */
  hauling_orders?: HaulingOrder[]
  /** Entity spawns */
  entity_spawns?: EntitySpawn[]
  /** Has user completed this mission */
  user_completed?: boolean
  /** User's rating for this mission */
  user_rating?: UserMissionRating
}
export type BlueprintDetail = {
  /** Blueprint UUID */
  blueprint_id: string
  /** Blueprint code */
  blueprint_code: string
  /** Blueprint name */
  blueprint_name: string
  /** Blueprint description */
  blueprint_description?: string
  /** Output game item ID */
  output_game_item_id: string
  /** Output item name */
  output_item_name: string
  /** Output item type */
  output_item_type: string
  /** Output item icon URL */
  output_item_icon?: string
  /** Output quantity */
  output_quantity: number
  /** Item category */
  item_category?: string
  /** Item subcategory */
  item_subcategory?: string
  /** Rarity */
  rarity?: string
  /** Tier (1-5) */
  tier?: number
  /** Crafting station type */
  crafting_station_type?: string
  /** Crafting time in seconds */
  crafting_time_seconds?: number
  /** Required skill level */
  required_skill_level?: number
  /** Icon URL */
  icon_url?: string
  /** Number of ingredients */
  ingredient_count: number
  /** Drop probability for this mission */
  drop_probability: number
  /** Is guaranteed reward */
  is_guaranteed: boolean
}
export type ReputationRank = {
  scope_code: string
  scope_display_name: string
  standing_code: string
  standing_display_name: string
  threshold: number
  ceiling: number
  rank_index: number
}
export type GameEvent = {
  event_id: string
  event_code: string
  event_name: string
  mission_count: number
}
export type QualityContribution = {
  /** Material name */
  material_name: string
  /** Quality tier (1-5) */
  quality_tier: number
  /** Quality value (0-100) */
  quality_value: number
  /** Weight in calculation */
  weight: number
  /** Contribution to final quality */
  contribution: number
}
export type RecordStringNumber = {
  [key: string]: number
}
export type CalculateQualityResponse = {
  /** Output quality tier (1-5) */
  output_quality_tier: number
  /** Output quality value (0-100) */
  output_quality_value: number
  /** Output quantity */
  output_quantity: number
  /** Calculation breakdown */
  calculation_breakdown: {
    /** Quality contributions per material */
    quality_contributions: QualityContribution[]
    /** Input weights per material */
    input_weights: RecordStringNumber
    /** Formula type used (weighted_average, minimum, maximum) */
    formula_used: string
  }
  /** Estimated costs */
  estimated_cost: {
    /** Total cost */
    total_cost: number
    /** Crafting station fee */
    crafting_station_fee?: number
    /** Total material cost */
    material_cost: number
  }
  /** Success probability percentage (0-100) */
  success_probability: number
  /** Critical success chance percentage (0-100) */
  critical_success_chance: number
}
export type CraftingInputMaterial = {
  /** Game item UUID */
  game_item_id: string
  /** Quantity of material */
  quantity: number
  /** Quality tier (1-5) — optional, derived from quality_value if not provided */
  quality_tier?: number
  /** Precise quality value (0-1000) */
  quality_value: number
}
export type CalculateQualityRequest = {
  /** Blueprint UUID */
  blueprint_id: string
  /** Input materials with quality values */
  input_materials: CraftingInputMaterial[]
}
export type SimulationResult = {
  /** Material configuration used */
  material_configuration: CraftingInputMaterial[]
  /** Output quality tier */
  output_quality_tier: number
  /** Output quality value */
  output_quality_value: number
  /** Estimated total cost */
  estimated_cost: number
}
export type SimulateCraftingResponse = {
  /** Blueprint UUID */
  blueprint_id: string
  /** Blueprint name */
  blueprint_name: string
  /** All simulation results */
  simulation_results: SimulationResult[]
  /** Best result (highest quality) */
  best_result: SimulationResult
  /** Worst result (lowest quality) */
  worst_result: SimulationResult
  /** Most cost-effective result */
  most_cost_effective: SimulationResult
}
export type MaterialVariation = {
  /** Game item UUID */
  game_item_id: string
  /** Quantity of material */
  quantity: number
  /** Quality tier options to test */
  quality_tiers: number[]
}
export type SimulateCraftingRequest = {
  /** Blueprint UUID */
  blueprint_id: string
  /** Material variations to test */
  material_variations: MaterialVariation[]
}
export type RecordCraftingResponse = {
  /** Success status */
  success: boolean
  /** Crafting session UUID */
  session_id: string
}
export type RecordCraftingRequest = {
  /** Blueprint UUID */
  blueprint_id: string
  /** Input materials used */
  input_materials: CraftingInputMaterial[]
  /** Output quality tier achieved */
  output_quality_tier: number
  /** Output quality value achieved */
  output_quality_value: number
  /** Output quantity produced */
  output_quantity: number
  /** Was critical success */
  was_critical_success: boolean
  /** Total material cost */
  total_material_cost?: number
  /** Crafting station fee */
  crafting_station_fee?: number
}
export type CraftingSessionHistory = {
  /** Session UUID */
  session_id: string
  /** Blueprint UUID */
  blueprint_id: string
  /** Blueprint name */
  blueprint_name: string
  /** Output item name */
  output_item_name: string
  /** Crafting date */
  crafting_date: string
  /** Input materials used */
  input_materials: CraftingInputMaterial[]
  /** Output quality tier */
  output_quality_tier: number
  /** Output quality value */
  output_quality_value: number
  /** Output quantity */
  output_quantity: number
  /** Was critical success */
  was_critical_success: boolean
  /** Total material cost */
  total_material_cost?: number
  /** Crafting station fee */
  crafting_station_fee?: number
}
export type GetCraftingHistoryResponse = {
  /** Crafting sessions */
  history: CraftingSessionHistory[]
  /** Total number of sessions */
  total: number
  /** Current page */
  page: number
  /** Page size */
  page_size: number
}
export type MaterialAvailability = {
  /** Game item UUID */
  game_item_id: string
  /** Material name */
  material_name: string
  /** Required quantity */
  quantity_required: number
  /** Available quantity in stock */
  quantity_available: number
  /** Is sufficient */
  is_sufficient: boolean
  /** Quality tier range available */
  quality_tier_min?: number
  quality_tier_max?: number
  /** Stock lot IDs containing this material */
  stock_lot_ids: string[]
}
export type CraftableItem = {
  /** Blueprint UUID */
  blueprint_id: string
  /** Blueprint name */
  blueprint_name: string
  /** Output item name */
  output_item_name: string
  /** Output item icon */
  output_item_icon?: string
  /** Item category */
  item_category?: string
  /** Rarity */
  rarity?: string
  /** Tier */
  tier?: number
  /** Crafting time in seconds */
  crafting_time_seconds?: number
  /** Can craft with current stock */
  can_craft: boolean
  /** Maximum craftable quantity */
  max_craftable_quantity: number
  /** Material availability details */
  materials: MaterialAvailability[]
  /** Missing materials count */
  missing_materials_count: number
  /** Estimated cost per craft */
  estimated_cost_per_craft?: number
}
export type GetCraftableItemsResponse = {
  /** Craftable items */
  craftable_items: CraftableItem[]
  /** Total count */
  total: number
  /** Current page */
  page: number
  /** Page size */
  page_size: number
  /** Summary statistics */
  summary: {
    /** Items missing materials */
    items_missing_materials: number
    /** Items that can be crafted now */
    items_craftable_now: number
    /** Total blueprints owned */
    total_blueprints_owned: number
  }
}
export type BlueprintStatistics = {
  /** Blueprint UUID */
  blueprint_id: string
  /** Blueprint name */
  blueprint_name: string
  /** Total crafts */
  total_crafts: number
  /** Average output quality */
  average_quality: number
  /** Success rate percentage */
  success_rate: number
  /** Critical success count */
  critical_successes: number
  /** Total materials spent */
  total_materials_cost: number
}
export type GetCraftingStatisticsResponse = {
  /** Total crafting sessions */
  total_sessions: number
  /** Total unique blueprints crafted */
  unique_blueprints_crafted: number
  /** Average output quality across all crafts */
  average_output_quality: number
  /** Total critical successes */
  total_critical_successes: number
  /** Critical success rate percentage */
  critical_success_rate: number
  /** Total materials cost */
  total_materials_cost: number
  /** Statistics per blueprint */
  blueprint_statistics: BlueprintStatistics[]
}
export type BlueprintSearchResult = {
  /** Blueprint UUID */
  blueprint_id: string
  /** Blueprint code (internal name for URL-friendly links) */
  blueprint_code: string
  /** Blueprint name */
  blueprint_name: string
  /** Output item name */
  output_item_name: string
  /** Output item icon URL */
  output_item_icon?: string
  /** Item category */
  item_category?: string
  /** Item subcategory */
  item_subcategory?: string
  /** Manufacturer name */
  manufacturer?: string
  /** Blueprint source (default, mission_reward) */
  source?: string
  /** Rarity */
  rarity?: string
  /** Tier (1-5) */
  tier?: number
  /** Number of ingredients */
  ingredient_count: number
  /** Ingredient summaries */
  ingredients: {
    quantity_required: number
    icon_url?: string
    sub_type?: string
    name: string
  }[]
  /** Number of missions that reward this blueprint */
  mission_count: number
  /** Crafting time in seconds */
  crafting_time_seconds?: number
  /** Distinct modifier property names (e.g. ["damagemitigation", "mintemp"]) */
  modifier_properties?: string[]
  /** Does user own this blueprint */
  user_owns?: boolean
}
export type SearchBlueprintsResponse = {
  /** Blueprint search results */
  blueprints: BlueprintSearchResult[]
  /** Total number of blueprints matching filters */
  total: number
  /** Current page number */
  page: number
  /** Page size */
  page_size: number
}
export type Blueprint = {
  blueprint_id: string
  version_id: string
  blueprint_code: string
  blueprint_name: string
  blueprint_description?: string
  output_game_item_id: string
  output_quantity: number
  item_category?: string
  item_subcategory?: string
  rarity?: string
  tier?: number
  crafting_station_type?: string
  crafting_time_seconds?: number
  required_skill_level?: number
  icon_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}
export type GameItem = {
  /** Game item UUID */
  game_item_id: string
  /** Item name */
  name: string
  /** Item type */
  type: string
  /** Item sub-type (e.g., mineral, metal, gas for commodities) */
  sub_type?: string
  /** Icon URL */
  icon_url?: string
}
export type BlueprintIngredient = {
  /** Ingredient UUID */
  ingredient_id: string
  /** Game item reference */
  game_item: GameItem
  /** Required quantity */
  quantity_required: number
  /** Minimum quality tier (1-5) */
  min_quality_tier?: number
  /** Recommended quality tier (1-5) */
  recommended_quality_tier?: number
  /** Is alternative ingredient */
  is_alternative: boolean
  /** Alternative group ID */
  alternative_group?: number
  /** Slot name for linking to slot modifiers */
  slot_name?: string
  /** Slot display name */
  slot_display_name?: string
  /** Minimum market price */
  market_price_min?: number
  /** Maximum market price */
  market_price_max?: number
  /** User inventory quantity */
  user_inventory_quantity?: number
}
export type MissionRewardingBlueprint = {
  /** Mission UUID */
  mission_id: string
  /** Mission name */
  mission_name: string
  /** Drop probability percentage (0-100) */
  drop_probability: number
  /** Star system */
  star_system?: string
}
export type SlotModifier = {
  slot_name: string
  slot_display_name: string
  /** Property affected (e.g., "damagemitigation", "mintemp", "maxtemp") */
  property: string
  start_quality: number
  end_quality: number
  /** Modifier value at start_quality (e.g., 0.9 = ×0.9) */
  modifier_at_start: number
  /** Modifier value at end_quality (e.g., 1.1 = ×1.1) */
  modifier_at_end: number
}
export type UserBlueprintAcquisition = {
  /** Acquisition date */
  acquisition_date: string
  /** Acquisition method */
  acquisition_method?: string
  /** Acquisition location */
  acquisition_location?: string
  /** Acquisition notes */
  acquisition_notes?: string
}
export type BlueprintDetailResponse = {
  /** Complete blueprint data */
  blueprint: Blueprint
  /** Output item reference */
  output_item: GameItem
  /** Ingredients required */
  ingredients: BlueprintIngredient[]
  /** Missions that reward this blueprint */
  missions_rewarding: MissionRewardingBlueprint[]
  /** Crafting recipe (if available) */
  crafting_recipe?: {
    max_output_quality_tier: number
    min_output_quality_tier: number
    quality_calculation_type: string
  }
  /** Per-slot quality modifiers (how ingredient quality affects output stats) */
  slot_modifiers: SlotModifier[]
  /** Output item base attributes (damage resistance, temperature, etc.) */
  item_attributes: RecordStringString
  /** Does user own this blueprint */
  user_owns?: boolean
  /** User acquisition data */
  user_acquisition?: UserBlueprintAcquisition
}
export type BlueprintCategory = {
  /** Category name */
  category: string
  /** Subcategory name */
  subcategory?: string
  /** Number of blueprints in this category */
  count: number
}
export type CraftableBlueprintResult = {
  blueprint_id: string
  blueprint_code: string
  blueprint_name: string
  output_item_name: string
  output_item_icon?: string
  item_category?: string
  crafting_time_seconds?: number
  max_craftable: number
  ingredients: {
    quality_value?: number
    available_quantity: number
    quantity_required: number
    name: string
    game_item_id: string
  }[]
}
export type MarketVersion = "V1" | "V2"
export type RecordStringBoolean = {
  [key: string]: boolean
}
export type GetFeatureFlagResponse = {
  /** User ID */
  user_id: string
  /** Current market version (V1 or V2) — backward compat */
  market_version: MarketVersion
  /** Whether user has developer privileges (admin or dev environment) */
  is_developer: boolean
  /** Whether this user has a manual override (show treatment picker if true) */
  has_override: boolean
  /** All resolved flags for this user */
  flags: RecordStringBoolean
  /** Which flags this user has overrides for */
  overridden_flags: string[]
}
export type SetFeatureFlagResponse = {
  /** User ID */
  user_id: string
  /** Updated market version */
  market_version: MarketVersion
  /** Success message */
  message: string
}
export type SetFeatureFlagRequest = {
  /** Market version to set (V1 or V2) — backward compat for market_v2 */
  market_version?: MarketVersion
  /** Flag name to set (e.g. "market_v2", "crafting", "wiki") */
  flag_name?: string
  /** Whether to enable or disable the flag */
  enabled?: boolean
}
export type CartListingInfo = {
  /** Listing UUID */
  listing_id: string
  /** Listing title */
  title: string
  /** Seller username or contractor name */
  seller_name: string
  /** Seller ID (user_id or contractor_id) */
  seller_id: string
  /** Seller type */
  seller_type: "user" | "contractor"
  /** Seller slug (username or spectrum_id) */
  seller_slug: string
  /** Seller rating (0-5) */
  seller_rating: number
  /** Current listing status */
  status: string
  /** ISO 8601 timestamp of seller's next available slot, or null if not set / currently available */
  seller_next_available?: string | null
}
export type CartVariantDetail = {
  /** UUID of the variant */
  variant_id: string
  /** Variant attributes (quality_tier, quality_value, crafted_source, etc) */
  attributes: VariantAttributes
  /** Human-readable display name (e.g., "Tier 5 (95.5%) - Crafted") */
  display_name: string
  /** Short name for compact display (e.g., "T5 Crafted") */
  short_name: string
}
export type CartItemDetail = {
  /** UUID of the cart item */
  cart_item_id: string
  /** Listing information */
  listing: CartListingInfo
  /** Variant details with quality attributes */
  variant: CartVariantDetail
  /** Quantity in cart */
  quantity: number
  /** Price per unit at time of add-to-cart (snapshot) */
  price_per_unit: number
  /** Subtotal for this item (quantity * price_per_unit) */
  subtotal: number
  /** Whether this variant is currently available */
  available: boolean
  /** Total quantity available for this variant */
  quantity_available: number
  /** Whether the price has changed since add-to-cart */
  price_changed: boolean
  /** Current price if price_changed is true */
  current_price?: number
}
export type GetCartResponse = {
  /** Array of cart items with variant details */
  items: CartItemDetail[]
  /** Total price of all items in cart */
  total_price: number
  /** Total number of items in cart */
  item_count: number
}
export type AddToCartResponse = {
  /** UUID of the created cart item */
  cart_item_id: string
  /** Success message */
  message: string
}
export type AddToCartRequest = {
  /** UUID of the listing */
  listing_id: string
  /** UUID of the specific variant to add */
  variant_id: string
  /** Quantity to add (must be > 0) */
  quantity: number
}
export type UpdateCartItemRequest = {
  /** New quantity (optional, must be > 0 if provided) */
  quantity?: number
  /** New variant selection (optional) */
  variant_id?: string
}
export type UnavailableCartItem = {
  /** Cart item UUID */
  cart_item_id: string
  /** Listing title */
  listing_title: string
  /** Variant display name */
  variant_display_name: string
  /** Reason for unavailability */
  reason: string
}
export type CheckoutCartResponse = {
  /** Result status */
  result: string
  /** UUID of the created offer */
  offer_id: string
  /** UUID of the offer session */
  session_id: string
  /** Discord invite code (if available) */
  discord_invite: string | null
  /** Array of items that could not be purchased (optional) */
  unavailable_items?: UnavailableCartItem[]
}
export type CheckoutCartRequest = {
  /** Required if any prices have changed since add-to-cart */
  confirm_price_changes?: boolean
  /** Optional note from buyer to seller */
  note?: string
  /** Checkout only items from this seller (user_id or contractor_id). If omitted, all items must be from one seller. */
  seller_id?: string
}
export type BuyOrderVariantDetail = {
  /** UUID of the variant */
  variant_id: string
  /** Variant attributes (quality_tier, quality_value, crafted_source, etc) */
  attributes: VariantAttributes
  /** Human-readable display name (e.g., "Tier 5 (95.5%) - Crafted") */
  display_name: string
  /** Short name for compact display (e.g., "T5 Crafted") */
  short_name: string
}
export type BuyOrderItemDetail = {
  /** UUID of the order item */
  order_item_id: string
  /** UUID of the listing */
  listing_id: string
  /** UUID of the listing item */
  item_id: string
  /** Variant details with quality attributes */
  variant: BuyOrderVariantDetail
  /** Quantity purchased */
  quantity: number
  /** Price per unit at time of purchase (snapshot) */
  price_per_unit: number
  /** Subtotal for this item (quantity * price_per_unit) */
  subtotal: number
}
export type CreateBuyOrderResponse = {
  /** UUID of the created order */
  order_id: string
  /** UUID of the buyer */
  buyer_id: string
  /** UUID of the seller */
  seller_id: string
  /** Total price in aUEC (atomic units) */
  total_price: number
  /** Order status */
  status: string
  /** ISO 8601 timestamp of order creation */
  created_at: string
  /** Purchase item details */
  item: BuyOrderItemDetail
  /** Stock allocation result summary */
  allocation_result?: {
    total_allocated: number
    total_requested: number
    has_partial_allocations: boolean
  }
}
export type CreateBuyOrderRequest = {
  /** UUID of the listing to purchase from */
  listing_id: string
  /** UUID of the specific variant to purchase */
  variant_id: string
  /** Quantity to purchase (must be > 0) */
  quantity: number
}
export type StandingBuyOrder = {
  buy_order_id: string
  game_item_id: string
  game_item_name: string
  /** Game item type for quality mode determination */
  game_item_type?: string
  buyer_id: string
  buyer_name: string
  quantity: number
  price_per_unit: number
  quality_tier_min?: number
  quality_tier_max?: number
  /** Minimum quality value (0-1000) */
  quality_value_min?: number
  /** Maximum quality value (0-1000) */
  quality_value_max?: number
  negotiable: boolean
  status: "active" | "fulfilled" | "cancelled" | "expired"
  created_at: string
  expires_at?: string
}
export type CreateStandingBuyOrderRequest = {
  game_item_id: string
  quantity: number
  price_per_unit: number
  quality_tier_min?: number
  quality_tier_max?: number
  /** Minimum quality value (0-1000) for resource buy orders */
  quality_value_min?: number
  /** Maximum quality value (0-1000) for resource buy orders */
  quality_value_max?: number
  negotiable?: boolean
  expires_in_days?: number
}
export type SearchBuyOrdersResponse = {
  buy_orders: StandingBuyOrder[]
  total: number
  page: number
  page_size: number
}
export type UpdateStandingBuyOrderRequest = {
  quantity?: number
  price_per_unit?: number
  quality_tier_min?: number
  quality_tier_max?: number
  quality_value_min?: number
  quality_value_max?: number
  negotiable?: boolean
  expires_in_days?: number
}
export type SellerNextAvailableResponse = {
  /** ISO 8601 timestamp of next available slot, or null if currently available / no schedule */
  next_available: string | null
  /** Whether the seller has an availability schedule set */
  has_schedule: boolean
}
export type BidDetail = {
  bid_id: string
  bidder: {
    avatar: string | null
    display_name: string
    username: string
  }
  amount: number
  is_active: boolean
  created_at: string
}
export type AuctionDetailResponse = {
  listing_id: string
  end_time: string
  min_bid_increment: number
  buyout_price: number | null
  reserve_price: number | null
  status: string
  current_highest_bid: number | null
  total_bids: number
  bids: BidDetail[]
}
export type PlaceBidResponse = {
  bid_id: string
  amount: number
  is_highest: boolean
  current_highest: number
}
export type PlaceBidRequest = {
  amount: number
}
export type PriceDataPoint = {
  /** ISO 8601 timestamp for this data point */
  timestamp: string
  /** Average price during this time period */
  avg_price: number
  /** Minimum price during this time period */
  min_price: number
  /** Maximum price during this time period */
  max_price: number
  /** Number of transactions/listings during this time period */
  volume: number
  /** Optional quality tier for this data series */
  quality_tier?: number
}
export type GetPriceHistoryResponse = {
  /** Game item UUID */
  game_item_id: string
  /** Game item name */
  game_item_name: string
  /** Time series data points */
  data: PriceDataPoint[]
  /** Start date of the time range */
  start_date: string
  /** End date of the time range */
  end_date: string
  /** Time interval used for aggregation */
  interval: string
}
export type QualityTierDistribution = {
  /** Quality tier (1-5) */
  quality_tier: number
  /** Total quantity available for this tier */
  quantity_available: number
  /** Number of listings offering this tier */
  listing_count: number
  /** Average price for this tier */
  avg_price: number
  /** Minimum price for this tier */
  min_price: number
  /** Maximum price for this tier */
  max_price: number
  /** Number of unique sellers offering this tier */
  seller_count: number
}
export type GetQualityDistributionResponse = {
  /** Game item UUID */
  game_item_id: string
  /** Game item name */
  game_item_name: string
  /** Distribution data by quality tier */
  distribution: QualityTierDistribution[]
  /** Total quantity across all tiers */
  total_quantity: number
  /** Start date of the time range (if filtered) */
  start_date?: string
  /** End date of the time range (if filtered) */
  end_date?: string
}
export type QualityTierSales = {
  /** Quality tier (1-5) */
  quality_tier: number
  /** Total sales volume (number of items sold) */
  volume: number
  /** Average sale price for this tier */
  avg_price: number
  /** Average time to sale in hours */
  avg_time_to_sale_hours: number
}
export type QualityTierPremium = {
  /** Quality tier (1-5) */
  quality_tier: number
  /** Price premium percentage compared to tier 1 baseline */
  premium_percentage: number
}
export type GetSellerStatsResponse = {
  /** Seller ID */
  seller_id: string
  /** Sales data grouped by quality tier */
  sales_by_quality: QualityTierSales[]
  /** Current inventory distribution by quality tier */
  inventory_distribution: QualityTierDistribution[]
  /** Price premium percentages by quality tier */
  price_premiums: QualityTierPremium[]
}
export type MigrationStatusResponse = {
  v1_counts: {
    total: number
    multiple: number
    aggregate: number
    unique: number
  }
  v2_counts: {
    photos: number
    stock_lots_mapped: number
    mapped: number
    listings: number
  }
  price_history: {
    v2: number
    v1: number
  }
  auctions: {
    v2: number
    v1: number
  }
  order_items: {
    v2: number
    v1: number
  }
  offer_items: {
    v2: number
    v1: number
  }
  buy_orders: {
    v2: number
    v1: number
  }
}
export type MigrationSummary = {
  total_attempted: number
  successful: number
  failed: number
  skipped: number
  errors: {
    error: string
    v1_listing_id: string
  }[]
}
export type MigrationResult = {
  dry_run: boolean
  listings: MigrationSummary
  price_history: MigrationSummary
  auctions: MigrationSummary
  order_items: MigrationSummary
  offer_items: MigrationSummary
  buy_orders: MigrationSummary
  duration_seconds: number
}
export type MigrationJob = {
  id: string
  status: "running" | "rolling_back" | "completed" | "failed"
  dry_run: boolean
  started_at: string
  completed_at: string | null
  progress: string | null
  result: MigrationResult | null
  error: string | null
}
export type MigrationRunRequest = {
  dry_run: boolean
}
export type FeatureFlagConfig = {
  flag_name: string
  default_version: MarketVersion
  rollout_percentage: number
  enabled: boolean
}
export type UpdateConfigRequest = {
  /** Which flag to update (defaults to market_v2) */
  flag_name?: string
  /** Global default version for users without overrides */
  default_version?: MarketVersion
  /** Percentage of users (0-100) to receive V2 via rollout */
  rollout_percentage?: number
  /** Master kill-switch: when false, everyone gets V1 */
  enabled?: boolean
}
export type FeatureFlagStats = {
  flag_name: string
  enabled: boolean
  default_version: MarketVersion
  rollout_percentage: number
  override_count: number
  enabled_overrides: number
  disabled_overrides: number
}
export type UserOverrideWithName = {
  user_id: string
  username: string
  flag_name: string
  enabled: boolean
  updated_at: string
}
export type UserOverridesResponse = {
  overrides: UserOverrideWithName[]
  total: number
}
export type SetUserOverrideRequest = {
  username: string
  flag_name: string
  enabled: boolean
}
export type ImportErrorResponse = {
  success: false
  error: string
  details?: string
  timestamp: string
}
export type ImportGameDataResponse = {
  success: boolean
  summary: {
    blueprintsUpdated: number
    blueprintsInserted: number
    blueprintsProcessed: number
    missionsUpdated: number
    missionsInserted: number
    missionsProcessed: number
    fullSetsCreated: number
    nameChanges: number
    updated: number
    inserted: number
    matchedFuzzy: number
    matchedCStoneUUID: number
    matchedExact: number
    matched: number
    existingDBItems: number
    validP4KItems: number
    totalP4KItems: number
  }
  errors: string[]
  timestamp: string
}
export type GameDataImportJob = {
  id: string
  status: "validating" | "extracting" | "importing" | "completed" | "failed"
  startedAt: string
  completedAt: string | null
  progress: string | null
  result: ImportGameDataResponse | null
  error: string | null
  details: string | null
}
export const {
  useGetVariantTypesQuery,
  useCreateStockLotMutation,
  useGetStockLotsQuery,
  useUpdateStockLotMutation,
  useDeleteStockLotMutation,
  useBulkUpdateStockLotsMutation,
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderDetailQuery,
  useGetOrdersByListingQuery,
  useGetOfferSessionQuery,
  useSearchOffersQuery,
  useCreateListingMutation,
  useSearchListingsQuery,
  useGetMyListingsQuery,
  useGetInventorySummaryQuery,
  useGetListingDetailQuery,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useRefreshListingMutation,
  useTrackViewMutation,
  useUploadPhotosMutation,
  useGetInventoryQuery,
  useCreateInventoryLotMutation,
  useLinkToListingMutation,
  useUnlinkFromListingMutation,
  useDeleteInventoryLotMutation,
  useStartImportMutation,
  useGetJobStatusQuery,
  useListJobsQuery,
  useGetHealthQuery,
  useSearchGameItemsQuery,
  useGetCategoriesQuery,
  useGetListingsQuery,
  useSearchGameItemAggregatesQuery,
  useGetWishlistsQuery,
  useCreateWishlistMutation,
  useGetWishlistQuery,
  useUpdateWishlistMutation,
  useDeleteWishlistMutation,
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
  useUpdateWishlistItemMutation,
  useGenerateShoppingListQuery,
  useSearchItemsQuery,
  useGetItemDetailQuery,
  useGetShipsQuery,
  useGetShipDetailQuery,
  useGetCommoditiesQuery,
  useGetLocationsQuery,
  useGetManufacturersQuery,
  useGetManufacturerDetailQuery,
  useListVersionsQuery,
  useGetActiveVersionsQuery,
  useSelectVersionMutation,
  useSearchResourcesQuery,
  useGetResourceQuery,
  useGetResourceCategoriesQuery,
  useSearchMissionsQuery,
  useGetMissionDetailQuery,
  useGetMissionDetailByCodeQuery,
  useGetMissionBlueprintsQuery,
  useCompleteMissionMutation,
  useRateMissionMutation,
  useGetMissionChainsQuery,
  useGetReputationRanksQuery,
  useGetGameEventsQuery,
  useCalculateQualityMutation,
  useSimulateCraftingMutation,
  useRecordCraftingMutation,
  useGetCraftingHistoryQuery,
  useGetCraftableItemsQuery,
  useGetCraftingStatisticsQuery,
  useSearchBlueprintsQuery,
  useGetBlueprintDetailQuery,
  useGetBlueprintDetailByCodeQuery,
  useGetBlueprintMissionsQuery,
  useAddBlueprintToInventoryMutation,
  useRemoveBlueprintFromInventoryMutation,
  useGetBlueprintCategoriesQuery,
  useGetUserBlueprintInventoryQuery,
  useGetOrgBlueprintOwnersQuery,
  useFindCraftableBlueprintsMutation,
  useGetFeatureFlagQuery,
  useSetFeatureFlagMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useCheckoutCartMutation,
  useCreatePurchaseMutation,
  useCreateStandingBuyOrderMutation,
  useSearchBuyOrdersQuery,
  useGetMyBuyOrdersQuery,
  useUpdateBuyOrderMutation,
  useCancelBuyOrderMutation,
  useFulfillBuyOrderMutation,
  useGetNextAvailableQuery,
  useGetAuctionDetailQuery,
  usePlaceBidMutation,
  useGetPriceHistoryQuery,
  useGetQualityDistributionQuery,
  useGetSellerStatsQuery,
  useGetMigrationStatusQuery,
  useListMigrationJobsQuery,
  useGetMigrationJobQuery,
  useRunMigrationMutation,
  useGetConfigQuery,
  useUpdateConfigMutation,
  useGetStatsQuery,
  useGetUserOverridesQuery,
  useSetUserOverrideMutation,
  useRemoveUserOverrideMutation,
  useImportGameDataMutation,
  useListGameDataImportJobsQuery,
  useGetImportJobStatusQuery,
} = injectedRtkApi
