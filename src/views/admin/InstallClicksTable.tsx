import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { type DiscordInstallClickCount } from "../../store/api/v2/market"

/** Clicks on "Add SC Market to Discord" links, per install type and surface. */
export function InstallClicksTable({
  clicks,
}: {
  clicks: DiscordInstallClickCount[]
}) {
  const { t } = useTranslation()
  const typeLabel = (type: DiscordInstallClickCount["install_type"]) =>
    type === "user"
      ? t("adminUi.sellerReachability.installClicks.user", "Your account")
      : t("adminUi.sellerReachability.installClicks.server", "A server")
  return (
    <Box sx={{ mt: 2 }} data-testid="reachability-install-clicks">
      <Typography variant="subtitle2" component="h3" color="text.secondary">
        {t(
          "adminUi.sellerReachability.installClicks.title",
          '"Add SC Market to Discord" clicks',
        )}
      </Typography>
      {clicks.length === 0 ? (
        <Typography variant="body2" color="text.primary">
          {t("adminUi.sellerReachability.installClicks.none", "No clicks yet.")}
        </Typography>
      ) : (
        <TableContainer>
          <Table
            size="small"
            aria-label={t(
              "adminUi.sellerReachability.installClicks.title",
              '"Add SC Market to Discord" clicks',
            )}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  {t(
                    "adminUi.sellerReachability.installClicks.type",
                    "Install to",
                  )}
                </TableCell>
                <TableCell>
                  {t("adminUi.sellerReachability.installClicks.src", "Where")}
                </TableCell>
                <TableCell align="right">
                  {t(
                    "adminUi.sellerReachability.installClicks.days7",
                    "Last 7 days",
                  )}
                </TableCell>
                <TableCell align="right">
                  {t(
                    "adminUi.sellerReachability.installClicks.days30",
                    "Last 30 days",
                  )}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clicks.map((c) => (
                <TableRow key={`${c.install_type}:${c.src}`}>
                  <TableCell>{typeLabel(c.install_type)}</TableCell>
                  <TableCell>
                    {t(
                      `adminUi.sellerReachability.installClicks.sources.${c.src}`,
                      c.src,
                    )}
                  </TableCell>
                  <TableCell align="right">{c.clicks_7d}</TableCell>
                  <TableCell align="right">{c.clicks_30d}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
