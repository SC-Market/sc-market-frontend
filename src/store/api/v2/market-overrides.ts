/**
 * Manual endpoint overrides for V2 market API.
 * These override auto-generated endpoints that can't handle multipart uploads.
 * Import this file AFTER the generated market.ts to apply overrides.
 */
import { marketV2Api } from "./market"

export const marketV2Overrides = marketV2Api.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    uploadPhotos: build.mutation<
      { photos: string[] },
      { id: string; photos: File[] }
    >({
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
    uploadImage: build.mutation<{ resource_id: string; url: string }, File>({
      query: (file) => {
        const formData = new FormData()
        formData.append("photo", file)
        return {
          url: `/images/upload`,
          method: "POST",
          body: formData,
        }
      },
    }),
  }),
})

export const { useUploadPhotosMutation, useUploadImageMutation } =
  marketV2Overrides
