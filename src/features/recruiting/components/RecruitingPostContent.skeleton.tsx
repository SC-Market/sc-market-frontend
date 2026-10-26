import React from "react"
import { PageBusy } from "../../../components/metadata/PageReady"
import { RecruitingPostBodySkeleton } from "../../../components/skeletons/RecruitingPageSkeletons"

/** The post page's body while the post (or its content chunk) loads. */
export function RecruitingPostContentSkeleton() {
  return (
    <>
      <PageBusy />
      <RecruitingPostBodySkeleton />
    </>
  )
}
