import { describe, it, expect } from "vitest"
import { queryIndexing } from "../queryIndexing"

const q = (search: string) => queryIndexing(new URLSearchParams(search))

describe("queryIndexing", () => {
  it.each(["", "utm_source=x", "lng=fr&gclid=1"])(
    "%s: the clean page",
    (search) => {
      expect(q(search)).toEqual({ hasQuery: false, pageNumber: null })
    },
  )
  it.each([
    ["page=2", 2],
    ["page=231&utm_medium=x", 231],
  ])("%s: page %i", (search, n) => {
    expect(q(search)).toEqual({ hasQuery: true, pageNumber: n })
  })
  it.each([
    "page=1",
    "page=0",
    "page=2&sort=price",
    "page=abc",
    "page=02",
    "page=2&page=3",
    "text=gold",
    "page=99999",
  ])("%s: a noindex variant", (search) => {
    expect(q(search)).toEqual({ hasQuery: true, pageNumber: null })
  })
})
