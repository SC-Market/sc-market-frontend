import React, { Suspense } from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { lazyWithPreload, lazyWithRetry } from "../lazyWithRetry"

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

describe("lazyWithPreload", () => {
  it("suspends like React.lazy before its chunk is in", async () => {
    const Hello = lazyWithPreload(async () => ({
      default: () => <p>hello</p>,
    }))

    render(
      <Suspense fallback={<p>loading</p>}>
        <Hello />
      </Suspense>,
    )

    expect(screen.getByText("loading")).toBeInTheDocument()
    expect(await screen.findByText("hello")).toBeInTheDocument()
  })

  it("renders a preloaded chunk without suspending", async () => {
    const factory = vi.fn(async () => ({
      default: (props: { name: string }) => <p>hello {props.name}</p>,
    }))
    const Hello = lazyWithPreload(factory)

    await Hello.preload()
    render(
      <Suspense fallback={<p>loading</p>}>
        <Hello name="pilot" />
      </Suspense>,
    )

    // Synchronously, in the first commit: no fallback in between.
    expect(screen.queryByText("loading")).not.toBeInTheDocument()
    expect(screen.getByText("hello pilot")).toBeInTheDocument()
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it("loads the chunk once for preload() and render", async () => {
    const factory = vi.fn(async () => ({ default: () => <p>hello</p> }))
    const Hello = lazyWithPreload(factory)

    const preloading = Hello.preload()
    render(
      <Suspense fallback={<p>loading</p>}>
        <Hello />
      </Suspense>,
    )
    await preloading

    expect(await screen.findByText("hello")).toBeInTheDocument()
    expect(factory).toHaveBeenCalledTimes(1)
  })
})
