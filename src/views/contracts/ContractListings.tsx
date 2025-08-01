import React, { useCallback, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next" // added for localization
import { orderIcons } from "../../datatypes/Order"
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Fade,
  Grid,
  Link as MaterialLink,
  TablePagination,
  Typography,
} from "@mui/material"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { Link } from "react-router-dom"
import { getRelativeTime } from "../../util/time"
import {
  PublicContract,
  useGetPublicContractsQuery,
} from "../../store/public_contracts"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { useContractSearch } from "../../hooks/contract/ContractSearch"
import { dateDiffInDays } from "../market/MarketListingView"
import { paymentTypeMessages } from "../orders/Services"

export function ContractListing(props: {
  contract: PublicContract
  index: number
}) {
  const { contract, index } = props

  return (
    <Grid item xs={12} lg={6}>
      <Link
        to={`/contracts/public/${contract.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Fade
          in={true}
          style={{
            transitionDelay: `${50 + 50 * index}ms`,
            transitionDuration: "500ms",
          }}
        >
          <CardActionArea
            sx={{
              borderRadius: 2,
            }}
          >
            <Card
              sx={{
                borderRadius: 2,
              }}
            >
              <CardHeader
                disableTypography
                sx={{
                  overflow: "hidden",
                  root: {
                    overflow: "hidden",
                  },
                  content: {
                    overflow: "hidden",
                    width: "100%",
                    display: "contents",
                    flex: "1 1 auto",
                  },
                  "& .MuiCardHeader-content": {
                    overflow: "hidden",
                  },
                }}
                title={
                  <Box
                    sx={{ paddingLeft: 0 }}
                    display={"flex"}
                    alignItems={"center"}
                  >
                    {dateDiffInDays(new Date(), new Date(contract.timestamp)) <=
                      1 && (
                      <Chip
                        color={"secondary"}
                        label={"New"}
                        sx={{
                          marginRight: 1,
                          textTransform: "uppercase",
                          fontSize: "0.85em",
                          fontWeight: "bold",
                        }}
                      />
                    )}
                    <Typography
                      noWrap
                      sx={{ marginRight: 1 }}
                      variant={"h6"}
                      color={"text.secondary"}
                    >
                      {contract.title}
                    </Typography>
                  </Box>
                }
                subheader={
                  <Box
                    sx={{ paddingLeft: 0 }}
                    display={"flex"}
                    alignItems={"center"}
                  >
                    <MaterialLink
                      component={Link}
                      to={`/user/${contract.customer}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <UnderlineLink
                        color={"text.primary"}
                        variant={"subtitle2"}
                        sx={{
                          fontWeight: "400",
                        }}
                      >
                        {contract.customer.display_name}
                      </UnderlineLink>
                    </MaterialLink>
                    <Typography
                      display={"inline"}
                      color={"text.primary"}
                      variant={"subtitle2"}
                    >
                      &nbsp;- {getRelativeTime(new Date(contract.timestamp))}{" "}
                      -&nbsp;
                    </Typography>
                    <Typography
                      display={"inline"}
                      color={"primary"}
                      variant={"subtitle2"}
                    >
                      {(+contract.cost).toLocaleString(undefined)} aUEC{" "}
                      {paymentTypeMessages.get(contract.payment_type)}
                    </Typography>
                  </Box>
                }
              />
              <CardContent sx={{ width: "auto", height: 120, paddingTop: 0 }}>
                {
                  // @ts-ignore
                  <Typography
                    sx={{
                      "-webkit-box-orient": "vertical",
                      display: "-webkit-box",
                      "-webkit-line-clamp": "4",
                      overflow: "hidden",
                      lineClamp: "4",
                      textOverflow: "ellipsis",
                      // whiteSpace: "pre-line"
                    }}
                  >
                    <MarkdownRender text={contract.description} />
                  </Typography>
                }
              </CardContent>
              <CardActions sx={{ padding: 2 }}>
                <Grid
                  container
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Chip
                    color={"primary"}
                    label={contract.kind}
                    sx={{ marginRight: 1, marginBottom: 1, padding: 1 }}
                    variant={"outlined"}
                    icon={orderIcons[contract.kind]}
                    onClick={
                      (event) => event.stopPropagation() // Don't highlight cell if button clicked
                    }
                  />

                  <Button color={"secondary"} variant={"contained"}>
                    See More
                  </Button>
                </Grid>
              </CardActions>
            </Card>
          </CardActionArea>
        </Fade>
      </Link>
    </Grid>
  )
}

export function ContractListings(props: { user?: string }) {
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(6)
  const [searchState] = useContractSearch()
  const { user } = props

  const ref = useRef<HTMLDivElement>(null)
  const { t } = useTranslation() // added

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      setPage(newPage)
      if (ref.current) {
        ref.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        })
      }
    },
    [ref],
  )

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const { data: contracts } = useGetPublicContractsQuery()

  const filteredListings = useMemo(
    () =>
      (contracts || [])
        .filter((listing) => {
          return (
            (!searchState.kind || searchState.kind === listing.kind) &&
            (!searchState.query ||
              listing.title
                .toLowerCase()
                .includes(searchState.query.toLowerCase()) ||
              listing.description
                .toLowerCase()
                .includes(searchState.query.toLowerCase())) &&
            (searchState.maxOffer == null ||
              listing.cost <= searchState.maxOffer) &&
            (!searchState.minOffer || listing.cost >= searchState.minOffer) &&
            (!searchState.paymentType ||
              listing.payment_type === searchState.paymentType)
          )
        })
        .filter((listing) => {
          return !user || listing.customer.username === user
        })
        .sort((a, b) => {
          switch (searchState.sort) {
            case "title":
              return a.title.localeCompare(b.title)
            case "price-low":
              return a.cost - b.cost
            case "price-high":
              return b.cost - a.cost
            case "date-new":
              return +a.timestamp - +b.timestamp
            case "date-old":
              return +b.timestamp - +a.timestamp
            default:
              return 0
          }
        })
        .filter((listing, idx) => idx <= perPage),
    [contracts, perPage, searchState, user],
  )

  return (
    <React.Fragment>
      <div ref={ref} />
      {(filteredListings || [])
        .filter(
          (item, index) =>
            index >= perPage * page && index < perPage * (page + 1),
        )
        .map((listing, index) => (
          <ContractListing contract={listing} key={listing.id} index={index} />
        ))}
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <TablePagination
          labelRowsPerPage={t("rows_per_page")}
          labelDisplayedRows={({ from, to, count }) =>
            t("displayed_rows", { from, to, count })
          }
          rowsPerPageOptions={[6, 10, 16]}
          component="div"
          count={filteredListings ? filteredListings.length : 0}
          rowsPerPage={perPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          color={"primary"}
          nextIconButtonProps={{ color: "primary" }}
          backIconButtonProps={{ color: "primary" }}
        />
      </Grid>
    </React.Fragment>
  )
}
