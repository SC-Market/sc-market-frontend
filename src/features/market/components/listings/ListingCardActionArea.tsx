import React from "react"
import { CardActionArea } from "@mui/material"
import { cardActionAreaClasses } from "@mui/material/CardActionArea"
import { touchRippleClasses } from "@mui/material/ButtonBase"
import type { Theme } from "@mui/material/styles"
import { Link as RouterLink } from "react-router-dom"
import type { ExtendedTheme } from "../../../../hooks/styles/Theme"

/** Marks every tile that responds to hover like a market listing card. */
export const LISTING_CARD_ACTION_CLASS = "ListingCardActionArea"

/**
 * The market tile's hover and keyboard focus: MUI's CardActionArea tint
 * (the focus-highlight layer fades to action.hoverOpacity on hover and to
 * action.focusOpacity on :focus-visible, over the theme's short opacity
 * transition) plus the press ripple. With reduced motion asked for, the tint
 * switches instantly and there is no ripple.
 */
export const listingCardActionAreaSx = (theme: Theme) => ({
  display: "block",
  color: "inherit",
  textDecoration: "none",
  borderRadius: theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
  "@media (prefers-reduced-motion: reduce)": {
    [`& .${cardActionAreaClasses.focusHighlight}`]: { transition: "none" },
    [`& .${touchRippleClasses.root}`]: { display: "none" },
  },
})

type Destination =
  /** An in-app route. */
  | { to: string; href?: never }
  /** An outside page, opened in a new tab. */
  | { href: string; to?: never }

type ListingCardActionAreaProps = Destination & {
  children: React.ReactNode
  /** Passed through for transitions (e.g. Fade) wrapping the tile. */
  style?: React.CSSProperties
}

/**
 * The clickable surface of a market grid tile, itself the link: listing cards
 * and the in-grid ads both use it, so they hover, focus and press alike.
 */
export const ListingCardActionArea = React.forwardRef<
  HTMLAnchorElement,
  ListingCardActionAreaProps
>(function ListingCardActionArea({ children, style, to, href }, ref) {
  if (to !== undefined) {
    return (
      <CardActionArea
        ref={ref}
        component={RouterLink}
        to={to}
        style={style}
        className={LISTING_CARD_ACTION_CLASS}
        sx={listingCardActionAreaSx}
      >
        {children}
      </CardActionArea>
    )
  }
  return (
    <CardActionArea
      ref={ref}
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
      className={LISTING_CARD_ACTION_CLASS}
      sx={listingCardActionAreaSx}
    >
      {children}
    </CardActionArea>
  )
})
