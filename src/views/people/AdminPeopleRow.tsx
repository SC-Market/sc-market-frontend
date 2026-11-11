import { MouseEventHandler, ReactElement } from "react"
import {
  Avatar,
  Grid,
  Link as MaterialLink,
  TableCell,
  TableRow,
  Typography,
  Chip,
  Box,
} from "@mui/material"
import type { AdminUser } from "../../store/api/v2/market"
import { Link } from "react-router-dom"
import { HeadCell } from "../../components/table/PaginatedTable"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { USER_PATHS } from "../../routes/paths"
import { useFormatters } from "../../util/format"

export function PeopleRow(props: {
  row: AdminUser
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}): ReactElement {
  const fmt = useFormatters()
  const { row, onClick, isItemSelected, labelId } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <TableRow
      hover
      onClick={onClick}
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={row.username}
      selected={isItemSelected}
    >
      {/*<TableCell padding="checkbox">*/}
      {/*    <Checkbox*/}
      {/*        color="primary"*/}
      {/*        checked={isItemSelected}*/}
      {/*        inputProps={{*/}
      {/*            'aria-labelledby': labelId,*/}
      {/*        }}*/}
      {/*    />*/}
      {/*</TableCell>*/}
      <TableCell
        component="th"
        id={labelId}
        scope="row"
        // padding="none"
      >
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item>
            <Avatar src={row.avatar} />
          </Grid>
          <Grid item>
            <MaterialLink
              component={Link}
              to={USER_PATHS.profile(row.username)}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <UnderlineLink
                color={"text.secondary"}
                variant={"subtitle1"}
                sx={{ fontWeight: "bold" }}
              >
                {row.username}
              </UnderlineLink>
            </MaterialLink>
            <Typography variant={"subtitle2"}>{row.display_name}</Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell
        component="th"
        id={labelId}
        scope="row"
        // padding="none"
        align={"right"}
      >
        <Typography variant={"subtitle2"}>
          {fmt.date(row.created_at)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography
          variant={"subtitle1"}
          color={"primary"}
          sx={{
            textTransform: "capitalize",
          }}
        >
          {row.role}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          {row.banned && (
            <Chip
              label={t("appUi.adminUsers.banned")}
              color="error"
              size="small"
            />
          )}
          {!row.rsi_confirmed && (
            <Chip
              label={t("adminUsers.unverified")}
              color="warning"
              size="small"
            />
          )}
        </Box>
      </TableCell>
    </TableRow>
  )
}

export const headCells: readonly HeadCell<AdminUser>[] = [
  {
    id: "username",
    numeric: false,
    disablePadding: false,
    label: "adminUsers.username",
  },
  {
    id: "created_at",
    numeric: true,
    disablePadding: false,
    label: "adminUsers.date_joined",
  },
  {
    id: "role",
    numeric: true,
    disablePadding: false,
    label: "adminUsers.role",
  },
  {
    id: "banned",
    numeric: true,
    disablePadding: false,
    label: "adminUsers.status",
  },
]
