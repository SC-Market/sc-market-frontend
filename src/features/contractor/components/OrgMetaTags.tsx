import React from "react"
import { Contractor } from "../domain/types"
import { FRONTEND_URL } from "../../../util/constants"
import { useGetShopsByOwnerQuery } from "../../../store/api/v2/market"
import { buildOrgHead } from "../../../seo/entityHeads"
import { SeoHead } from "../../../seo/SeoHead"

interface OrgMetaTagsProps {
  contractor: Contractor
}

export function OrgMetaTags({ contractor }: OrgMetaTagsProps) {
  const { data: shops } = useGetShopsByOwnerQuery({
    spectrumId: contractor.spectrum_id,
  })

  return <SeoHead head={buildOrgHead(contractor, shops?.[0], FRONTEND_URL)} />
}
