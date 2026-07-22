/**
 * AddWidgetGallery — modal listing the available widgets with a scope picker.
 *
 * M2 supports the direct scope bindings (me, current_context, specific_org,
 * specific_shop). Aggregate bindings (all_orgs/all_shops) are listed but render a
 * "coming soon" placeholder until M3 wires up multi-target fan-out.
 */

import { useMemo, useState } from "react"
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { useTranslation } from "react-i18next"
import { useGetMyShopsQuery } from "../../store/api/v2/market"
import { useGetUserProfileQuery } from "../profile/api/profileApi"
import {
  WIDGET_DEFINITIONS,
  widgetTitle,
  widgetDescription,
} from "./widgets/registry"
import { addWidget } from "./widgets/addWidget"
import { useDashboardOwner } from "./DashboardOwnerContext"
import type {
  DashboardConfig,
  WidgetScope,
  WidgetScopeKind,
} from "./types"

const SCOPE_LABEL_KEYS: Record<
  WidgetScopeKind,
  { key: string; default: string }
> = {
  me: { key: "dashboard.scope.me", default: "You" },
  current_context: {
    key: "dashboard.scope.currentContext",
    default: "Current context",
  },
  all_orgs: { key: "dashboard.scope.allOrgs", default: "All organizations" },
  all_shops: { key: "dashboard.scope.allShops", default: "All shops" },
  specific_org: {
    key: "dashboard.scope.specificOrg",
    default: "A specific organization",
  },
  specific_shop: {
    key: "dashboard.scope.specificShop",
    default: "A specific shop",
  },
}

// On a shared org/shop dashboard, personal and aggregate bindings are meaningless
// (the dashboard belongs to the owner, not the viewer). Only "current_context"
// (which resolves to the owner) and explicit specific_* pins are allowed.
const ORG_SHARED_SCOPES: WidgetScopeKind[] = [
  "current_context",
  "specific_org",
  "specific_shop",
]
const SHOP_SHARED_SCOPES: WidgetScopeKind[] = [
  "current_context",
  "specific_shop",
]

export interface AddWidgetButtonProps {
  config: DashboardConfig
  onConfigChange: (next: DashboardConfig) => void
}

export function AddWidgetButton({
  config,
  onConfigChange,
}: AddWidgetButtonProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
      >
        {t("dashboard.addWidget", "Add widget")}
      </Button>
      <AddWidgetDialog
        open={open}
        onClose={() => setOpen(false)}
        onAdd={(type, scope) => {
          onConfigChange(addWidget(config, type, scope))
          setOpen(false)
        }}
      />
    </>
  )
}

interface AddWidgetDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (type: string, scope: WidgetScope) => void
}

function AddWidgetDialog({ open, onClose, onAdd }: AddWidgetDialogProps) {
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const { data: myShops } = useGetMyShopsQuery()
  const owner = useDashboardOwner()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [scopeKind, setScopeKind] = useState<WidgetScopeKind>("me")
  const [targetId, setTargetId] = useState<string>("")

  // Restrict the scope picker to what makes sense for the dashboard owner.
  const ownerScopeAllowlist = useMemo<WidgetScopeKind[] | null>(() => {
    if (!owner || owner.ownerType === "user") return null
    return owner.ownerType === "org" ? ORG_SHARED_SCOPES : SHOP_SHARED_SCOPES
  }, [owner])

  const scopesFor = (allowed: WidgetScopeKind[]): WidgetScopeKind[] =>
    ownerScopeAllowlist
      ? allowed.filter((k) => ownerScopeAllowlist.includes(k))
      : allowed

  const definition = useMemo(
    () => WIDGET_DEFINITIONS.find((d) => d.type === selectedType) ?? null,
    [selectedType],
  )

  // Only widgets that support at least one owner-allowed scope are offered.
  const availableWidgets = useMemo(
    () =>
      WIDGET_DEFINITIONS.filter((d) => scopesFor(d.allowedScopes).length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ownerScopeAllowlist],
  )

  const scopeLabel = (k: WidgetScopeKind): string => {
    if (k === "current_context" && owner && owner.ownerType !== "user") {
      return owner.ownerType === "org"
        ? t("dashboard.scope.thisOrg", "This organization")
        : t("dashboard.scope.thisShop", "This shop")
    }
    const entry = SCOPE_LABEL_KEYS[k]
    return t(entry.key, entry.default)
  }

  const handlePickType = (type: string) => {
    const def = WIDGET_DEFINITIONS.find((d) => d.type === type)
    setSelectedType(type)
    // Default to the first allowed scope for this widget (owner-filtered).
    const allowed = scopesFor(def?.allowedScopes ?? [])
    setScopeKind(allowed[0] ?? "me")
    setTargetId("")
  }

  const buildScope = (): WidgetScope | null => {
    switch (scopeKind) {
      case "me":
        return { kind: "me" }
      case "current_context":
        return { kind: "current_context" }
      case "all_orgs":
        return { kind: "all_orgs" }
      case "all_shops":
        return { kind: "all_shops" }
      case "specific_org":
        return targetId ? { kind: "specific_org", spectrumId: targetId } : null
      case "specific_shop":
        return targetId ? { kind: "specific_shop", shopId: targetId } : null
      default:
        return null
    }
  }

  const scope = buildScope()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("dashboard.addAWidget", "Add a widget")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack spacing={0.5}>
            {availableWidgets.map((def) => (
              <ListItemButton
                key={def.type}
                selected={def.type === selectedType}
                onClick={() => handlePickType(def.type)}
                sx={{ borderRadius: 1 }}
              >
                <ListItemText
                  primary={widgetTitle(def, t)}
                  secondary={widgetDescription(def, t)}
                />
              </ListItemButton>
            ))}
          </Stack>

          {definition && (
            <>
              <FormControl fullWidth size="small">
                <InputLabel id="widget-scope-label">
                  {t("dashboard.dataScope", "Data scope")}
                </InputLabel>
                <Select
                  labelId="widget-scope-label"
                  label={t("dashboard.dataScope", "Data scope")}
                  value={scopeKind}
                  onChange={(e) => {
                    setScopeKind(e.target.value as WidgetScopeKind)
                    setTargetId("")
                  }}
                >
                  {scopesFor(definition.allowedScopes).map((k) => (
                    <MenuItem key={k} value={k}>
                      {scopeLabel(k)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {scopeKind === "specific_org" && (
                <FormControl fullWidth size="small">
                  <InputLabel id="widget-org-label">
                    {t("dashboard.organization", "Organization")}
                  </InputLabel>
                  <Select
                    labelId="widget-org-label"
                    label={t("dashboard.organization", "Organization")}
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                  >
                    {(profile?.contractors ?? []).map((org) => (
                      <MenuItem key={org.spectrum_id} value={org.spectrum_id}>
                        {org.name || org.spectrum_id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {scopeKind === "specific_shop" && (
                <FormControl fullWidth size="small">
                  <InputLabel id="widget-shop-label">
                    {t("dashboard.shop", "Shop")}
                  </InputLabel>
                  <Select
                    labelId="widget-shop-label"
                    label={t("dashboard.shop", "Shop")}
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                  >
                    {(myShops ?? []).map((shop) => (
                      <MenuItem key={shop.shop_id} value={shop.shop_id}>
                        {shop.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {(scopeKind === "all_orgs" || scopeKind === "all_shops") && (
                <Typography variant="caption" color="text.secondary">
                  {scopeKind === "all_orgs"
                    ? t(
                        "dashboard.aggregateOrgsHint",
                        "Shows one section per organization you belong to.",
                      )
                    : t(
                        "dashboard.aggregateShopsHint",
                        "Shows one section per shop you belong to.",
                      )}
                </Typography>
              )}

              <Button
                variant="contained"
                color="secondary"
                disabled={!scope}
                onClick={() => scope && onAdd(definition.type, scope)}
              >
                {t("dashboard.addNamed", "Add {{name}}", {
                  name: widgetTitle(definition, t),
                })}
              </Button>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
