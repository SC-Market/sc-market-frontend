import { useTranslation } from "react-i18next"
import React from "react"
import { Typography, TypographyProps } from "@mui/material"
import { missionTextParts } from "../../seo/missionText"

/**
 * A placeholder the game fills in at runtime ("Location", "Target Name"):
 * readable words, set apart by colour and italics.
 */
const placeholderSx = { color: "secondary.main", fontStyle: "italic" } as const

function Parts({
  text,
  giver,
}: {
  text: string | null | undefined
  giver?: string | null
}) {
  return (
    <>
      {missionTextParts(text, giver).map((part, i) =>
        part.placeholder ? (
          <Typography key={i} component="span" sx={placeholderSx}>
            {part.text}
          </Typography>
        ) : (
          <React.Fragment key={i}>{part.text}</React.Fragment>
        ),
      )}
    </>
  )
}

/**
 * A mission name with the game's placeholders (~mission(...), [LOCATION])
 * as readable words (src/seo/missionText.ts, shared with the page head).
 */
export function MissionName({
  name,
  giver,
  ...props
}: { name: string | null | undefined; giver?: string | null } & Omit<
  TypographyProps,
  "children"
>) {
  const { t } = useTranslation()
  if (!name)
    return <Typography {...props}>{t("missionsUi.unknownMission")}</Typography>
  return (
    <Typography {...props}>
      <Parts text={name} giver={giver} />
    </Typography>
  )
}

/** Mission description text, placeholders as in MissionName. */
export function MissionDescription({
  text,
  giver,
  ...props
}: { text: string | null | undefined; giver?: string | null } & Omit<
  TypographyProps,
  "children"
>) {
  if (!text) return null
  return (
    <Typography {...props}>
      <Parts text={text} giver={giver} />
    </Typography>
  )
}
