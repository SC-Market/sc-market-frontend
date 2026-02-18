/**
 * Embed facade components for lazy-loading heavy third-party embeds.
 *
 * These components implement the facade pattern to defer loading of heavy
 * embeds (videos, maps, etc.) until user interaction, improving initial
 * page load performance.
 *
 * Requirements: 7.3 - Implement facade pattern for heavy embeds
 */

export { YouTubeFacade } from "./YouTubeFacade"
export { EmbedFacade } from "./EmbedFacade"
