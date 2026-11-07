/**
 * Admin: Supplier Roster
 * Lets admin users manage their supplier relationships — add, tier, remove.
 * Gated to admin role via SiteAdminRoute in src/routes.ts.
 * Will be moved to /seller/suppliers once the feature is stable.
 */

import { useState } from "react"
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../components/avatar/ImageAvatar"
import { AddRounded } from "@mui/icons-material"
import {
  useGetMySuppliersQuery,
  useGetMyAggregatorsQuery,
  useRemoveSupplierMutation,
} from "../../store/api/v2/market"
import type { SupplierRelationship } from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"
import { usePageReady } from "../../components/metadata/PageReady"
import { useFormatters } from "../../util/format"
import {
  TIER_COLORS,
  TIER_LABEL_KEYS,
  STATUS_LABEL_KEYS,
  STATUS_COLORS,
} from "./supplierRosterLabels"
import { AddSupplierDialog } from "./AddSupplierDialog"
import { EditSupplierDialog } from "./EditSupplierDialog"
import { SupplierRow } from "./SupplierRosterRow"

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function AdminSupplierRoster() {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)
  const [addOpen, setAddOpen] = useState(false)
  const [editRel, setEditRel] = useState<SupplierRelationship | null>(null)
  const [removeSupplier] = useRemoveSupplierMutation()

  const { data: suppliersData, isLoading: suppliersLoading } =
    useGetMySuppliersQuery({})
  usePageReady(suppliersLoading)
  const { data: aggregatorsData, isLoading: aggregatorsLoading } =
    useGetMyAggregatorsQuery({})

  const suppliers = suppliersData?.suppliers || []
  const aggregators = aggregatorsData?.suppliers || []

  const handleRemove = async (rel: SupplierRelationship) => {
    if (
      !window.confirm(
        t("suppliersUi.roster.removeConfirm", {
          name: rel.supplier.display_name,
        }),
      )
    )
      return
    await removeSupplier({ relationshipId: rel.relationship_id })
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {t("suppliersUi.roster.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("suppliersUi.roster.subtitle")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => setAddOpen(true)}
        >
          {t("suppliersUi.roster.addSupplier")}
        </Button>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
      >
        <Tab
          label={t("suppliersUi.roster.mySuppliersTab", {
            count: suppliers.length,
          })}
        />
        <Tab
          label={t("suppliersUi.roster.supplierForTab", {
            count: aggregators.length,
          })}
        />
      </Tabs>

      {tab === 0 && (
        <Paper>
          {suppliersLoading ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                {t("marketV2.loadingEllipsis")}
              </Typography>
            </Box>
          ) : suppliers.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary" gutterBottom>
                {t("suppliersUi.roster.empty")}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddRounded />}
                onClick={() => setAddOpen(true)}
              >
                {t("suppliersUi.roster.addFirst")}
              </Button>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    {t("suppliersUi.roster.columns.supplier")}
                  </TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.type")}</TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.tier")}</TableCell>
                  <TableCell>
                    {t("suppliersUi.roster.columns.status")}
                  </TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.notes")}</TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.added")}</TableCell>
                  <TableCell align="right">
                    {t("suppliersUi.roster.columns.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.map((rel) => (
                  <SupplierRow
                    key={rel.relationship_id}
                    rel={rel}
                    onEdit={setEditRel}
                    onRemove={handleRemove}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      {tab === 1 && (
        <Paper>
          {aggregatorsLoading ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                {t("marketV2.loadingEllipsis")}
              </Typography>
            </Box>
          ) : aggregators.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                {t("suppliersUi.roster.notOnRoster")}
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    {t("suppliersUi.roster.columns.aggregator")}
                  </TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.type")}</TableCell>
                  <TableCell>
                    {t("suppliersUi.roster.columns.tierAssigned")}
                  </TableCell>
                  <TableCell>
                    {t("suppliersUi.roster.columns.status")}
                  </TableCell>
                  <TableCell>
                    {t("suppliersUi.roster.columns.theirNotes")}
                  </TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.since")}</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {aggregators.map((rel) => (
                  <TableRow key={rel.relationship_id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <ImageAvatar
                          alt=""
                          sx={{ width: 28, height: 28, fontSize: "0.75rem" }}
                        >
                          {rel.aggregator.display_name?.[0]?.toUpperCase()}
                        </ImageAvatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {rel.aggregator.display_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{rel.aggregator.username}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          rel.aggregator.kind === "contractor"
                            ? t("suppliersUi.kind.org")
                            : t("suppliersUi.kind.user")
                        }
                        size="small"
                        variant="outlined"
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
                        variant={
                          rel.status === "active" ? "filled" : "outlined"
                        }
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
                    <TableCell />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      <AddSupplierDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <EditSupplierDialog rel={editRel} onClose={() => setEditRel(null)} />
    </Box>
  )
}
