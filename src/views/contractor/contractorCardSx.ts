/**
 * Layout shared by the contractor directory card (ContractorListItem) and its
 * skeleton (ContractorSkeleton), so the skeleton takes the card's space.
 */

/**
 * Card header: on a phone the name/size/rating column must be able to shrink
 * (flex items default to min-width: auto) and long org names wrap.
 */
export const CONTRACTOR_CARD_HEADER_SX = {
  "& .MuiCardHeader-content": { minWidth: 0 },
  "& .MuiCardHeader-title": { overflowWrap: "anywhere" },
} as const

/**
 * Avatar size: a fixed 64px on phones leaves the name room; from `sm` up it
 * is unchanged (fills its slot up to the 96px max set on the avatar).
 */
export const CONTRACTOR_CARD_AVATAR_SIZE = {
  width: { xs: 64, sm: "100%" },
  height: { xs: 64, sm: "100%" },
} as const
