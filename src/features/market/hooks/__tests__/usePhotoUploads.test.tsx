import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../../../store/api/v2/market-overrides", () => ({ useUploadImageMutation: vi.fn() }))

import * as overrides from "../../../../store/api/v2/market-overrides"
import { usePhotoUploads } from "../usePhotoUploads"

type UploadHook = ReturnType<typeof overrides.useUploadImageMutation>
const uploadImage = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(overrides.useUploadImageMutation).mockReturnValue([uploadImage] as unknown as UploadHook)
})

const file = (name: string) => new File(["x"], name, { type: "image/png" })

describe("usePhotoUploads", () => {
  it("tracks each upload until it is done or failed", async () => {
    uploadImage
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({ resource_id: "r1", url: "https://img/1" }) })
      .mockReturnValueOnce({ unwrap: () => Promise.reject({ data: { error: { message: "Too big" } } }) })
    const { result } = renderHook(() => usePhotoUploads("Upload failed"))
    act(() => result.current.upload([file("a.png"), file("b.png")]))
    expect(result.current.isUploading).toBe(true)
    await waitFor(() => expect(result.current.isUploading).toBe(false))
    expect(result.current.photoResourceIds).toEqual(["r1"])
    expect(result.current.uploadedImages.map((i) => [i.status, i.error])).toEqual([
      ["success", undefined],
      ["error", "Too big"],
    ])
  })

  it("falls back to the given message, and remove/reset clear photos", async () => {
    uploadImage.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error("offline")) })
    const { result } = renderHook(() => usePhotoUploads("Upload failed"))
    act(() => result.current.upload([file("a.png")]))
    await waitFor(() => expect(result.current.uploadedImages[0]?.status).toBe("error"))
    expect(result.current.uploadedImages[0].error).toBe("Upload failed")
    act(() => result.current.remove(result.current.uploadedImages[0].resource_id))
    expect(result.current.uploadedImages).toEqual([])
    act(() => result.current.reset())
    expect(result.current.photoResourceIds).toEqual([])
  })
})
