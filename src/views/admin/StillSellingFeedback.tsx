import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  type StillSellingFeedbackGroup,
  type StillSellingFeedbackSummary,
} from "../../store/api/v2/market"
import { useFormatters } from "../../util/format"

export const REASONS = [
  "not_playing",
  "waiting_patch",
  "not_enough_buyers",
  "selling_elsewhere",
  "too_much_work",
  "about_sc_market",
  "other",
] as const

export function FeedbackGroup({
  group,
  testid,
}: {
  group: StillSellingFeedbackGroup
  testid: string
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const fieldLabel = (f: string) =>
    ({
      about_sc_market: t(
        "stillSellingPage.feedback.reasons.about_sc_market",
        "Something about SC Market",
      ),
      other: t("stillSellingPage.feedback.reasons.other", "Other"),
      easier: t(
        "adminUi.stillSelling.feedback.easier",
        "Would make selling easier",
      ),
    })[f] ?? f
  return (
    <Box data-testid={testid}>
      <Table size="small">
        <TableBody>
          {REASONS.map((r) => (
            <TableRow key={r}>
              <TableCell>
                {t(`stillSellingPage.feedback.reasons.${r}`)}
              </TableCell>
              <TableCell align="right">{group.reasons[r]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {group.texts.length > 0 && (
        <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2.5 }}>
          {group.texts.map((x, i) => (
            <Typography component="li" variant="body2" key={i}>
              {fmt.date(x.created_at)} · {x.display_name} ·{" "}
              {fieldLabel(x.field)}: {x.text}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  )
}

/** Feedback from the landing page; answers from test links shown apart. */
export function FeedbackSection({
  feedback,
}: {
  feedback: StillSellingFeedbackSummary
}) {
  const { t } = useTranslation()
  return (
    <Box>
      <Typography variant="subtitle2">
        {t("adminUi.stillSelling.feedback.title", {
          count: feedback.real.responses,
        })}
      </Typography>
      <FeedbackGroup
        group={feedback.real}
        testid="still-selling-feedback-real"
      />
      {feedback.test.responses > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t("adminUi.stillSelling.feedback.testTitle", {
              count: feedback.test.responses,
            })}
          </Typography>
          <FeedbackGroup
            group={feedback.test}
            testid="still-selling-feedback-test"
          />
        </Box>
      )}
    </Box>
  )
}
