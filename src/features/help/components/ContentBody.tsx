import { Alert } from "@mui/material"
import { useTranslation } from "react-i18next"
import { Blocks } from "./ContentBlocks"
import { useSuspenseContentBody } from "../content"

/**
 * A guide's (or About's) text. Suspends until its chunk is in: render it in a
 * <Suspense> with the page's placeholder (see useSuspenseContentBody).
 */
export function ContentBody({ contentKey }: { contentKey: string }) {
  const { t } = useTranslation()
  const { body, error } = useSuspenseContentBody(contentKey)
  if (body) return <Blocks blocks={body.blocks} />
  if (error) {
    return (
      <Alert severity="error">
        {t(
          "help.loadFailed",
          "This guide failed to load. Refresh the page to try again.",
        )}
      </Alert>
    )
  }
  return null
}
