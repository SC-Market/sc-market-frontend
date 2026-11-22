/**
 * The account's linked logins, active sessions and recent identity changes
 * (Admin -> Identity). Tables on desktop, stacked rows on phones.
 */
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { type IdentityDetail } from "../../store/api/v2/market"
import { useFormatters } from "../../util/format"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { kindLabel } from "./identityShared"
import { formatDate } from "./IdentityStatusChips"
import {
  StackedRow,
  StackedRows,
  StackedRowsMessage,
} from "./IdentityStackedRows"

export function IdentityRecords(props: { user: IdentityDetail }) {
  const { user } = props
  const { t } = useTranslation()
  const fmt = useFormatters()
  const isMobile = useIsMobile()
  return (
    <>
      <Typography variant="subtitle1" color="text.secondary">
        {t("adminIdentity.detail.providers", "Linked logins")}
      </Typography>
      {isMobile ? (
        <StackedRows
          aria-label={t("adminIdentity.detail.providers", "Linked logins")}
        >
          {user.providers.length === 0 && (
            <StackedRowsMessage>
              {t("adminIdentity.detail.noProviders", "No linked logins.")}
            </StackedRowsMessage>
          )}
          {user.providers.map((p) => (
            <StackedRow
              key={p.provider_type}
              title={
                p.is_primary
                  ? `${p.provider_type} (${t("adminIdentity.detail.primary", "primary")})`
                  : p.provider_type
              }
              fields={[
                {
                  label: t("adminIdentity.detail.providerId", "Id"),
                  value: p.provider_id,
                  mono: true,
                  wide: true,
                },
                {
                  label: t(
                    "adminIdentity.detail.providerUsername",
                    "Name at link time",
                  ),
                  value: p.provider_username ?? "-",
                  wide: true,
                },
                {
                  label: t("adminIdentity.detail.linkedAt", "Linked"),
                  value: formatDate(p.linked_at, fmt),
                },
                {
                  label: t("adminIdentity.detail.lastUsed", "Last login"),
                  value: formatDate(p.last_used_at, fmt),
                },
              ]}
            />
          ))}
        </StackedRows>
      ) : (
        <TableContainer>
          <Table
            size="small"
            aria-label={t("adminIdentity.detail.providers", "Linked logins")}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  {t("adminIdentity.detail.providerType", "Provider")}
                </TableCell>
                <TableCell>
                  {t("adminIdentity.detail.providerId", "Id")}
                </TableCell>
                <TableCell>
                  {t(
                    "adminIdentity.detail.providerUsername",
                    "Name at link time",
                  )}
                </TableCell>
                <TableCell>
                  {t("adminIdentity.detail.linkedAt", "Linked")}
                </TableCell>
                <TableCell>
                  {t("adminIdentity.detail.lastUsed", "Last login")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user.providers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    {t("adminIdentity.detail.noProviders", "No linked logins.")}
                  </TableCell>
                </TableRow>
              )}
              {user.providers.map((p) => (
                <TableRow key={p.provider_type}>
                  <TableCell>
                    {p.provider_type}
                    {p.is_primary &&
                      ` (${t("adminIdentity.detail.primary", "primary")})`}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>
                    {p.provider_id}
                  </TableCell>
                  <TableCell>{p.provider_username ?? "-"}</TableCell>
                  <TableCell>{formatDate(p.linked_at, fmt)}</TableCell>
                  <TableCell>{formatDate(p.last_used_at, fmt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="subtitle1" color="text.secondary">
        {t("adminIdentity.detail.sessions", "Active sessions")}
      </Typography>
      {user.sessions.length === 0 ? (
        <Typography variant="body2" color="text.primary">
          {t("adminIdentity.detail.noSessions", "No active sessions.")}
        </Typography>
      ) : isMobile ? (
        <StackedRows
          aria-label={t("adminIdentity.detail.sessions", "Active sessions")}
        >
          {user.sessions.map((s) => (
            <StackedRow
              key={`${s.refreshed_at}-${s.expires_at}`}
              fields={[
                {
                  label: t(
                    "adminIdentity.detail.sessionRefreshed",
                    "Last refreshed",
                  ),
                  value: formatDate(s.refreshed_at, fmt),
                },
                {
                  label: t("adminIdentity.detail.sessionExpires", "Expires"),
                  value: formatDate(s.expires_at, fmt),
                },
                {
                  label: t("adminIdentity.detail.sessionAgent", "Browser"),
                  value: s.user_agent ?? "-",
                  wide: true,
                },
              ]}
            />
          ))}
        </StackedRows>
      ) : (
        <TableContainer>
          <Table
            size="small"
            aria-label={t("adminIdentity.detail.sessions", "Active sessions")}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  {t("adminIdentity.detail.sessionRefreshed", "Last refreshed")}
                </TableCell>
                <TableCell>
                  {t("adminIdentity.detail.sessionExpires", "Expires")}
                </TableCell>
                <TableCell>
                  {t("adminIdentity.detail.sessionAgent", "Browser")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user.sessions.map((s) => (
                <TableRow key={`${s.refreshed_at}-${s.expires_at}`}>
                  <TableCell>{formatDate(s.refreshed_at, fmt)}</TableCell>
                  <TableCell>{formatDate(s.expires_at, fmt)}</TableCell>
                  <TableCell sx={{ wordBreak: "break-all" }}>
                    {s.user_agent ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="subtitle1" color="text.secondary">
        {t("adminIdentity.detail.recent", "Recent identity changes")}
      </Typography>
      {user.recent_actions.length === 0 ? (
        <Typography variant="body2" color="text.primary">
          {t("adminIdentity.detail.noRecent", "None.")}
        </Typography>
      ) : isMobile ? (
        <StackedRows
          aria-label={t(
            "adminIdentity.detail.recent",
            "Recent identity changes",
          )}
        >
          {user.recent_actions.map((a) => (
            <StackedRow
              key={a.audit_log_id}
              title={kindLabel(a.kind, t)}
              fields={[
                {
                  label: t("adminIdentity.detail.when", "When"),
                  value: formatDate(a.created_at, fmt),
                },
                {
                  label: t("adminIdentity.detail.by", "By"),
                  value: a.actor_username ?? "-",
                },
                {
                  label: t("adminIdentity.dialog.reason", "Reason"),
                  value: a.reason ?? "-",
                  wide: true,
                },
              ]}
            />
          ))}
        </StackedRows>
      ) : (
        <TableContainer>
          <Table
            size="small"
            aria-label={t(
              "adminIdentity.detail.recent",
              "Recent identity changes",
            )}
          >
            <TableHead>
              <TableRow>
                <TableCell>{t("adminIdentity.detail.when", "When")}</TableCell>
                <TableCell>
                  {t("adminIdentity.detail.change", "Change")}
                </TableCell>
                <TableCell>{t("adminIdentity.detail.by", "By")}</TableCell>
                <TableCell>
                  {t("adminIdentity.dialog.reason", "Reason")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user.recent_actions.map((a) => (
                <TableRow key={a.audit_log_id}>
                  <TableCell>{formatDate(a.created_at, fmt)}</TableCell>
                  <TableCell>{kindLabel(a.kind, t)}</TableCell>
                  <TableCell>{a.actor_username ?? "-"}</TableCell>
                  <TableCell sx={{ whiteSpace: "pre-wrap" }}>
                    {a.reason ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}
