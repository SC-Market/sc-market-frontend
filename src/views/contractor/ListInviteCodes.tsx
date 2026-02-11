import React, {
  MouseEventHandler,
  ReactElement,
  useCallback,
  useEffect,
} from "react"
import { Section } from "../../components/paper/Section"
import { HeadCell, PaginatedTable } from "../../components/table/PaginatedTable"
import {
  useDeleteContractorInviteMutation,
  useGetContractorInvitesQuery,
} from "../../store/contractor"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { ContractorInviteCode } from "../../datatypes/Contractor"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"

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

export const headCells: readonly HeadCell<ContractorInviteCode>[] = [
  {
    id: "invite_id",
    numeric: false,
    disablePadding: false,
    label: "inviteCodes.invite_code",
  },
  {
    id: "invite_id",
    numeric: false,
    disablePadding: true,
    label: "",
    noSort: true,
  },
  {
    id: "invite_id",
    numeric: false,
    disablePadding: false,
    label: "",
    noSort: true,
  },
]

export function InviteRow(props: {
  row: ContractorInviteCode
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}): ReactElement {
  const { row, index, isItemSelected } = props
  const [currentOrg] = useCurrentOrg()
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const [deleteContractorInvite] = useDeleteContractorInviteMutation()

  const issueAlert = useAlertHook()

  const submitDelete = useCallback(async () => {
    // event.preventDefault();
    const res: { data?: any; error?: any } = await deleteContractorInvite({
      contractor: currentOrg!.spectrum_id,
      invite_id: row.invite_id,
    })

    if (res?.data && !res?.error) {
      issueAlert({
        message: t("inviteCodes.submitted"),
        severity: "success",
      })
    } else {
      issueAlert({
        message: t("inviteCodes.failed_submit", {
          reason: res.error?.error || res.error?.data?.error || res.error || "",
        }),
        severity: "error",
      })
    }
    return false
  }, [currentOrg, deleteContractorInvite, row.invite_id, issueAlert, t])

  return (
    <>
      <TableRow
        hover
        // onClick={onClick}
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
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
        <TableCell align={"left"}>
          <Box
            sx={{
              alignItems: "center",
              display: "inline-flex",
            }}
          >
            <Typography color={"text.secondary"} variant={"body1"}>
              {row.invite_id}
            </Typography>
          </Box>
          <Box
            sx={{
              alignItems: "center",
            }}
          >
            <Typography color={"text.primary"} variant={"body2"}>
              {t("inviteCodes.used_times", {
                used: row.times_used,
                max: row.max_uses || "∞",
              })}
            </Typography>
          </Box>
        </TableCell>

        <TableCell
          padding="checkbox"
          onClick={(event) => {
            event.stopPropagation()
          }}
          align={"right"}
        >
          <IconButton
            onClick={(event) => {
              navigator.clipboard.writeText(
                `${window.location.origin}/contractor_invite/${row.invite_id}`,
              )
              issueAlert({
                message: t("inviteCodes.copied"),
                severity: "success",
              })
              event.stopPropagation()
            }}
          >
            <ContentCopyRounded style={{ color: theme.palette.primary.main }} />
          </IconButton>
        </TableCell>
        <TableCell
          padding="checkbox"
          onClick={(event) => {
            event.stopPropagation()
          }}
          align={"right"}
        >
          <IconButton
            onClick={(event) => {
              submitDelete()
              event.stopPropagation()
            }}
          >
            <DeleteRounded style={{ color: theme.palette.error.main }} />
          </IconButton>
        </TableCell>
      </TableRow>
    </>
  )
}

export function ListInviteCodes() {
  const [currentOrg] = useCurrentOrg()
  const { t } = useTranslation()
  const { data: contractorInvites } = useGetContractorInvitesQuery(
    currentOrg?.spectrum_id!,
  )

  return (
    <Section
      xs={12}
      md={12}
      lg={12}
      xl={12}
      disablePadding
      title={t("inviteCodes.invites")}
    >
      <PaginatedTable
        rows={contractorInvites || []}
        initialSort={"invite_id"}
        generateRow={InviteRow}
        keyAttr={"invite_id"}
        headCells={headCells.map((cell) => ({
          ...cell,
          label: cell.label ? t(cell.label, cell.label) : "",
        }))}
        disableSelect
      />
    </Section>
  )
}
