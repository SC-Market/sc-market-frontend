import { lazy } from "react"

export const MarkdownRender = lazy(() =>
  import("./Markdown").then((m) => ({ default: m.MarkdownRender }))
)

export const MarkdownEditor = lazy(() =>
  import("./Markdown").then((m) => ({ default: m.MarkdownEditor }))
)
