/**
 * Manual endpoint overrides for V2 market API.
 * These override auto-generated endpoints that can't handle multipart uploads.
 * Import this file AFTER the generated market.ts to apply overrides.
 */
import { marketV2Api } from "./market"

export interface UexImportPreviewItem {
  title: string
  price: number
  quantity: number
  quality?: number
  source?: string
}

export interface UexImportRequest {
  uex_username: string
  shop_id: string
  listings?: Array<{
    title: string
    description: string
    price: number
    quantity: number
    quality?: number
    durability?: number
    location?: string
    source?: string
  }>
  confirm?: boolean
}

export interface UexImportResponse {
  preview?: UexImportPreviewItem[]
  imported?: number
  total?: number
}

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
    importFromUex: build.mutation<UexImportResponse, UexImportRequest>({
      query: (body) => ({
        url: "/listings/import-uex",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Listings V2"],
    }),
  }),
})

export const {
  useUploadPhotosMutation,
  useUploadImageMutation,
  useImportFromUexMutation,
} = marketV2Overrides
