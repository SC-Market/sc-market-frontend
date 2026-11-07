import {
  Box,
  Chip,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../components/avatar/ImageAvatar"
import {
  DeleteRounded,
  EditRounded,
  PersonRounded,
  BusinessRounded,
} from "@mui/icons-material"
import type { SupplierRelationship } from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"
import { useFormatters } from "../../util/format"
import {
  TIER_COLORS,
  TIER_LABEL_KEYS,
  STATUS_LABEL_KEYS,
  STATUS_COLORS,
} from "./supplierRosterLabels"

// ---------------------------------------------------------------------------
// Supplier Table Row
// ---------------------------------------------------------------------------

export function SupplierRow({
  rel,
  onEdit,
  onRemove,
}: {
  rel: SupplierRelationship
  onEdit: (r: SupplierRelationship) => void
  onRemove: (r: SupplierRelationship) => void
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const { supplier } = rel
  return (
    <TableRow hover>
      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ImageAvatar
            alt=""
            src={supplier.avatar || undefined}
            sx={{ width: 28, height: 28, fontSize: "0.75rem" }}
          >
            {supplier.kind === "contractor" ? (
              <BusinessRounded fontSize="small" />
            ) : (
              supplier.display_name?.[0]?.toUpperCase()
            )}
          </ImageAvatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {supplier.display_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{supplier.username}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Chip
          label={
            supplier.kind === "contractor"
              ? t("suppliersUi.kind.org")
              : t("suppliersUi.kind.user")
          }
          size="small"
          variant="outlined"
          icon={
            supplier.kind === "contractor" ? (
              <BusinessRounded />
            ) : (
              <PersonRounded />
            )
          }
        />
      </TableCell>
      <TableCell>
        {rel.tier ? (
          <Chip
            label={t(TIER_LABEL_KEYS[rel.tier] ?? rel.tier)}
            size="small"
            color={TIER_COLORS[rel.tier] || "default"}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">
            —
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Chip
          label={
            STATUS_LABEL_KEYS[rel.status]
              ? t(STATUS_LABEL_KEYS[rel.status])
              : rel.status
          }
          size="small"
          color={STATUS_COLORS[rel.status] || "default"}
          variant={rel.status === "active" ? "filled" : "outlined"}
        />
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {rel.notes || "—"}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {fmt.date(rel.created_at)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" justifyContent="flex-end">
          <Tooltip title={t("suppliersUi.roster.edit")}>
            <IconButton size="small" onClick={() => onEdit(rel)}>
              <EditRounded fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("suppliersUi.roster.remove")}>
            <IconButton
              size="small"
              color="error"
              onClick={() => onRemove(rel)}
            >
              <DeleteRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  )
}
