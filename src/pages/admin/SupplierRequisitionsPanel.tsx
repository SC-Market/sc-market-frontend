import {
  Box,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../components/avatar/ImageAvatar"
import {
  AssignmentRounded,
  BoltRounded,
  OpenInNewRounded,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { RequisitionDetail } from "../../store/api/v2/market"
import {
  initials,
  avatarColor,
  REQ_STATUS_CHIP,
} from "./supplierDashboardShared"

// ---------------------------------------------------------------------------
// Requisitions Panel
// ---------------------------------------------------------------------------

export function RequisitionsPanel({ reqs }: { reqs: RequisitionDetail[] }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const urgent = reqs.filter((r) => r.status === "not-started")

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <AssignmentRounded sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="subtitle1" fontWeight={600}>
            {t("suppliersUi.dashboard.openRequisitions")}
          </Typography>
        </Stack>
        {urgent.length > 0 && (
          <Chip
            icon={<BoltRounded sx={{ fontSize: 14 }} />}
            label={t("suppliersUi.dashboard.needResponse", {
              count: urgent.length,
            })}
            size="small"
            color="warning"
          />
        )}
      </Box>

      {reqs.length === 0 ? (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t("suppliersUi.dashboard.noOpenRequisitions")}
          </Typography>
        </Box>
      ) : (
        <Stack divider={<Divider />}>
          {reqs.slice(0, 5).map((req) => {
            const sc =
              REQ_STATUS_CHIP[req.status] ?? REQ_STATUS_CHIP["not-started"]
            return (
              <Box
                key={req.order_id}
                sx={{
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
                onClick={() => navigate(`/requisitions/${req.order_id}`)}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <ImageAvatar
                    alt=""
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: 12,
                      bgcolor: avatarColor(req.buyer?.username ?? "?"),
                    }}
                  >
                    {initials(
                      req.buyer?.display_name ?? req.buyer?.username ?? "?",
                    )}
                  </ImageAvatar>
                  <Box flex={1} minWidth={0}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mb={0.25}
                    >
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {req.title}
                      </Typography>
                      <Chip
                        label={t(sc.label)}
                        size="small"
                        color={sc.color}
                        variant="outlined"
                        sx={{ fontSize: 10, height: 18 }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {t("suppliersUi.dashboard.fromBuyer", {
                        name: req.buyer?.display_name ?? req.buyer?.username,
                      })}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    aria-label={t("suppliersUi.dashboard.openRequisition")}
                  >
                    <OpenInNewRounded sx={{ fontSize: 14 }} />
                  </IconButton>
                </Stack>
              </Box>
            )
          })}
        </Stack>
      )}
    </Paper>
  )
}
