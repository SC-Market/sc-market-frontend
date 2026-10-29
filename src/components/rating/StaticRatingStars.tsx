import React from "react"

/**
 * A read-only 0-5 star rating that looks like MUI's
 * <Rating readOnly precision={0.1} size="small" icon={<StarRounded/>} />.
 *
 * MUI's Rating renders every star as ten clipped segments at precision 0.1:
 * about 200 DOM nodes and 700 React fibers per rating. With a rating on each
 * of the 48 market cards that was ~87% of the market page's DOM and most of
 * its first render. This draws the same thing with two SVGs: five empty stars
 * and five filled ones clipped to the rating's width (~14 nodes).
 */

const STAR_PATH =
  "m12 17.27 4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08z"

/** MUI Rating's default filled colour. */
const FILLED_COLOR = "#faaf00"

const STARS = [0, 1, 2, 3, 4].map((i) => (
  <path key={i} d={STAR_PATH} transform={`translate(${i * 24} 0)`} />
))

function Stars(props: { color: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      width="5em"
      height="1em"
      fill={props.color}
      focusable="false"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      {STARS}
    </svg>
  )
}

/** Same label as MUI Rating's default getLabelText. */
function ratingLabel(value: number): string {
  return `${value || "0"} Star${value !== 1 ? "s" : ""}`
}

export function StaticRatingStars(props: {
  /** 0-5. Rounded to one decimal, like MUI's precision={0.1}. */
  value: number
  /** Colour of the empty stars. */
  emptyColor: string
  /** CSS font-size; the stars are 1em tall. MUI's small size is 1.125rem. */
  fontSize?: string
}) {
  const raw = Number.isFinite(props.value) ? props.value : 0
  const value = Math.min(5, Math.max(0, Math.round(raw * 10) / 10))
  return (
    <span
      role="img"
      aria-label={ratingLabel(value)}
      style={{
        position: "relative",
        display: "inline-flex",
        fontSize: props.fontSize ?? "1.125rem",
        lineHeight: 1,
        pointerEvents: "none",
      }}
    >
      <Stars color={props.emptyColor} />
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: `${(value / 5) * 100}%`,
          overflow: "hidden",
        }}
      >
        <Stars color={FILLED_COLOR} />
      </span>
    </span>
  )
}
