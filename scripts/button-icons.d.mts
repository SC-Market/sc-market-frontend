import type { Rule } from "eslint"

/** Glyphs that stand in for an icon at the start or end of a label. */
export const LABEL_GLYPHS: string[]
/** True when `text` starts or ends with one of LABEL_GLYPHS. */
export function hasEdgeGlyph(text: unknown): boolean
export const buttonIconsRule: Rule.RuleModule
