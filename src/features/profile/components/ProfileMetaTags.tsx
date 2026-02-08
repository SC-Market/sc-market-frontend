import React from "react"
import { Helmet } from "react-helmet"
import { User } from "../../../datatypes/User"
import { FRONTEND_URL } from "../../../util/constants"

interface ProfileMetaTagsProps {
  profile: User
}

export function ProfileMetaTags({ profile }: ProfileMetaTagsProps) {
  return (
    <Helmet>
      <meta property="og:type" content="profile" />
      <meta
        property="og:url"
        content={`${FRONTEND_URL}/people/${profile.username}`}
      />
      <meta
        property="og:title"
        content={`${profile.display_name} - SC Market`}
      />
      <meta
        property="og:description"
        content={
          profile.profile_description ||
          `${profile.display_name}'s profile on SC Market`
        }
      />
      <meta property="og:image" content={profile.banner || profile.avatar} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:url"
        content={`${FRONTEND_URL}/people/${profile.username}`}
      />
      <meta
        name="twitter:title"
        content={`${profile.display_name} - SC Market`}
      />
      <meta
        name="twitter:description"
        content={
          profile.profile_description ||
          `${profile.display_name}'s profile on SC Market`
        }
      />
      <meta name="twitter:image" content={profile.banner || profile.avatar} />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Contractor",
          description: profile.profile_description,
          name: profile.display_name,
          username: profile.username,
          avatar_url: profile.avatar,
          banner_url: profile.banner,
        })}
      </script>
    </Helmet>
  )
}
