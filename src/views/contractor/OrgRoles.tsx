import React, {
  MouseEventHandler,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Section } from "../../components/paper/Section"
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Collapse,
  FormControlLabel,
  Grid,
  IconButton,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material"
import { HeadCell, PaginatedTable } from "../../components/table/PaginatedTable"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { ContractorRole } from "../../features/contractor/domain/types"
import {
  KeyboardArrowDownRounded,
  KeyboardArrowRightRounded,
} from "@mui/icons-material"
import { BorderlessCell } from "../orders/Services"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useOrgRoleActions } from "../../features/contractor/hooks/useOrgRoleActions"
import { useTranslation } from "react-i18next"

export {
  has_permission,
  min_position,
  getMemberPosition,
  self_member_role_removal_forbidden,
  min_role,
} from "../../features/contractor/domain/permissions"
import { min_position } from "../../features/contractor/domain/permissions"
import {
  editableRolePermissions,
  type RolePermission,
} from "../../features/contractor/domain/rolePermissions"
import { HelpTip } from "../../features/help/components/HelpTip"

import { useFormatters } from "../../util/format"
function RolePermissionCheck(props: {
  permission_name: RolePermission
  role: ContractorRole
  setRole: (a: ContractorRole) => void
}) {
  const { permission_name, setRole, role } = props
  const { t } = useTranslation()
  const label = t(`manageRoles.permissions.${permission_name}`)
  const description = t(
    `manageRoles.permissionDescriptions.${permission_name}`,
    "",
  )
  return (
    <Grid item xs={12} sm={6}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <FormControlLabel
          sx={{ mr: 0.5 }}
          control={
            <Checkbox
              checked={role[permission_name]}
              onChange={(event: React.ChangeEvent<{ checked: boolean }>) => {
                setRole({ ...role, [permission_name]: event.target.checked })
              }}
              color={"secondary"}
              name={permission_name}
              inputProps={{
                "aria-label": t("orgAdminUi.roles.permissionForRole", {
                  permission: label,
                  role: role.name || t("orgAdminUi.roles.newRole"),
                }),
              }}
            />
          }
          label={label}
        />
        {description && <HelpTip label={label} title={description} />}
      </Box>
    </Grid>
  )
}

/**
 * One checkbox (with its "?" explanation) per permission the org's roles can
 * grant, in ROLE_PERMISSIONS order.
 */
export function RolePermissionChecklist(props: {
  org: { premium_tier?: string | null } | null | undefined
  role: ContractorRole
  setRole: (a: ContractorRole) => void
}) {
  return (
    <>
      {editableRolePermissions(props.org).map((permission) => (
        <RolePermissionCheck
          key={permission}
          role={props.role}
          setRole={props.setRole}
          permission_name={permission}
        />
      ))}
    </>
  )
}

function RoleDetailsRow(props: { role: ContractorRole; open: boolean }) {
  const { role, open } = props
  const [newRole, setNewRole] = useState(role)
  const { t } = useTranslation()
  const [contractor] = useCurrentOrg()

  useEffect(() => {
    setNewRole(role)
  }, [role])

  const [currentOrg] = useCurrentOrg()
  const roleActions = useOrgRoleActions(currentOrg?.spectrum_id)

  const theme = useTheme<ExtendedTheme>()

  const submitUpdate = useCallback(
    () => roleActions.update(role.role_id, newRole),
    [roleActions, role.role_id, newRole],
  )

  const deleteRoleCallback = useCallback(
    () => roleActions.remove(role.role_id),
    [roleActions, role.role_id],
  )

  return (
    <>
      <TableCell colSpan={7} sx={{ padding: 0 }}>
        <Collapse in={open}>
          <Box
            sx={{
              width: "100%",
              padding: 2,
              paddingTop: 0,
            }}
          >
            <Card
              variant={"outlined"}
              sx={{
                width: "100%",
                borderColor: theme.palette.outline.main,
                borderRadius: theme.spacing(theme.borderRadius.image),
              }}
            >
              <CardContent sx={{ padding: 2 }}>
                <Grid
                  container
                  spacing={theme.layoutSpacing.compact}
                  direction={"column"}
                >
                  <Grid item>
                    <TextField
                      fullWidth
                      label={t("manageRoles.role_name")}
                      value={newRole.name}
                      onChange={(event) =>
                        setNewRole({ ...newRole, name: event.target.value })
                      }
                    />
                  </Grid>

                  <Grid item>
                    <TextField
                      label={t("manageRoles.role_position")}
                      type="number"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      helperText={t("manageRoles.position_helper")}
                      value={newRole.position}
                      onChange={(event) =>
                        setNewRole({
                          ...newRole,
                          position: Math.max(1, +event.target.value),
                        })
                      }
                    />
                  </Grid>

                  <Grid item>
                    <Grid container spacing={theme.layoutSpacing.compact}>
                      <RolePermissionChecklist
                        org={contractor}
                        role={newRole}
                        setRole={setNewRole}
                      />
                    </Grid>
                  </Grid>
                  <Box display={"flex"} justifyContent={"center"}>
                    <Button
                      color={"primary"}
                      onClick={submitUpdate}
                      variant={"contained"}
                      sx={{ marginRight: 1 }}
                      aria-label={t("orgAdminUi.roles.saveRole", {
                        role: role.name,
                      })}
                    >
                      {t("manageRoles.save")}
                    </Button>
                    {role.role_id !== currentOrg?.owner_role && (
                      <Button
                        color={"error"}
                        variant={"contained"}
                        onClick={deleteRoleCallback}
                        aria-label={t("orgAdminUi.roles.deleteRole", {
                          role: role.name,
                        })}
                      >
                        {t("manageRoles.delete")}
                      </Button>
                    )}
                  </Box>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Collapse>
      </TableCell>
    </>
  )
}

function RoleRow(props: {
  row: ContractorRole
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
  manage?: boolean
}): ReactElement {
  const { row, index, isItemSelected } = props
  const { t } = useTranslation()
  const fmt = useFormatters()
  const [open, setOpen] = useState(false)

  const [currentOrg] = useCurrentOrg()
  const { data: profile } = useGetUserProfileQuery()

  const myPosition = useMemo(
    () => min_position(currentOrg!, profile!, profile?.contractors),
    [currentOrg, profile],
  )

  useEffect(() => {
    setOpen(false) // row changed, so close
  }, [row])

  return (
    <>
      <TableRow
        hover
        // onClick={onClick}
        tabIndex={-1}
        data-testid="org-role-row"
        data-id={row.role_id}
        key={index}
        selected={isItemSelected}
        // component={Link} to={`/contract/${row.order_id}`}
        sx={{
          textDecoration: "none",
          color: "inherit",
          borderBottom: "none",
          border: "none",
        }}
      >
        <BorderlessCell align={"left"}>{row.name}</BorderlessCell>

        <BorderlessCell align={"right"}>
          {fmt.number(row.position)}
        </BorderlessCell>

        <BorderlessCell
          padding="checkbox"
          onClick={(event) => {
            event.stopPropagation()
          }}
          align={"right"}
        >
          {(myPosition != undefined ? myPosition : row.position) <
            row.position && (
            <IconButton
              onClick={(event) => {
                setOpen((o) => !o)
                event.stopPropagation()
              }}
              aria-label={t("orgAdminUi.roles.editRole", {
                role: row.name,
              })}
              aria-expanded={open}
            >
              {open ? (
                <KeyboardArrowDownRounded />
              ) : (
                <KeyboardArrowRightRounded />
              )}
            </IconButton>
          )}
        </BorderlessCell>
      </TableRow>
      <RoleDetailsRow open={open} role={row} />
    </>
  )
}

const headCells: readonly HeadCell<ContractorRole>[] = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Name",
  },
  {
    id: "position",
    numeric: true,
    disablePadding: false,
    label: "Position",
  },
  {
    id: "role_id",
    numeric: true,
    disablePadding: false,
    label: "",
  },
]

export function ManageRoles(): ReactElement {
  const [contractor] = useCurrentOrg()
  const { t } = useTranslation()

  return (
    <Section xs={12} title={t("manageRoles.title")} disablePadding>
      <PaginatedTable<ContractorRole>
        rows={contractor?.roles || []}
        initialSort={"position"}
        generateRow={(props) => <RoleRow {...props} />}
        keyAttr={"role_id"}
        headCells={headCells.map((cell) => ({
          ...cell,
          label: cell.label
            ? t(`manageRoles.headCells.${cell.id}`, cell.label)
            : "",
        }))}
        disableSelect
      />
    </Section>
  )
}

const defaultRole = {
  name: "",
  position: 10,
  manage_roles: false,
  manage_orders: false,
  kick_members: false,
  manage_invites: false,
  manage_org_details: false,
  manage_stock: false,
  manage_market: false,
  manage_recruiting: false,
  manage_webhooks: false,
  manage_blocklist: false,
  claim_orders: false,
  manage_theme: false,
  role_id: "",
  contractor_id: "",
}

export function AddRole() {
  const [newRole, setNewRole] = useState<ContractorRole>(defaultRole)
  const { t } = useTranslation()

  const [currentOrg] = useCurrentOrg()
  const { create: createRole } = useOrgRoleActions(currentOrg?.spectrum_id)

  const submitUpdate = useCallback(async () => {
    if (await createRole(newRole)) setNewRole(defaultRole)
  }, [createRole, newRole])

  return (
    <>
      <Section xs={12} title={t("manageRoles.add_role")}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("manageRoles.role_name")}
            value={newRole.name}
            onChange={(event) =>
              setNewRole({ ...newRole, name: event.target.value })
            }
          />
        </Grid>

        <RolePermissionChecklist
          org={currentOrg}
          role={newRole}
          setRole={setNewRole}
        />

        <Grid item display={"flex"} justifyContent={"center"} xs={12}>
          <Button
            color={"primary"}
            onClick={submitUpdate}
            variant={"contained"}
            sx={{ marginRight: 1 }}
          >
            {t("manageRoles.create")}
          </Button>
        </Grid>
      </Section>
    </>
  )
}
