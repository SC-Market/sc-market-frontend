import React from "react"
import { describe, it, expect } from "vitest"
import { renderToString } from "react-dom/server"
import { MarkdownRender } from "../Markdown"

/** How the browser parses server HTML (a <p> can't hold a <p> or a <div>). */
function parsed(text: string): Document {
  const html = renderToString(<MarkdownRender text={text} />)
  return new DOMParser().parseFromString(`<body>${html}</body>`, "text/html")
}

describe("MarkdownRender (server HTML that hydrates)", () => {
  it("keeps user headings below the page's h1", () => {
    const doc = parsed("# Who we are\n\n## History\n\n### Ranks")
    expect(doc.querySelectorAll("h1")).toHaveLength(0)
    expect(doc.querySelector("h2")?.textContent).toBe("Who we are")
    expect(doc.querySelector("h3")?.textContent).toBe("History")
    expect(doc.querySelector("h4")?.textContent).toBe("Ranks")
  })

  it("renders links inside a paragraph without nesting paragraphs", () => {
    const text = "Join us > [Discord](https://discord.gg/abc) today"
    const html = renderToString(<MarkdownRender text={text} />)
    const doc = parsed(text)
    // The parsed tree has the same paragraphs React rendered.
    expect(doc.querySelectorAll("p")).toHaveLength(
      (html.match(/<p[\s>]/g) ?? []).length,
    )
    expect(doc.querySelector("p a")?.textContent).toBe("Discord")
    expect(html).not.toMatch(/<a[^>]*>(?:(?!<\/a>).)*<p[\s>]/s)
  })

  it("puts a YouTube video in a block, not inside a <p>", () => {
    const text = "Watch: [trailer](https://www.youtube.com/watch?v=abc123)"
    const html = renderToString(<MarkdownRender text={text} />)
    expect(html).not.toMatch(/<p[^>]*>(?:(?!<\/p>).)*<div/s)
  })
})
