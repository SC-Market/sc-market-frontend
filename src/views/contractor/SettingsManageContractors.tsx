import React, { useCallback, useEffect, useMemo, useState } from "react"
import { GridColDef } from "@mui/x-data-grid"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import throttle from "lodash/throttle"
import { useGetUserProfileQuery } from "../../store/profile"
import {
  useGetContractorBySpectrumIDQuery,
  useArchiveContractorMutation,
  useLeaveContractorMutation,
  useTransferOwnershipMutation,
  useGetContractorMembersQuery,
  contractorsApi,
} from "../../store/contractor"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { MinimalUser } from "../../datatypes/User"
import { store } from "../../store/store"

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/MenuProps';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Fade from '@mui/material/Fade';
import Skeleton from '@mui/material/Skeleton';
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import useMediaQuery from '@mui/material/useMediaQuery';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Fab from '@mui/material/Fab';
import DialogContentText from '@mui/material/DialogContentText';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';
import ReplyRounded from '@mui/icons-material/ReplyRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CopyAllRounded from '@mui/icons-material/CopyAllRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';

export function SettingsManageContractors() {
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()

  const [leaveOrg] = useLeaveContractorMutation()
  const [archiveContractor, { isLoading: isArchiving }] =
    useArchiveContractorMutation()
  const [transferOwnership, { isLoading: isTransferring }] =
    useTransferOwnershipMutation()
  const issueAlert = useAlertHook()

  const [archiveTarget, setArchiveTarget] = useState<{
    spectrum_id: string
    name: string
  } | null>(null)
  const [archiveReason, setArchiveReason] = useState("")

  const [transferTarget, setTransferTarget] = useState<{
    spectrum_id: string
    name: string
  } | null>(null)
  const [transferSearchQuery, setTransferSearchQuery] = useState("")
  const [transferSelectedUser, setTransferSelectedUser] = useState<{
    username: string
    display_name: string
    avatar?: string
  } | null>(null)
  const [transferSearchOptions, setTransferSearchOptions] = useState<
    MinimalUser[]
  >([])

  const handleLeaveOrg = (spectrum_id: string) => {
    leaveOrg(spectrum_id)
  }

  const handleArchiveOrg = () => {
    if (!archiveTarget) return
    archiveContractor({
      spectrum_id: archiveTarget.spectrum_id,
      reason: archiveReason.trim() || undefined,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("settingsManageContractors.disband_org_success", {
            name: archiveTarget.name,
          }),
          severity: "success",
        })
        setArchiveTarget(null)
        setArchiveReason("")
      })
      .catch(() => {
        issueAlert({
          message: t("settingsManageContractors.disband_org_error", {
            name: archiveTarget.name,
          }),
          severity: "error",
        })
      })
  }

  // Get members for the transfer target contractor
  const { data: transferMembersData } = useGetContractorMembersQuery(
    {
      spectrum_id: transferTarget?.spectrum_id || "",
      page: 0,
      page_size: 100,
      search: "",
      role_filter: "",
      sort: "username",
    },
    { skip: !transferTarget },
  )

  const transferMembers = transferMembersData?.members || []

  const fetchTransferOptions = useCallback(
    async (query: string) => {
      if (!transferTarget || query.length < 3) {
        setTransferSearchOptions([])
        return
      }

      const { status, data, error } = await store.dispatch(
        contractorsApi.endpoints.searchContractorMembers.initiate({
          spectrum_id: transferTarget.spectrum_id,
          query: query,
        }),
      )

      setTransferSearchOptions(data || [])
    },
    [transferTarget],
  )

  const retrieveTransfer = useMemo(
    () =>
      throttle((query: string) => {
        fetchTransferOptions(query)
      }, 400),
    [fetchTransferOptions],
  )

  useEffect(() => {
    retrieveTransfer(transferSearchQuery)
  }, [transferSearchQuery, retrieveTransfer])

  const handleTransferOwnership = () => {
    if (!transferTarget || !transferSelectedUser) return
    transferOwnership({
      contractor: transferTarget.spectrum_id,
      username: transferSelectedUser.username,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("settingsManageContractors.transfer_ownership_success", {
            name: transferTarget.name,
            username: transferSelectedUser.username,
          }),
          severity: "success",
        })
        setTransferTarget(null)
        setTransferSearchQuery("")
        setTransferSelectedUser(null)
        setTransferSearchOptions([])
      })
      .catch((error: any) => {
        issueAlert({
          message:
            error?.data?.message ||
            t("settingsManageContractors.transfer_ownership_error", {
              name: transferTarget.name,
            }),
          severity: "error",
        })
      })
  }

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("settingsManageContractors.name"),
      flex: 0.6,
      minWidth: 150,
    },
    {
      field: "actions",
      headerName: t("settingsManageContractors.actions"),
      flex: 1.4,
      minWidth: 300,
      sortable: false,
      align: "right",
      renderCell: ({ row }) => {
        const { data: contractor } = useGetContractorBySpectrumIDQuery(
          row.spectrum_id,
        )

        const ownerRole = contractor?.owner_role

        // Check if user is owner using profile contractors
        const userContractor = profile?.contractors?.find(
          (c) => c.spectrum_id === contractor?.spectrum_id,
        )
        const isOwner =
          ownerRole && userContractor?.roles.find((r) => r === ownerRole)

        if (contractor?.archived || row.archived) {
          return <Chip label={t("settingsManageContractors.archived_label")} />
        }

        if (isOwner) {
          return (
            <>
              <Button
                variant="outlined"
                color="primary"
                onClick={() =>
                  setTransferTarget({
                    spectrum_id: row.spectrum_id,
                    name: row.name,
                  })
                }
                sx={{ mr: 1 }}
              >
                {t("settingsManageContractors.transfer_ownership")}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() =>
                  setArchiveTarget({
                    spectrum_id: row.spectrum_id,
                    name: row.name,
                  })
                }
              >
                {t("settingsManageContractors.disband_org")}
              </Button>
            </>
          )
        }

        return (
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleLeaveOrg(row.spectrum_id)}
          >
            {t("settingsManageContractors.leave_org")}
          </Button>
        )
      },
    },
  ]

  return (
    <Grid item xs={12}>
      <Paper>
        <ThemedDataGrid
          rows={profile?.contractors || []}
          getRowId={(row) => row.spectrum_id}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
          rowSelection={false}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
        />
      </Paper>
      <Dialog
        open={Boolean(archiveTarget)}
        onClose={() => {
          if (!isArchiving) {
            setArchiveTarget(null)
            setArchiveReason("")
          }
        }}
      >
        <DialogTitle>
          {t("settingsManageContractors.disband_org_confirm_title")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t("settingsManageContractors.disband_org_confirm_body", {
              name: archiveTarget?.name ?? "",
            })}
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={archiveReason}
            onChange={(event) => setArchiveReason(event.target.value)}
            label={t(
              "settingsManageContractors.disband_org_confirm_reason_label",
            )}
            placeholder={t(
              "settingsManageContractors.disband_org_confirm_reason_placeholder",
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (!isArchiving) {
                setArchiveTarget(null)
                setArchiveReason("")
              }
            }}
            disabled={isArchiving}
          >
            {t("settingsManageContractors.disband_org_confirm_cancel_button")}
          </Button>
          <Button
            onClick={handleArchiveOrg}
            color="error"
            variant="contained"
            disabled={isArchiving}
          >
            {t("settingsManageContractors.disband_org_confirm_confirm_button")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(transferTarget)}
        onClose={() => {
          if (!isTransferring) {
            setTransferTarget(null)
            setTransferSearchQuery("")
            setTransferSelectedUser(null)
            setTransferSearchOptions([])
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("settingsManageContractors.transfer_ownership_confirm_title")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t("settingsManageContractors.transfer_ownership_confirm_body", {
              name: transferTarget?.name ?? "",
            })}
          </DialogContentText>
          <Autocomplete
            filterOptions={(x) => x}
            fullWidth
            options={
              transferSearchQuery
                ? transferSearchOptions
                : transferMembers
                    .map((u) => ({
                      username: u.username,
                      display_name: u.display_name || u.username,
                      avatar: u.avatar,
                    }))
                    .slice(0, 8)
            }
            getOptionLabel={(option) =>
              `${option.display_name || option.username} (@${option.username})`
            }
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Avatar
                  src={option.avatar}
                  sx={{ width: 32, height: 32, mr: 2 }}
                />
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {option.display_name || option.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    @{option.username}
                  </Typography>
                </Box>
              </Box>
            )}
            disablePortal
            value={transferSelectedUser}
            onChange={(
              event: any,
              newValue: {
                display_name: string
                username: string
                avatar?: string
              } | null,
            ) => {
              setTransferSelectedUser(newValue)
            }}
            inputValue={transferSearchQuery}
            onInputChange={(event, newInputValue) => {
              setTransferSearchQuery(newInputValue)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t(
                  "settingsManageContractors.transfer_ownership_confirm_username_label",
                )}
                placeholder={t(
                  "settingsManageContractors.transfer_ownership_confirm_username_placeholder",
                )}
                disabled={isTransferring}
                SelectProps={{
                  IconComponent: KeyboardArrowDownRoundedIcon,
                }}
              />
            )}
            disabled={isTransferring}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (!isTransferring) {
                setTransferTarget(null)
                setTransferSearchQuery("")
                setTransferSelectedUser(null)
                setTransferSearchOptions([])
              }
            }}
            disabled={isTransferring}
          >
            {t(
              "settingsManageContractors.transfer_ownership_confirm_cancel_button",
            )}
          </Button>
          <Button
            onClick={handleTransferOwnership}
            color="primary"
            variant="contained"
            disabled={isTransferring || !transferSelectedUser}
          >
            {t(
              "settingsManageContractors.transfer_ownership_confirm_confirm_button",
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
