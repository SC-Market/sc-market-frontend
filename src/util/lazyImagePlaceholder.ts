/**
 * index.css gives every `img[loading="lazy"]` an animated shimmer background
 * as a placeholder. CSS cannot tell when an image has loaded, so the animation
 * used to run forever: a non-composited (background-position) animation that
 * repaints every frame for every lazy image on the page, and stays visible
 * behind transparent images. This marks each image once it has loaded or
 * failed so the stylesheet can drop the placeholder.
 *
 * load/error do not bubble, so one capture-phase listener on the document
 * sees every <img>, including ones React adds later.
 */
export const LAZY_IMAGE_SETTLED_ATTR = "data-img-settled"

function markSettled(event: Event) {
  const target = event.target
  if (target instanceof HTMLImageElement) {
    target.setAttribute(LAZY_IMAGE_SETTLED_ATTR, "")
  }
}

export function initLazyImagePlaceholders(doc: Document = document) {
  doc.addEventListener("load", markSettled, true)
  doc.addEventListener("error", markSettled, true)
  return () => {
    doc.removeEventListener("load", markSettled, true)
    doc.removeEventListener("error", markSettled, true)
  }
}
