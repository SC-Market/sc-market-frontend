import { lazyWithRetry } from "../../util/lazyWithRetry"


export const MarkdownRender = lazyWithRetry(() =>
  import("./Markdown").then((m) => ({ default: m.MarkdownRender })),
)

export const MarkdownEditor = lazyWithRetry(() =>
  import("./Markdown").then((m) => ({ default: m.MarkdownEditor })),
)
