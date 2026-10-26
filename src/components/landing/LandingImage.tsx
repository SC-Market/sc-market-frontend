import { styled } from "@mui/material/styles"

/**
 * A plain <img> that takes `sx`. Unlike `<Box component="img">`, `width` and
 * `height` stay HTML attributes (Box turns them into CSS), so the browser
 * knows the image's aspect ratio before it loads.
 */
export const LandingImg = styled("img")({})

/**
 * `srcSet` for a screenshot shipped at 640px and its full size: the slots
 * are ~280-560px wide, so 1x screens get the 640 file. `mid` is an optional
 * 800px step: a full-width phone slot (~376 CSS px) at 1.75-2x needs ~660-750
 * device px, which is just past 640 and would otherwise fall through to the
 * 1280-1900px original.
 */
export function screenshotSrcSet(
  small: string,
  full: string,
  fullWidth: number,
  mid?: string,
): string {
  return [
    `${small} 640w`,
    ...(mid ? [`${mid} 800w`] : []),
    `${full} ${fullWidth}w`,
  ].join(", ")
}
