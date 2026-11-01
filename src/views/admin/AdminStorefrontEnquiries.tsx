import React, { useState } from "react"
import {
  Alert,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  useListStorefrontEnquiriesQuery,
  useUpdateStorefrontEnquiryMutation,
  type AdminStorefrontEnquiry,
  type EnquiryStatus,
} from "../../store/api/v2/market"
import { ORG_PATHS, SHOP_PATHS, USER_PATHS } from "../../routes/paths"
import { getErrorMessage } from "../../util/errorHandling"
import { useEnquiryStatusLabel } from "../../features/storefront/components/StorefrontEnquiryCard"
import { enquiryStatusColor } from "../../features/storefront/enquiry"

const STATUSES: EnquiryStatus[] = ["open", "in_progress", "completed", "declined"]
const PAGE_SIZE = 20

function EnquiryRow(props: { enquiry: AdminStorefrontEnquiry }) {
  const { enquiry: e } = props
  const { t } = useTranslation()
  const statusLabel = useEnquiryStatusLabel()
  const [status, setStatus] = useState<EnquiryStatus>(e.status)
  const [note, setNote] = useState(e.staff_note ?? "")
  const [update, state] = useUpdateStorefrontEnquiryMutation()
  const dirty = status !== e.status || note !== (e.staff_note ?? "")
  const targetPath = e.target_type === "org" ? ORG_PATHS.profile(e.target) : SHOP_PATHS.profile(e.target)

  return (
    <Paper variant="outlined" sx={{ p: 2 }} data-testid="admin-storefront-enquiry">
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="subtitle1" color="text.secondary">
            <MuiLink component={Link} to={targetPath}>
              {e.target_name || e.target}
            </MuiLink>
          </Typography>
          <Chip
            size="small"
            label={
              e.target_type === "org"
                ? t("admin.storefrontEnquiries.org", "Org")
                : t("admin.storefrontEnquiries.shop", "Shop")
            }
          />
          {e.is_test && <Chip size="small" color="warning" label={t("admin.storefrontEnquiries.test", "Test")} />}
          <Chip size="small" color={enquiryStatusColor(e.status)} label={statusLabel(e.status)} />
          <Typography variant="body2" color="text.primary">
            {new Date(e.created_at).toLocaleString()}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.primary">
          <strong>{t("admin.storefrontEnquiries.subdomain", "Subdomain")}:</strong>{" "}
          {e.requested_subdomain}.sc-market.space
        </Typography>
        <Typography variant="body2" color="text.primary">
          <strong>{t("admin.storefrontEnquiries.from", "From")}:</strong>{" "}
          {e.submitted_by_username ? (
            <MuiLink component={Link} to={USER_PATHS.profile(e.submitted_by_username)}>
              {e.submitted_by_username}
            </MuiLink>
          ) : (
            t("storefront.enquiry.deletedUser", "Deleted user")
          )}{" "}
          ·{" "}
          {e.contact_method === "discord"
            ? t("admin.storefrontEnquiries.viaDiscord", {
                handle: e.discord_username ?? e.discord_id ?? "?",
                defaultValue: "Discord: {{handle}}",
              })
            : t("admin.storefrontEnquiries.viaMessage", "Message on SC Market")}
        </Typography>
        {e.message && (
          <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {e.message}
          </Typography>
        )}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "flex-start" }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id={`enq-status-${e.enquiry_id}`}>{t("admin.storefrontEnquiries.status", "Status")}</InputLabel>
            <Select
              labelId={`enq-status-${e.enquiry_id}`}
              label={t("admin.storefrontEnquiries.status", "Status")}
              value={status}
              onChange={(ev) => setStatus(STATUSES.find((s) => s === ev.target.value) ?? status)}
            >
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {statusLabel(s)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label={t("admin.storefrontEnquiries.note", "Staff note")}
            value={note}
            onChange={(ev) => setNote(ev.target.value.slice(0, 1000))}
            multiline
            sx={{ flex: 1 }}
          />
          <LoadingButton
            variant="contained"
            color="secondary"
            disabled={!dirty}
            loading={state.isLoading}
            onClick={() =>
              void update({
                enquiryId: e.enquiry_id,
                updateStorefrontEnquiryRequest: { status, staff_note: note },
              })
            }
          >
            {t("admin.storefrontEnquiries.save", "Save")}
          </LoadingButton>
        </Stack>
        {state.isError && <Alert severity="error">{getErrorMessage(state.error)}</Alert>}
        {e.handled_by_username && (
          <Typography variant="caption" color="text.primary">
            {t("admin.storefrontEnquiries.handledBy", {
              user: e.handled_by_username,
              date: new Date(e.updated_at).toLocaleString(),
              defaultValue: "Last changed by {{user}}, {{date}}",
            })}
          </Typography>
        )}
      </Stack>
    </Paper>
  )
}

/**
 * Admin › Premium › Storefront enquiries: the branded storefront requests
 * orgs and shops sent from their settings, open ones first. Staff grant the
 * subdomain with Grant Premium below, then mark the enquiry done.
 */
export function AdminStorefrontEnquiries() {
  const { t } = useTranslation()
  const statusLabel = useEnquiryStatusLabel()
  const [filter, setFilter] = useState<EnquiryStatus | "all">("all")
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useListStorefrontEnquiriesQuery({
    status: filter === "all" ? undefined : filter,
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <Box id="storefront-enquiries" component="section" data-testid="admin-storefront-enquiries">
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
        <Typography variant="h6" component="h2" color="text.secondary">
          {t("admin.storefrontEnquiries.title", "Storefront enquiries")}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="enq-filter">{t("admin.storefrontEnquiries.filter", "Show")}</InputLabel>
          <Select
            labelId="enq-filter"
            label={t("admin.storefrontEnquiries.filter", "Show")}
            value={filter}
            onChange={(ev) => {
              setFilter(STATUSES.find((s) => s === ev.target.value) ?? "all")
              setPage(1)
            }}
          >
            <MenuItem value="all">{t("admin.storefrontEnquiries.all", "All")}</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {statusLabel(s)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      {isLoading ? (
        <Skeleton variant="rounded" height={160} />
      ) : isError || !data ? (
        <Alert severity="warning">{t("admin.storefrontEnquiries.loadFailed", "The enquiries couldn't be loaded.")}</Alert>
      ) : data.enquiries.length === 0 ? (
        <Typography color="text.primary">{t("admin.storefrontEnquiries.empty", "No enquiries.")}</Typography>
      ) : (
        <Stack spacing={1}>
          {data.enquiries.map((e) => (
            <EnquiryRow key={`${e.enquiry_id}-${e.updated_at}`} enquiry={e} />
          ))}
          {data.total > PAGE_SIZE && (
            <Pagination
              count={Math.ceil(data.total / PAGE_SIZE)}
              page={page}
              onChange={(_, p) => setPage(p)}
            />
          )}
        </Stack>
      )}
    </Box>
  )
}
