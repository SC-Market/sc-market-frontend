/**
 * Manual endpoint overrides for V2 market API.
 * These override auto-generated endpoints that can't handle multipart uploads.
 * Import this file AFTER the generated market.ts to apply overrides.
 */
import { generatedApiV2 } from "../../generatedApiV2"

export const marketV2Overrides = generatedApiV2.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    uploadPhotos: build.mutation<{ photos: string[] }, { id: string; photos: File[] }>({
      query: ({ id, photos }) => {
        const formData = new FormData()
        for (const file of photos) {
          formData.append("photos", file)
        }
        return {
          url: `/listings/${id}/photos`,
          method: "POST",
          body: formData,
        }
      },
    }),
  }),
})

export const { useUploadPhotosMutation } = marketV2Overrides
