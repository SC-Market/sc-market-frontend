import React from "react"
import { useNavigate } from "react-router-dom"
import { WorkOutlineOutlined } from "@mui/icons-material"
import { EmptyState, EmptyStateProps } from "./EmptyState"
import { useTranslation } from "react-i18next"

export interface EmptyRecruitingProps extends Omit<
  EmptyStateProps,
  "title" | "icon" | "action"
> {
  /**
   * Whether this is a search result (vs. a general empty state)
   */
  isSearchResult?: boolean
  /**
   * Custom title override
   */
  title?: string
  /**
   * Custom description override
   */
  description?: string
  /**
   * Whether to show the create post action
   */
  showCreateAction?: boolean
  /**
   * Custom action override
   */
  action?: EmptyStateProps["action"]
}

/**
 * Empty state component for recruiting posts
 *
 * Displays when there are no recruiting posts, with option to create one
 */
export function EmptyRecruiting({
  isSearchResult = false,
  title,
  description,
  showCreateAction = true,
  action,
  ...props
}: EmptyRecruitingProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const defaultTitle = isSearchResult
    ? t("emptyStates.recruiting.noSearchResults", {
        defaultValue: "No recruiting posts found",
      })
    : t("emptyStates.recruiting.noPosts", {
        defaultValue: "No recruiting posts yet",
      })

  const defaultDescription = isSearchResult
    ? t("emptyStates.recruiting.noSearchResultsDescription", {
        defaultValue: "Try adjusting your search filters",
      })
    : t("emptyStates.recruiting.noPostsDescription", {
        defaultValue: "Be the first to post a recruiting opportunity",
      })

  const defaultAction = showCreateAction
    ? {
        label: t("emptyStates.recruiting.createPost", {
          defaultValue: "Create Post",
        }),
        onClick: () => navigate("/recruiting/post/create"),
        variant: "contained" as const,
      }
    : undefined

  return (
    <EmptyState
      title={title || defaultTitle}
      description={description || defaultDescription}
      icon={<WorkOutlineOutlined />}
      action={action || defaultAction}
      {...props}
    />
  )
}
