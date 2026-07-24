/**
 * AddWidgetGallery — modal listing the available widgets with a scope picker.
 *
 * M2 supports the direct scope bindings (me, current_context, specific_org,
 * specific_shop). Aggregate bindings (all_orgs/all_shops) are listed but render a
 * "coming soon" placeholder until M3 wires up multi-target fan-out.
 */

import { Fragment, useMemo, useState } from "react"
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { useTranslation } from "react-i18next"
import { useGetMyShopsQuery } from "../../store/api/v2/market"
import { useGetUserProfileQuery } from "../profile/api/profileApi"
import { Section } from "../../components/paper/Section"
import {
  WIDGET_DEFINITIONS,
  WIDGET_CATEGORY_ORDER,
  WIDGET_CATEGORY_LABELS,
  widgetTitle,
  widgetDescription,
  ACTIVITY_FILTER_OPTIONS,
  type WidgetCategory,
  type WidgetDefinition,
} from "./widgets/registry"
import { WidgetPreview } from "./widgets/WidgetPreview"
import { addWidget } from "./widgets/addWidget"
import { useDashboardOwner } from "./DashboardOwnerContext"
import { GameItemPicker, type GameItemChoice } from "./GameItemPicker"
import type {
  DashboardConfig,
  DashboardWidget,
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
        onAdd={(type, scope, settings) => {
          onConfigChange(addWidget(config, type, scope, settings))
          setOpen(false)
        }}
      />
    </>
  )
}

interface AddWidgetDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (
    type: string,
    scope: WidgetScope,
    settings?: DashboardWidget["settings"],
  ) => void
}

function AddWidgetDialog({ open, onClose, onAdd }: AddWidgetDialogProps) {
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const { data: myShops } = useGetMyShopsQuery()
  const owner = useDashboardOwner()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [scopeKind, setScopeKind] = useState<WidgetScopeKind>("me")
  const [targetId, setTargetId] = useState<string>("")
  const [selectedItem, setSelectedItem] = useState<GameItemChoice | null>(null)
  // Listings-source widgets: pick "search" (free text) or "item" (specific item).
  const [sourceMode, setSourceMode] = useState<"search" | "item">("search")
  const [searchQuery, setSearchQuery] = useState("")
  // Activity Feed: optional action filter ("" = all activity).
  const [activityFilter, setActivityFilter] = useState("")

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

  // Grouped into gallery subsections, in the canonical category order. Empty
  // categories are dropped.
  const widgetsByCategory = useMemo(
    () =>
      WIDGET_CATEGORY_ORDER.map((category) => ({
        category,
        widgets: availableWidgets.filter((d) => d.category === category),
      })).filter((group) => group.widgets.length > 0),
    [availableWidgets],
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
    setSelectedItem(null)
    setSourceMode("search")
    setSearchQuery("")
    setActivityFilter("")
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

  // Widgets that pin to a game item (e.g. Price History) store it in settings.
  const requiresItem = definition?.requiresItem ?? false
  // Widgets with a listings source (e.g. Listings Preview) store either a
  // free-text query or a specific item, depending on the chosen source mode.
  const requiresListingsSource = definition?.requiresListingsSource ?? false
  // Widgets with an optional activity filter (e.g. Activity Feed).
  const offersActivityFilter = definition?.offersActivityFilter ?? false

  const settings: DashboardWidget["settings"] | undefined = requiresItem
    ? selectedItem
      ? { gameItemId: selectedItem.id, gameItemName: selectedItem.name }
      : undefined
    : requiresListingsSource
      ? sourceMode === "item"
        ? selectedItem
          ? { gameItemId: selectedItem.id, gameItemName: selectedItem.name }
          : undefined
        : searchQuery.trim()
          ? { query: searchQuery.trim() }
          : undefined
      : offersActivityFilter && activityFilter
        ? { action: activityFilter }
        : undefined

  const canAdd =
    !!scope &&
    (!requiresItem || !!selectedItem) &&
    (!requiresListingsSource || !!settings)

  const categoryLabel = (category: WidgetCategory): string => {
    const entry = WIDGET_CATEGORY_LABELS[category]
    return t(entry.key, entry.default)
  }

  // Customization controls (scope, item/listings source, activity filter, and
  // the Add button) for the selected widget. Rendered inline directly beneath
  // the selected card so the options are visible proactively, not tucked away
  // at the bottom of the dialog.
  const customizationPanel = definition && (
    <Stack
      spacing={2}
      sx={{
        p: 2,
        border: 1,
        borderColor: "primary.main",
        borderRadius: 1,
        bgcolor: "action.hover",
      }}
    >
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

      {requiresItem && (
        <GameItemPicker value={selectedItem} onChange={setSelectedItem} />
      )}

      {requiresListingsSource && (
        <Stack spacing={1.5}>
          <ToggleButtonGroup
            size="small"
            exclusive
            fullWidth
            color="primary"
            value={sourceMode}
            onChange={(_, next) => {
              if (next) setSourceMode(next)
            }}
          >
            <ToggleButton value="search">
              {t("dashboard.listingsPreview.bySearch", "By search")}
            </ToggleButton>
            <ToggleButton value="item">
              {t("dashboard.listingsPreview.byItem", "By item")}
            </ToggleButton>
          </ToggleButtonGroup>

          {sourceMode === "search" ? (
            <TextField
              size="small"
              fullWidth
              label={t(
                "dashboard.listingsPreview.searchLabel",
                "Search query",
              )}
              placeholder={t(
                "dashboard.listingsPreview.searchPlaceholder",
                "e.g. medical gown",
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          ) : (
            <GameItemPicker value={selectedItem} onChange={setSelectedItem} />
          )}
        </Stack>
      )}

      {offersActivityFilter && (
        <FormControl fullWidth size="small">
          <InputLabel id="widget-activity-label">
            {t("dashboard.activityFeed.filterLabel", "Show")}
          </InputLabel>
          <Select
            labelId="widget-activity-label"
            label={t("dashboard.activityFeed.filterLabel", "Show")}
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
          >
            {ACTIVITY_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {t(opt.labelKey, opt.labelDefault)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Button
        variant="contained"
        color="secondary"
        disabled={!canAdd}
        onClick={() =>
          canAdd && scope && onAdd(definition.type, scope, settings)
        }
      >
        {t("dashboard.addNamed", "Add {{name}}", {
          name: widgetTitle(definition, t),
        })}
      </Button>
    </Stack>
  )

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("dashboard.addAWidget", "Add a widget")}</DialogTitle>
      <DialogContent>
        <Section xs={12} disablePadding>
          <Grid item xs={12}>
            <Stack spacing={3} sx={{ p: 2 }}>
              {widgetsByCategory.map((group) => (
                <Stack key={group.category} spacing={1.5}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    fontWeight="bold"
                  >
                    {categoryLabel(group.category)}
                  </Typography>
                  <Grid container spacing={1.5}>
                    {group.widgets.map((def) => (
                      <Fragment key={def.type}>
                        <WidgetCard
                          def={def}
                          selected={def.type === selectedType}
                          onSelect={() => handlePickType(def.type)}
                          title={widgetTitle(def, t)}
                          description={widgetDescription(def, t)}
                        />
                        {def.type === selectedType && (
                          // Full-width row break so the panel sits directly
                          // below the selected card, spanning the category.
                          <Grid item xs={12}>
                            {customizationPanel}
                          </Grid>
                        )}
                      </Fragment>
                    ))}
                  </Grid>
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Section>
      </DialogContent>
    </Dialog>
  )
}

interface WidgetCardProps {
  def: WidgetDefinition
  selected: boolean
  onSelect: () => void
  title: string
  description: string
}

/** A single selectable widget in the gallery: schematic preview + title + blurb. */
function WidgetCard({
  def,
  selected,
  onSelect,
  title,
  description,
}: WidgetCardProps) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          borderColor: selected ? "primary.main" : "divider",
          borderWidth: selected ? 2 : 1,
        }}
      >
        <CardActionArea
          onClick={onSelect}
          sx={{ height: "100%", p: 1.5, alignItems: "stretch" }}
        >
          <Stack spacing={1} sx={{ height: "100%" }}>
            <WidgetPreview kind={def.preview} icon={def.icon} />
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </Stack>
        </CardActionArea>
      </Card>
    </Grid>
  )
}
