import React, { MouseEventHandler } from "react"
import { Section } from "../../components/paper/Section"
import {
  Avatar,
  Grid,
  Link as MaterialLink,
  TableCell,
  TableRow,
  Theme,
  Typography,
} from "@mui/material"
import { User } from "../../datatypes/User"
import { Link } from "react-router-dom"
import { styled } from "@mui/material/styles"
import { HeadCell, PaginatedTable } from "../../components/table/PaginatedTable"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetContractorCustomersQuery } from "../../store/contractor"
import { UnderlineLink } from "../../components/typography/UnderlineLink"

function PeopleRow(props: {
  row: User
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}): JSX.Element {
  const { row, onClick, isItemSelected, labelId } = props
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
        <Grid container spacing={2}>
          <Grid item>
            <Avatar src={row.avatar} />
          </Grid>
          <Grid item>
            <MaterialLink
              component={Link}
              to={`/user/${row.username}`}
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
          {/*{row.orders.toLocaleString('en-US')}*/}5
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant={"subtitle1"} color={"primary"}>
          {/*{row.spent.toLocaleString('en-US')}*/}
          32 aUEC
        </Typography>
      </TableCell>
    </TableRow>
  )
}

const SearchIconWrapper = styled("div")((args: { theme: Theme }) => ({
  padding: args.theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}))

const headCells: readonly HeadCell<User>[] = [
  {
    id: "username",
    numeric: false,
    disablePadding: false,
    label: "Username",
  },
  {
    id: "orders",
    numeric: true,
    disablePadding: false,
    label: "Orders",
  },
  {
    id: "spent",
    numeric: true,
    disablePadding: false,
    label: "Total Value",
  },
]

export function CustomerList(props: {
  contractors?: boolean
  members?: boolean
  customers?: boolean
}) {
  const [currentOrg] = useCurrentOrg()

  const { isLoading, data } = useGetContractorCustomersQuery(
    currentOrg?.spectrum_id!,
    { skip: !currentOrg?.spectrum_id },
  )

  return (
    <Section xs={12} title={"Customers"} disablePadding>
      {isLoading ? null : (
        <PaginatedTable<User>
          rows={data!}
          initialSort={"username"}
          generateRow={PeopleRow}
          keyAttr={"username"}
          headCells={headCells}
          disableSelect
        />
      )}
    </Section>
  )
}
