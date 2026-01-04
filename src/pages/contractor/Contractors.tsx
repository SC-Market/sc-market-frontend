import { HeaderTitle } from "../../components/typography/HeaderTitle"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { ContractorListItem } from "../../views/contractor/ContractorList"
import { ContractorSkeleton } from "../../components/skeletons"
import {
  Button,
  Divider,
  Grid,
  IconButton,
  TablePagination,
  useMediaQuery,
} from "@mui/material"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { useGetContractorsQuery } from "../../store/contractor"
import {
  ContractorSearchContext,
  ContractorSearchState,
} from "../../hooks/contractor/ContractorSearch"
import { ContractorSidebarContext } from "../../hooks/contractor/ContractorSidebar"
import { ContractorSidebar } from "../../views/contractor/ContractorSidebar"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { marketDrawerWidth } from "../../hooks/market/MarketSidebar"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import FilterListIcon from "@mui/icons-material/FilterList"
import { Page } from "../../components/metadata/Page"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function Contractors() {
  const { t } = useTranslation()
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(0)

  const ref = useRef<HTMLDivElement>(null)

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

  const [searchState, setSearchState] = useState<ContractorSearchState>({
    query: "",
    fields: [],
    rating: 0,
    sorting: "date-reverse",
    language_codes: undefined,
  })
  const {
    data: contractors,
    isLoading,
    isFetching,
  } = useGetContractorsQuery({
    pageSize: perPage,
    index: page,
    ...searchState,
    language_codes:
      searchState.language_codes && searchState.language_codes.length > 0
        ? searchState.language_codes.join(",")
        : undefined,
  })

  const [drawerOpen] = useDrawerOpen()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    setPage(0)
  }, [searchState])

  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Page title={t("contractorsPage.title")}>
      <ContractorSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
        <ContractorSearchContext.Provider value={[searchState, setSearchState]}>
          {isMobile ? (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<FilterListIcon />}
              aria-label={t("toggle_market_sidebar")}
              onClick={() => {
                setSidebarOpen(true)
              }}
              sx={{
                position: "fixed",
                bottom: { xs: 80, sm: 24 },
                right: 24,
                zIndex: theme.zIndex.speedDial,
                borderRadius: 2,
                textTransform: "none",
                boxShadow: theme.shadows[4],
                backgroundColor: theme.palette.background.paper,
                "&:hover": {
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              {t("contractorsPage.filters", "Filters")}
            </Button>
          ) : (
            <IconButton
              color="secondary"
              aria-label={t("toggle_market_sidebar")}
              sx={{
                position: "absolute",
                zIndex: 50,
                left: (drawerOpen ? sidebarDrawerWidth : 0) + 24,
                top: 64 + 24,
                transition: "0.3s",
              }}
              onClick={() => {
                setSidebarOpen(true)
              }}
            >
              {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}

          <ContractorSidebar />
          <ContainerGrid maxWidth={"md"} sidebarOpen={sidebarOpen} sidebarWidth={marketDrawerWidth}>
            <div ref={ref} />
            <HeaderTitle>{t("contractorsPage.title")}</HeaderTitle>
            {!(isLoading || isFetching)
              ? (contractors || { items: [] }).items.map((item, index) => (
                  <ContractorListItem
                    contractor={item}
                    key={item.name}
                    index={index}
                  />
                ))
              : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <ContractorSkeleton key={i} />
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
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={isLoading ? 0 : contractors?.total || 0}
                rowsPerPage={perPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                color={"primary"}
                nextIconButtonProps={{ color: "primary" }}
                backIconButtonProps={{ color: "primary" }}
              />
            </Grid>
          </ContainerGrid>
        </ContractorSearchContext.Provider>
      </ContractorSidebarContext.Provider>
    </Page>
  )
}
