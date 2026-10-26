import React, { Suspense } from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { lazyWithRetry } from "../lazyWithRetry"

describe("lazyWithRetry", () => {
  it("retries a failed chunk instead of throwing to the error boundary", async () => {
    const factory = vi
      .fn()
      .mockRejectedValueOnce(
        new TypeError("Failed to fetch dynamically imported module: http://localhost/assets/Hello-x.js"),
      )
      .mockResolvedValue({ default: () => <p>hello</p> })
    const Hello = lazyWithRetry(factory)

    render(
      <Suspense fallback={<p>loading</p>}>
        <Hello />
      </Suspense>,
    )

    expect(screen.getByText("loading")).toBeInTheDocument()
    expect(await screen.findByText("hello", undefined, { timeout: 3000 })).toBeInTheDocument()
    expect(factory).toHaveBeenCalledTimes(2)
  })
})
