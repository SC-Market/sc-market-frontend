/**
 * Storefront enquiries: sending one (org or shop settings) and the staff
 * update of one (Admin › Premium). Errors are shown from the returned state.
 */
import { useCallback } from "react"
import {
  useCreateStorefrontEnquiryMutation,
  useUpdateStorefrontEnquiryMutation,
  type CreateStorefrontEnquiryRequest,
  type EnquiryStatus,
} from "../../../store/api/v2/market"

/** Send an enquiry. Resolves to whether it was sent. */
export function useCreateStorefrontEnquiry() {
  const [create, state] = useCreateStorefrontEnquiryMutation()
  const send = useCallback(
    async (request: CreateStorefrontEnquiryRequest): Promise<boolean> => {
      try {
        await create({ createStorefrontEnquiryRequest: request }).unwrap()
        return true
      } catch {
        // Shown from state.error.
        return false
      }
    },
    [create],
  )
  return { send, state }
}

/** Staff: set an enquiry's status and note. */
export function useUpdateStorefrontEnquiry(enquiryId: string) {
  const [update, state] = useUpdateStorefrontEnquiryMutation()
  const save = useCallback(
    (status: EnquiryStatus, staffNote: string) => {
      void update({
        enquiryId,
        updateStorefrontEnquiryRequest: { status, staff_note: staffNote },
      })
    },
    [update, enquiryId],
  )
  return { save, state }
}
