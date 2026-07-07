import React from "react"
import { Helmet } from "react-helmet"
import { Contractor } from "../domain/types"
import { FRONTEND_URL } from "../../../util/constants"

interface OrgMetaTagsProps {
  contractor: Contractor
}

export function OrgMetaTags({ contractor }: OrgMetaTagsProps) {
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
          name: contractor.name,
          description: contractor.description,
          url: `${FRONTEND_URL}/contractor/${contractor.spectrum_id}`,
          image: contractor.banner || contractor.avatar,
          logo: contractor.avatar,
        })}
      </script>
    </Helmet>
  )
}
