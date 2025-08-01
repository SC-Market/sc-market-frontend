import { HeaderTitle } from "../../components/typography/HeaderTitle"
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  ContractorListItem,
  ContractorSkeleton,
} from "../../views/contractor/ContractorList"
import { Divider, Grid, IconButton, TablePagination } from "@mui/material"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { useGetContractorsQuery } from "../../store/contractor"
import {
  ContractorSearchContext,
  ContractorSearchState,
} from "../../hooks/contractor/ContractorSearch"
import { ContractorSidebarContext } from "../../hooks/contractor/ContractorSidebar"
import { ContractorSidebar } from "../../views/contractor/ContractorSidebar"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { Page } from "../../components/metadata/Page"
import { useTranslation } from "react-i18next" // додано

export function Contractors() {
  const { t } = useTranslation() // додано
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
  })
  const { data: contractors, isLoading } = useGetContractorsQuery({
    pageSize: perPage,
    index: page,
    ...searchState,
  })

  const [drawerOpen] = useDrawerOpen()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    setPage(0)
  }, [searchState])

  return (
    <Page title={t("contractors")}>
      <ContractorSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
        <ContractorSearchContext.Provider value={[searchState, setSearchState]}>
          <IconButton
            color="secondary"
            aria-label="toggle market sidebar"
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

          <ContractorSidebar />
          <ContainerGrid maxWidth={"md"} sidebarOpen={true}>
            <div ref={ref} />
            <HeaderTitle>{t("contractors")}</HeaderTitle>
            {!isLoading
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
