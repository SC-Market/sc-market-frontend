/**
 * Game data (blueprints, missions, ships, game versions, resources) owned by
 * the game-data feature. Every hook and type here comes straight from the
 * generated v2 client: same endpoints, same cache tags.
 */
export { marketV2Api as gameDataApi } from "../../../store/api/v2/market"
export {
  useAddBlueprintToInventoryMutation,
  useGetActiveVersionsQuery,
  useGetBlueprintDetailQuery,
  useGetGameEventsQuery,
  useGetMissionDetailQuery,
  useGetOrgBlueprintOwnersQuery,
  useGetReputationRanksQuery,
  useGetShipDetailQuery,
  useRateMissionMutation,
  useRemoveBlueprintFromInventoryMutation,
  useSearchBlueprintsQuery,
  useSearchGameItemsQuery,
  useSelectVersionMutation,
} from "../../../store/api/v2/market"
export type {
  BlueprintDetailResponse,
  BlueprintIngredient,
  BlueprintSearchResult,
  EntitySpawn,
  GameVersion,
  GetOrgBlueprintOwnersApiResponse,
  HaulingOrder,
  ItemAcquisitionDocument,
  Mission,
  MissionDetailResponse,
  MissionRewardingBlueprint,
  NpcEncounter,
  QualityBand,
  ResourceSearchResult,
  ShipEncounter,
  SlotModifier,
} from "../../../store/api/v2/market"
