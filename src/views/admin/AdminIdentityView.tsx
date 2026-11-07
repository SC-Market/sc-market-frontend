/**
 * Admin -> Identity: find an account by username, display name, Discord id,
 * Spectrum id or user id, see its identities, and fix identity conflicts.
 * Every change asks for a reason and a fresh two-factor code (the shared
 * baseQuery opens the code dialog on MFA_STEP_UP_REQUIRED and retries).
 * Linked identities never move: actions only remove or set a value on the
 * one account shown. See drafts/scmarket-identity-admin.md.
 */
import React, { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useSearchIdentityUsersQuery } from "../../store/api/v2/market"
import { describeMfaError } from "../../features/mfa/errors"
import { UserPanel } from "./IdentityUserPanel"
import { StatusChips } from "./IdentityStatusChips"

export function AdminIdentityView() {
  const { t } = useTranslation()
  // ?q= prefills and runs the search (the profile menu's "Open in Admin -> Identity").
  const [searchParams] = useSearchParams()
  const initial = (searchParams.get("q") ?? "").trim().slice(0, 100)
  const [input, setInput] = useState(initial)
  const [query, setQuery] = useState(initial.length >= 2 ? initial : "")
  const [selected, setSelected] = useState<string | null>(null)
  const { data, error, isFetching } = useSearchIdentityUsersQuery(
    { q: query },
    { skip: query.length < 2 },
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = input.trim()
    if (q.length < 2) return
    setSelected(null)
    setQuery(q)
  }

  return (
    <Stack spacing={3}>
      <Alert severity="info">
        {t(
          "adminIdentity.intro",
          "Find an account and fix identity conflicts. Linked identities never move between accounts: each action removes or sets a value on this account only. Every change needs a reason and a fresh two-factor code, is written to the audit log and notifies the user.",
        )}
      </Alert>

      <Paper sx={{ p: 2 }}>
        <Box component="form" onSubmit={submit} noValidate>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "flex-start" }}
          >
            <TextField
              fullWidth
              label={t(
                "adminIdentity.searchLabel",
                "Username, display name, Discord id, Spectrum id or user id",
              )}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 100))}
              inputProps={{
                "data-testid": "identity-search",
                autoComplete: "off",
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={input.trim().length < 2}
              sx={{ mt: { sm: 1 } }}
            >
              {t("adminIdentity.search", "Search")}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {error && <Alert severity="error">{describeMfaError(error, t)}</Alert>}

      {query.length >= 2 && (
        <Paper>
          <TableContainer>
            <Table
              size="small"
              aria-label={t("adminIdentity.results", "Search results")}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    {t("adminIdentity.columns.username", "Username")}
                  </TableCell>
                  <TableCell>
                    {t("adminIdentity.columns.displayName", "Display name")}
                  </TableCell>
                  <TableCell>
                    {t("adminIdentity.columns.discord", "Discord id")}
                  </TableCell>
                  <TableCell>
                    {t("adminIdentity.columns.spectrum", "Spectrum id")}
                  </TableCell>
                  <TableCell>
                    {t("adminIdentity.columns.status", "Status")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isFetching && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      {t("adminIdentity.loading", "Loading...")}
                    </TableCell>
                  </TableRow>
                )}
                {!isFetching && data?.users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      {t("adminIdentity.noResults", "No accounts match.")}
                    </TableCell>
                  </TableRow>
                )}
                {!isFetching &&
                  data?.users.map((u) => (
                    <TableRow
                      key={u.user_id}
                      hover
                      selected={u.user_id === selected}
                      onClick={() => setSelected(u.user_id)}
                      sx={{ cursor: "pointer" }}
                      data-testid={`identity-row-${u.user_id}`}
                    >
                      <TableCell sx={{ fontFamily: "monospace" }}>
                        <Button
                          size="small"
                          onClick={() => setSelected(u.user_id)}
                          sx={{ textTransform: "none", p: 0, minWidth: 0 }}
                        >
                          {u.username}
                        </Button>
                      </TableCell>
                      <TableCell>{u.display_name}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>
                        {u.discord_provider_id ?? u.discord_id_column ?? "-"}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>
                        {u.spectrum_user_id ?? "-"}
                      </TableCell>
                      <TableCell>
                        <StatusChips user={u} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {selected && <UserPanel key={selected} userId={selected} />}
    </Stack>
  )
}
