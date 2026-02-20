import React, { useCallback, useEffect, useRef, useState } from "react"
import { ContractorListItem } from "../../views/contractor/ContractorList"
import { ContractorSkeleton } from "../../components/skeletons"
import { Button, Divider, Grid, useMediaQuery } from "@mui/material"
import { HapticTablePagination } from "../../components/haptic"
import {
  ContractorSearchContext,
  ContractorSearchState,
} from "../../hooks/contractor/ContractorSearch"
import { ContractorSidebarContext } from "../../hooks/contractor/ContractorSidebar"
import { ContractorSidebar } from "../../views/contractor/ContractorSidebar"
import { marketDrawerWidth } from "../../features/market"
import FilterListIcon from "@mui/icons-material/FilterList"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { EmptyContractors } from "../../components/empty-states"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageContractors } from "../../features/contractor/hooks/usePageContractors"

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

  const pageData = usePageContractors({
    pageSize: perPage,
    index: page,
    ...searchState,
  })

  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  // Start closed on mobile (BottomSheet), open on desktop (Drawer)
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  useEffect(() => {
    setPage(0)
  }, [searchState])

  const skeleton = (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <ContractorSkeleton key={i} />
      ))}
    </>
  )

  return (
    <StandardPageLayout
      title={t("contractorsPage.title")}
      headerTitle={t("contractorsPage.title")}
      sidebarOpen={sidebarOpen}
      sidebarWidth={marketDrawerWidth}
      maxWidth="md"
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={skeleton}
    >
      <ContractorSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
        <ContractorSearchContext.Provider value={[searchState, setSearchState]}>
          {isMobile && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<FilterListIcon />}
              aria-label={t("toggle_contractor_sidebar")}
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
          )}

          <ContractorSidebar />
          <div ref={ref} />

          {pageData.error ? (
            <Grid item xs={12}>
              <EmptyContractors isError onRetry={() => pageData.refetch()} />
            </Grid>
          ) : pageData.isFetching ? (
            skeleton
          ) : pageData.data && pageData.data.items.length > 0 ? (
            pageData.data.items.map((item: any, index: number) => (
              <ContractorListItem
                contractor={item}
                key={item.name}
                index={index}
              />
            ))
          ) : (
            <Grid item xs={12}>
              <EmptyContractors
                isSearchResult={
                  !!(
                    searchState.query ||
                    searchState.fields?.length ||
                    searchState.rating
                  )
                }
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider light />
          </Grid>

          <Grid item xs={12}>
            <HapticTablePagination
              labelRowsPerPage={t("rows_per_page")}
              labelDisplayedRows={({ from, to, count }) =>
                t("displayed_rows", { from, to, count })
              }
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={pageData.isLoading ? 0 : pageData.data?.total || 0}
              rowsPerPage={perPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              color={"primary"}
              nextIconButtonProps={{ color: "primary" }}
              backIconButtonProps={{ color: "primary" }}
            />
          </Grid>
        </ContractorSearchContext.Provider>
      </ContractorSidebarContext.Provider>
    </StandardPageLayout>
  )
}
