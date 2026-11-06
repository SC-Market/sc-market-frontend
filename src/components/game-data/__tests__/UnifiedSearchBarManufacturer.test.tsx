import "../../../util/i18n"
/**
 * Manufacturer tokens: the filters take the code ("behr"), the search bar
 * shows the name ("Behring").
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import {
  UnifiedSearchBar,
  blueprintParamsToTokens,
  blueprintTokensToParams,
  manufacturerSearchTokens,
  wikiItemsParamsToTokens,
  wikiItemsTokensToParams,
} from "../UnifiedSearchBar"

const MANUFACTURERS = [
  { manufacturer: "behr", display_name: "Behring", item_count: 150 },
  { manufacturer: "987", display_name: null, item_count: 59 },
]

describe("manufacturerSearchTokens", () => {
  it("labels with the name and keeps the code as the value", () => {
    expect(manufacturerSearchTokens(MANUFACTURERS)).toEqual([
      { type: "manufacturer", label: "Behring", value: "behr" },
      // No display name: the code is the label
      { type: "manufacturer", label: "987", value: "987" },
    ])
    expect(manufacturerSearchTokens(undefined)).toEqual([])
  })
})

describe("manufacturer filter params", () => {
  it("blueprints: mfr carries the code both ways", () => {
    const tokens = blueprintParamsToTokens(new URLSearchParams("mfr=behr"))
    expect(tokens).toContainEqual({
      type: "manufacturer",
      label: "behr",
      value: "behr",
    })
    expect(blueprintTokensToParams(tokens)).toEqual({ mfr: "behr" })
  })

  it("wiki items: manufacturer carries the code both ways", () => {
    const tokens = wikiItemsParamsToTokens(
      new URLSearchParams("manufacturer=behr"),
    )
    expect(tokens).toEqual([
      { type: "manufacturer", label: "behr", value: "behr" },
    ])
    expect(wikiItemsTokensToParams(tokens)).toEqual({ manufacturer: "behr" })
  })
})

describe("UnifiedSearchBar manufacturer token", () => {
  it.each(["blueprints", "wiki-items"] as const)(
    "%s: a code from the URL shows the manufacturer name",
    (mode) => {
      render(
        <UnifiedSearchBar
          tokens={[{ type: "manufacturer", label: "behr", value: "behr" }]}
          onChange={() => {}}
          mode={mode}
          extraOptions={manufacturerSearchTokens(MANUFACTURERS)}
        />,
      )
      expect(screen.getByText("Behring")).toBeInTheDocument()
      expect(screen.queryByText("behr")).not.toBeInTheDocument()
    },
  )
})
