import { describe, expect, it } from "vitest"
import type {
  CLSMetricWithAttribution,
  INPMetricWithAttribution,
  LCPMetricWithAttribution,
} from "web-vitals/attribution"
import { attributionParams } from "../useWebVitals"

describe("attributionParams", () => {
  it("sends the largest shift's target for CLS", () => {
    const metric = {
      name: "CLS",
      attribution: {
        largestShiftTarget: "main>div.MuiBox-root",
        largestShiftTime: 1234.4,
        largestShiftValue: 0.0123,
        loadState: "complete",
      },
    } as unknown as CLSMetricWithAttribution
    expect(attributionParams(metric)).toEqual({
      debug_target: "main>div.MuiBox-root",
      debug_time: 1234,
      debug_shift_value: 12,
      debug_load_state: "complete",
    })
  })

  it("sends the INP target and its phase breakdown, capped to GA's 100 chars", () => {
    const metric = {
      name: "INP",
      attribution: {
        interactionTarget: "x".repeat(150),
        interactionType: "pointer",
        inputDelay: 10.6,
        processingDuration: 300.2,
        presentationDelay: 40,
        loadState: "complete",
      },
    } as unknown as INPMetricWithAttribution
    const params = attributionParams(metric)
    expect(String(params.debug_target)).toHaveLength(100)
    expect(params).toMatchObject({
      debug_event: "pointer",
      debug_input_delay: 11,
      debug_processing: 300,
      debug_presentation: 40,
    })
  })

  it("drops the query string from the LCP resource URL", () => {
    const metric = {
      name: "LCP",
      attribution: {
        element: "img.MuiAvatar-img",
        url: "https://cdn.example/a.webp?token=secret",
        timeToFirstByte: 100,
        resourceLoadDelay: 200,
        resourceLoadDuration: 50,
        elementRenderDelay: 25,
      },
    } as unknown as LCPMetricWithAttribution
    expect(attributionParams(metric).debug_url).toBe(
      "https://cdn.example/a.webp",
    )
  })
})
