import React from "react"
import { Helmet } from "react-helmet"
import { RecruitingPost } from "../api/recruitingApi"
import { RecruitingPostView } from "../../../views/recruiting/RecruitingPostView"
import { PostCommentArea } from "./PostCommentArea"
import { Comment } from "../api/recruitingApi"
import { FRONTEND_URL } from "../../../util/constants"

interface RecruitingPostContentProps {
  post: RecruitingPost
  comments: Comment[]
}

export function RecruitingPostContent(props: RecruitingPostContentProps) {
  const { post, comments } = props

  const seoDescription = `Join ${post.contractor?.name || "an organization"} in Star Citizen.${post.body ? ` ${post.body.slice(0, 120)}` : ""}`
  const seoImage = post.contractor?.banner || post.contractor?.avatar || ""
  const canonicalUrl = `${FRONTEND_URL}/recruiting/post/${post.post_id}`

  return (
    <>
      <Helmet>
        <title>{post.title} — Star Citizen Recruiting | SC Market</title>
        <meta name="description" content={seoDescription.slice(0, 160)} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${post.title} — Star Citizen Recruiting | SC Market`} />
        <meta property="og:description" content={seoDescription.slice(0, 160)} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} — Star Citizen Recruiting | SC Market`} />
        <meta name="twitter:description" content={seoDescription.slice(0, 160)} />
        <meta name="twitter:image" content={seoImage} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: post.title,
            description: post.body,
            datePosted: post.timestamp
              ? new Date(post.timestamp).toISOString()
              : undefined,
            hiringOrganization: {
              "@type": "Organization",
              name: post.contractor?.name,
              url: post.contractor?.spectrum_id
                ? `${FRONTEND_URL}/contractor/${post.contractor.spectrum_id}`
                : undefined,
            },
            jobLocationType: "TELECOMMUTE",
          })}
        </script>
      </Helmet>
      <RecruitingPostView post={post} />
      <PostCommentArea post={post} comments={comments} />
    </>
  )
}
