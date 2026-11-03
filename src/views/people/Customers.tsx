import React, { MouseEventHandler, ReactElement } from "react"
import { Section } from "../../components/paper/Section"
import {
  Avatar,
  Grid,
  Link as MaterialLink,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material"
import { Link, useParams } from "react-router-dom"
import { HeadCell, PaginatedTable } from "../../components/table/PaginatedTable"
import {
  useGetOrgCustomersQuery,
  type OrgCustomer,
} from "../../store/api/v2/market"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { USER_PATHS } from "../../routes/paths"
import { useFormatters } from "../../util/format"

/** One customer's row: their own orders with the org, never shared values. */
export function CustomerRow(props: {
  row: OrgCustomer
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}): ReactElement {
  const { row, onClick, labelId } = props
  const theme = useTheme<ExtendedTheme>()
  const fmt = useFormatters()
  return (
    <TableRow hover onClick={onClick} tabIndex={-1} key={row.user_id}>
      <TableCell component="th" id={labelId} scope="row">
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item>
            <Avatar src={row.avatar ?? undefined} />
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
                fontWeight={"bold"}
              >
                {row.username}
              </UnderlineLink>
            </MaterialLink>
            <Typography variant={"subtitle2"}>{row.display_name}</Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell align="right">
        <Typography variant={"subtitle1"}>
          {fmt.number(row.orders)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant={"subtitle1"}>
          {fmt.number(row.fulfilled_orders)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant={"subtitle1"} color={"primary"}>
          {fmt.number(row.total_value)} aUEC
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant={"subtitle1"}>
          {row.last_order_at
            ? fmt.date(row.last_order_at)
            : "—"}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

const headCells: readonly HeadCell<OrgCustomer>[] = [
  {
    id: "username",
    numeric: false,
    disablePadding: false,
    label: "customerList.username",
  },
  {
    id: "orders",
    numeric: true,
    disablePadding: false,
    label: "customerList.orders",
  },
  {
    id: "fulfilled_orders",
    numeric: true,
    disablePadding: false,
    label: "customerList.fulfilled",
  },
  {
    id: "total_value",
    numeric: true,
    disablePadding: false,
    label: "customerList.total_value",
  },
  {
    id: "last_order_at",
    numeric: true,
    disablePadding: false,
    label: "customerList.last_order",
  },
]

/**
 * The org's customers: people who placed orders with the org or its shops
 * (members who ordered included), each with their own stats. Not a member
 * list.
 */
export function CustomerList() {
  const { contractor_id } = useParams<{ contractor_id: string }>()
  const { t } = useTranslation()

  const { isLoading, data } = useGetOrgCustomersQuery(
    { spectrumId: contractor_id ?? "" },
    { skip: !contractor_id },
  )

  return (
    <Section
      xs={12}
      title={t("customerList.customers")}
      subtitle={
        <Typography variant="body2" color="text.primary">
          {t("customerList.description")}
        </Typography>
      }
      disablePadding
    >
      {isLoading ? null : (
        <PaginatedTable<OrgCustomer>
          // `data` is undefined when the request failed (e.g. 403/404) or was
          // skipped (no contractor_id on /customers); render an empty table
          // instead of crashing PaginatedTable on `rows.length`.
          rows={data?.customers ?? []}
          initialSort={"total_value"}
          initialSortDirection={"desc"}
          generateRow={CustomerRow}
          keyAttr={"user_id"}
          headCells={headCells.map((cell) => ({
            ...cell,
            label: t(cell.label),
          }))}
          disableSelect
        />
      )}
    </Section>
  )
}
