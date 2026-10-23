import React from "react"
import { User } from "../../../datatypes/User"
import { FRONTEND_URL } from "../../../util/constants"
import { buildUserHead } from "../../../seo/entityHeads"
import { SeoHead } from "../../../seo/SeoHead"

interface ProfileMetaTagsProps {
  profile: User
}

export function ProfileMetaTags({ profile }: ProfileMetaTagsProps) {
  return <SeoHead head={buildUserHead(profile, FRONTEND_URL)} />
}
