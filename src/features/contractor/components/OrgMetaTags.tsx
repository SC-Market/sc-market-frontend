import React from "react"
import { Helmet } from "@unhead/react/helmet"
import { Contractor } from "../domain/types"
import { FRONTEND_URL } from "../../../util/constants"
import { SHOP_PATHS } from "../../../routes/paths"
import { useGetShopsByOwnerQuery } from "../../../store/api/v2/market"

interface OrgMetaTagsProps {
  contractor: Contractor
}

export function OrgMetaTags({ contractor }: OrgMetaTagsProps) {
  const { data: shops } = useGetShopsByOwnerQuery({
    spectrumId: contractor.spectrum_id,
  })
  const shop = shops?.[0]
  const orgUrl = `${FRONTEND_URL}/contractor/${contractor.spectrum_id}`
  // "~"-prefixed spectrum IDs are not real RSI orgs (see OrgHeader)
  const sameAs = [
    ...(contractor.spectrum_id.startsWith("~")
      ? []
      : [`https://robertsspaceindustries.com/orgs/${contractor.spectrum_id}`]),
    ...(contractor.site_url ? [contractor.site_url] : []),
  ]

  return (
    <Helmet>
      <meta name="description" content={contractor.description?.slice(0, 160) || `${contractor.name} — Star Citizen organization on SC Market`} />
      <meta property="og:type" content="website" />
      <meta
        property="og:url"
        content={`${FRONTEND_URL}/contractor/${contractor.spectrum_id}`}
      />
      <meta property="og:title" content={`${contractor.name} - SC Market`} />
      <meta
        property="og:description"
        content={contractor.description || `${contractor.name} on SC Market`}
      />
      <meta
        property="og:image"
        content={contractor.banner || contractor.avatar}
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:url"
        content={`${FRONTEND_URL}/contractor/${contractor.spectrum_id}`}
      />
      <meta name="twitter:title" content={`${contractor.name} - SC Market`} />
      <meta
        name="twitter:description"
        content={contractor.description || `${contractor.name} on SC Market`}
      />
      <meta
        name="twitter:image"
        content={contractor.banner || contractor.avatar}
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${orgUrl}#organization`,
          name: contractor.name,
          description: contractor.description,
          url: orgUrl,
          image: contractor.banner || contractor.avatar,
          logo: contractor.avatar,
          sameAs: sameAs.length > 0 ? sameAs : undefined,
          numberOfEmployees: contractor.size
            ? { "@type": "QuantitativeValue", value: contractor.size }
            : undefined,
          knowsLanguage: contractor.languages?.length
            ? contractor.languages.map((l) => l.code)
            : undefined,
          knowsAbout: contractor.fields?.length ? contractor.fields : undefined,
          owns: shop
            ? {
                "@type": "Store",
                "@id": `${FRONTEND_URL}${SHOP_PATHS.profile(shop.slug)}#store`,
                name: shop.name,
                url: `${FRONTEND_URL}${SHOP_PATHS.profile(shop.slug)}`,
              }
            : undefined,
        })}
      </script>
    </Helmet>
  )
}
