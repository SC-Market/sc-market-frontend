import { useState } from "react"
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useGetIdentityUserQuery,
  type IdentityActionKind,
} from "../../store/api/v2/market"
import { describeMfaError } from "../../features/mfa/errors"
import { isSiteAdmin } from "../../util/siteRole"
import { useFormatters } from "../../util/format"
import { kindLabel } from "./identityShared"
import { ActionDialog, ActionId } from "./IdentityActionDialog"
import { StatusChips, Field, formatDate } from "./IdentityStatusChips"
import { IdentityRecords } from "./IdentityRecords"

export function UserPanel(props: { userId: string }) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const {
    data: user,
    error,
    isLoading,
  } = useGetIdentityUserQuery({ userId: props.userId })
  const [action, setAction] = useState<ActionId | null>(null)
  const [done, setDone] = useState<IdentityActionKind | null>(null)

  if (isLoading)
    return (
      <Typography color="text.secondary">
        {t("adminIdentity.loading", "Loading...")}
      </Typography>
    )
  if (error) return <Alert severity="error">{describeMfaError(error, t)}</Alert>
  if (!user) return null

  const locked = user.is_tombstone || user.is_test || isSiteAdmin(user)
  const hasDiscord =
    user.discord_provider_id !== null || user.discord_id_column !== null

  return (
    <Paper sx={{ p: { xs: 1.5, sm: 2 } }} data-testid="identity-user-panel">
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ overflowWrap: "anywhere" }}
          >
            {user.username}
          </Typography>
          <StatusChips user={user} />
        </Stack>
        {done && (
          <Alert severity="success" onClose={() => setDone(null)}>
            {t(
              "adminIdentity.done",
              "{{action}}: saved, audited and the user was notified.",
              { action: kindLabel(done, t) },
            )}
          </Alert>
        )}
        {locked && (
          <Alert severity="info">
            {t(
              "adminIdentity.locked",
              "Deleted accounts, test accounts and site admins can't be changed here.",
            )}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            },
            gap: 2,
          }}
        >
          <Field
            label={t("adminIdentity.detail.userId", "User id")}
            value={user.user_id}
          />
          <Field
            label={t("adminIdentity.detail.displayName", "Display name")}
            value={user.display_name}
          />
          <Field
            label={t("adminIdentity.detail.role", "Role")}
            value={user.role}
          />
          <Field
            label={t("adminIdentity.detail.spectrumId", "Spectrum id")}
            value={user.spectrum_user_id ?? "-"}
          />
          <Field
            label={t("adminIdentity.detail.discord", "Discord (linked)")}
            value={user.discord_provider_id ?? "-"}
            testId="identity-discord"
          />
          <Field
            label={t(
              "adminIdentity.detail.discordColumn",
              "Discord (legacy column)",
            )}
            value={
              user.discord_column_stale
                ? t(
                    "adminIdentity.detail.discordColumnStale",
                    "{{id}} (stale: no matching link)",
                    { id: user.discord_id_column },
                  )
                : (user.discord_id_column ?? "-")
            }
          />
          <Field
            label={t("adminIdentity.detail.created", "Created")}
            value={formatDate(user.created_at, fmt)}
          />
          <Field
            label={t("adminIdentity.detail.deletedAt", "Deletion requested")}
            value={formatDate(user.deleted_at, fmt)}
          />
          <Field
            label={t(
              "adminIdentity.detail.deletionScheduled",
              "Deletion scheduled",
            )}
            value={formatDate(user.deletion_scheduled_at, fmt)}
          />
        </Box>

        {user.username_twins.length > 0 && (
          <Alert severity="warning" sx={{ overflowWrap: "anywhere" }}>
            {t(
              "adminIdentity.detail.twins",
              "Other accounts with this username in a different case: {{names}}",
              {
                names: user.username_twins.map((tw) => tw.username).join(", "),
              },
            )}
          </Alert>
        )}

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ "& > .MuiButton-root": { flexGrow: { xs: 1, md: 0 } } }}
        >
          <Button
            variant="outlined"
            disabled={locked}
            onClick={() => setAction("release")}
          >
            {t("adminIdentity.actions.releaseUsername", "Release username")}
          </Button>
          <Button
            variant="outlined"
            disabled={locked || !hasDiscord}
            onClick={() => setAction("unlinkDiscord")}
          >
            {t("adminIdentity.actions.unlinkDiscord", "Unlink Discord")}
          </Button>
          <Button
            variant="outlined"
            disabled={locked}
            onClick={() => setAction("spectrum")}
          >
            {t("adminIdentity.actions.fixSpectrum", "Fix Spectrum link")}
          </Button>
          {user.banned ? (
            <Button
              variant="outlined"
              disabled={locked}
              onClick={() => setAction("reactivate")}
            >
              {t("adminIdentity.actions.reactivate", "Reactivate account")}
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="error"
              disabled={locked}
              onClick={() => setAction("deactivate")}
            >
              {t("adminIdentity.actions.deactivate", "Deactivate account")}
            </Button>
          )}
        </Stack>

        <IdentityRecords user={user} />
      </Stack>
      <ActionDialog
        action={action}
        user={user}
        onClose={() => setAction(null)}
        onDone={setDone}
      />
    </Paper>
  )
}
