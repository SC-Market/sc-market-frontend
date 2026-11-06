import React, { useCallback, useEffect, useRef, useState } from "react"
import { ContractorListItem } from "../../views/contractor/ContractorList"
import { ContractorCardsSkeleton } from "../../components/skeletons"
import { Divider, Grid } from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { useHydratedInitialState } from "../../hooks/ssr/useHydratedInitialState"
import {
  ContractorSearchContext,
  ContractorSearchState,
} from "../../features/contractor/hooks/ContractorSearch"
import { ContractorSidebarContext } from "../../features/contractor/hooks/ContractorSidebar"
import { ContractorSidebar } from "../../views/contractor/ContractorSidebar"
import { FiltersFAB } from "../../components/mobile/FiltersFAB"
import { useTranslation } from "react-i18next"
import { EmptyContractors } from "../../components/empty-states"
import { SidebarPageLayout } from "../../components/layout/SidebarPageLayout"
import { usePageContractors } from "../../features/contractor/hooks/usePageContractors"
import { contractorsSeoText } from "../../seo/hubHeads"
import { usePageReady } from "../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../components/metadata/pageReadyStore"
import { NumberedPagination } from "../../components/pagination/NumberedPagination"

export function Contractors() {
  const { t } = useTranslation()
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(0)

  const ref = useRef<HTMLDivElement>(null)

  const handleChangePage = useCallback(
    (newPage: number) => {
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

  const handleChangeRowsPerPage = (rowsPerPage: number) => {
    setPerPage(rowsPerPage)
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
  // The org directory is this page's primary content.
  usePageReady(isPrimaryLoading(pageData))

  const isMobile = useIsMobile()
  // Start closed on mobile (BottomSheet), open on desktop (Drawer)
  const [sidebarOpen, setSidebarOpen] = useHydratedInitialState(!isMobile)

  useEffect(() => {
    setPage(0)
  }, [searchState])

  return (
    <SidebarPageLayout
      title={contractorsSeoText(t).title}
      headerTitle={t("contractorsPage.title")}
      sidebar={
        <ContractorSidebarContext.Provider
          value={[sidebarOpen, setSidebarOpen]}
        >
          <ContractorSearchContext.Provider
            value={[searchState, setSearchState]}
          >
            {isMobile && (
              <FiltersFAB
                onClick={() => setSidebarOpen(true)}
                label={t("toggle_contractor_sidebar")}
              />
            )}
            <ContractorSidebar />
          </ContractorSearchContext.Provider>
        </ContractorSidebarContext.Provider>
      }
    >
      <ContractorSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
        <ContractorSearchContext.Provider value={[searchState, setSearchState]}>
          <div ref={ref} />
          {pageData.error ? (
            <EmptyContractors isError onRetry={() => pageData.refetch()} />
          ) : pageData.isFetching ? (
            <ContractorCardsSkeleton />
          ) : pageData.data && pageData.data.items.length > 0 ? (
            <Grid container spacing={2}>
              {pageData.data.items.map((item, index) => (
                <ContractorListItem
                  contractor={item}
                  key={item.name}
                  index={index}
                />
              ))}
            </Grid>
          ) : (
            <EmptyContractors
              isSearchResult={
                !!(
                  searchState.query ||
                  searchState.fields?.length ||
                  searchState.rating
                )
              }
            />
          )}

          <Divider light sx={{ mt: 2 }} />

          <NumberedPagination
            count={pageData.isLoading ? 0 : pageData.data?.total || 0}
            page={page}
            rowsPerPage={perPage}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ mt: 2 }}
          />
        </ContractorSearchContext.Provider>
      </ContractorSidebarContext.Provider>
    </SidebarPageLayout>
  )
}
