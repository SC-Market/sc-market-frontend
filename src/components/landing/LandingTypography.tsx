import React, { ReactNode } from "react"
import { SxProps, Theme, Typography } from "@mui/material"

/**
 * The homepage's three text levels, so every section uses the same sizes.
 * The visual variant is fixed per level; the element is the semantic level
 * (sections are <h2>, blocks inside them <h3>), so the page keeps one <h1>
 * (the hero's landing.heroTitle) and an unbroken heading outline.
 */

type TextProps = { children: ReactNode; sx?: SxProps<Theme> }

/** Base styles first, then the caller's sx (MUI's array form merges them). */
function withSx(base: SxProps<Theme>, sx?: SxProps<Theme>): SxProps<Theme> {
  return [base, ...(Array.isArray(sx) ? sx : [sx])] as SxProps<Theme>
}

/** A homepage section title ("For Orgs", "Our Supporters", the FAQ, ...). */
export function LandingSectionTitle(props: TextProps & { id?: string }) {
  return (
    <Typography
      id={props.id}
      variant={"h3"}
      component={"h2"}
      color={"text.secondary"}
      sx={withSx({ fontWeight: "bold", textAlign: "center" }, props.sx)}
    >
      {props.children}
    </Typography>
  )
}

/** The title of one block in a section (a feature, an org tool, a question). */
export function LandingBlockTitle(
  props: TextProps & { bold?: boolean; component?: React.ElementType },
) {
  const { bold = true, component = "h3" } = props
  return (
    <Typography
      variant={"h5"}
      component={component}
      color={"text.secondary"}
      sx={withSx(
        { fontWeight: bold ? "bold" : undefined, textAlign: "center" },
        props.sx,
      )}
    >
      {props.children}
    </Typography>
  )
}

/**
 * Running text under a title: the duller text.primary, like body copy across
 * the site (in this theme text.secondary is the brighter one, for titles).
 */
export function LandingBodyText(props: TextProps) {
  return (
    <Typography
      variant={"body1"}
      color={"text.primary"}
      sx={withSx({ textAlign: "left" }, props.sx)}
    >
      {props.children}
    </Typography>
  )
}
