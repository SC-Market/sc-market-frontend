/**
 * The page's scroll container. Pages don't scroll the document: the window
 * never scrolls (Root is one viewport tall, overflow hidden), the page
 * scrolls inside its layout's own <main> (ContainerGrid, OpenGrid,
 * OpenLayout), which carries this attribute. So `window.scrollTo` does
 * nothing; use scrollPageToTop.
 */
export const PAGE_SCROLL_ATTRIBUTE = "data-page-scroll"

/** Scroll the page back to its top (after a page change in a paginated list). */
export function scrollPageToTop() {
  document
    .querySelectorAll<HTMLElement>(`[${PAGE_SCROLL_ATTRIBUTE}]`)
    .forEach((el) => el.scrollTo({ top: 0, behavior: "smooth" }))
}
