import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  type StillSellingLocale,
  type StillSellingProgress,
  type StillSellingSampleMessage,
} from "../../store/api/v2/market"

const LOCALES: StillSellingLocale[] = [
  "en",
  "de",
  "es",
  "fr",
  "ja",
  "uk",
  "zh-CN",
  "zh-TW",
]

/** The sample DM (fake data) in the chosen language. */
export function StillSellingSamplePreview({
  sample,
  locale,
  setLocale,
}: {
  sample: StillSellingSampleMessage
  locale: StillSellingLocale
  setLocale: (locale: StillSellingLocale) => void
}) {
  const { t } = useTranslation()
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 1 }}
      >
        <Typography variant="subtitle2">
          {t(
            "adminUi.stillSelling.sample",
            "Sample DM (fake data: 3 listings, 2 months)",
          )}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="still-selling-locale">
            {t("adminUi.stillSelling.sampleLocale", "Language")}
          </InputLabel>
          <Select
            labelId="still-selling-locale"
            label={t("adminUi.stillSelling.sampleLocale", "Language")}
            value={locale}
            onChange={(e) => setLocale(e.target.value as StillSellingLocale)}
          >
            {LOCALES.map((l) => (
              <MenuItem key={l} value={l}>
                {l}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Typography
        variant="body2"
        sx={{ mb: 1 }}
        data-testid="still-selling-sample-text"
      >
        {sample.text}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {sample.buttons.map((b) => (
          <Button
            key={b.label}
            size="small"
            variant="outlined"
            disabled
            title={b.url}
          >
            {b.label}
          </Button>
        ))}
      </Stack>
    </Paper>
  )
}

/** Send/delivery/click counts for the campaign so far. */
export function StillSellingProgressTable({
  progress,
}: {
  progress: StillSellingProgress
}) {
  const { t } = useTranslation()
  return (
    <TableContainer>
      <Table size="small" data-testid="still-selling-progress">
        <TableHead>
          <TableRow>
            <TableCell align="right">
              {t("adminUi.stillSelling.progress.sent", "Sent")}
            </TableCell>
            <TableCell align="right">
              {t("adminUi.stillSelling.progress.delivered", "Delivered")}
            </TableCell>
            <TableCell align="right">
              {t(
                "adminUi.stillSelling.progress.failedClosed",
                "Failed (closed)",
              )}
            </TableCell>
            <TableCell align="right">
              {t("adminUi.stillSelling.progress.failedOther", "Failed (other)")}
            </TableCell>
            <TableCell align="right">
              {t("adminUi.stillSelling.progress.clickedKeep", "Clicked keep")}
            </TableCell>
            <TableCell align="right">
              {t("adminUi.stillSelling.progress.clickedPause", "Clicked pause")}
            </TableCell>
            <TableCell align="right">
              {t(
                "adminUi.stillSelling.progress.listings",
                "Listings kept · paused",
              )}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell align="right">{progress.sent}</TableCell>
            <TableCell align="right">{progress.delivered}</TableCell>
            <TableCell align="right">{progress.failed_closed}</TableCell>
            <TableCell align="right">
              {progress.failed - progress.failed_closed}
            </TableCell>
            <TableCell align="right">{progress.clicked_keep}</TableCell>
            <TableCell align="right">{progress.clicked_pause}</TableCell>
            <TableCell align="right">
              {progress.kept_listings} · {progress.paused_listings}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
