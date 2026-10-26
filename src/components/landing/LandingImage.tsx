import { styled } from "@mui/material/styles"

/**
 * A plain <img> that takes `sx`. Unlike `<Box component="img">`, `width` and
 * `height` stay HTML attributes (Box turns them into CSS), so the browser
 * knows the image's aspect ratio before it loads.
 */
export const LandingImg = styled("img")({})

/**
 * `srcSet` for a screenshot shipped at 640px and its full size: the slots
 * are ~280-560px wide, so 1x screens get the 640 file.
 */
export function screenshotSrcSet(
  small: string,
  full: string,
  fullWidth: number,
): string {
  return `${small} 640w, ${full} ${fullWidth}w`
}
