/** Tag filter chips of the shop directory (/shops), also drawn by its skeleton. */
export const SHOP_TAGS = [
  "Weapons",
  "Armor",
  "Components",
  "Cargo",
  "Mining",
  "Salvage",
  "Medical",
  "Vehicles",
  "Services",
] as const

/** Shop cards per page; the loading grid shows a page of placeholders. */
export const SHOP_DIRECTORY_PAGE_SIZE = 24

/** Grid columns of the shop card grid. */
export const SHOP_GRID_BREAKPOINTS = { xs: 12, sm: 6, md: 4, lg: 3 } as const
