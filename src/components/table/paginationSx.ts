/**
 * sx for a TablePagination that has to fit a phone screen.
 *
 * Its toolbar is one nowrap row ("Rows per page" + select, "1–10 of 296",
 * prev/next) that is ~380px wide, so at 320–390px the prev/next buttons were
 * pushed out of view. Below `sm` the row wraps (the spacer, a flex-basis-100%
 * filler, would take a whole line, so it goes) and keeps everything right
 * aligned; from `sm` up it's MUI's default layout.
 */
export const MOBILE_WRAP_PAGINATION_SX = {
  "& .MuiTablePagination-toolbar": {
    flexWrap: { xs: "wrap", sm: "nowrap" },
    justifyContent: { xs: "flex-end", sm: "flex-start" },
    rowGap: { xs: 0.5, sm: 0 },
    paddingLeft: { xs: 1, sm: 2 },
  },
  "& .MuiTablePagination-spacer": {
    display: { xs: "none", sm: "block" },
  },
} as const
