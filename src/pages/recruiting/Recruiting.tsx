import { HeaderTitle } from "../../components/typography/HeaderTitle"
import React, { useCallback, useRef, useState } from "react"
import {
  Button,
  Divider,
  Grid,
  IconButton,
  TablePagination,
  useMediaQuery,
} from "@mui/material"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import FilterListIcon from "@mui/icons-material/FilterList"
import { Page } from "../../components/metadata/Page"
import { RecruitingSidebar } from "../../views/recruiting/RecruitingSidebar"
import { RecruitingSidebarContext } from "../../hooks/recruiting/RecruitingSidebar"
import {
  RecruitingSearchContext,
  RecruitingSearchState,
} from "../../hooks/recruiting/RecruitingSearch"
import { marketDrawerWidth } from "../../features/market"
import {
  useRecruitingGetAllPostsQuery,
  useRecruitingGetPostByOrgQuery,
} from "../../store/recruiting"
import { RecruitingPostItem } from "../../views/recruiting/RecruitingList"
import { RecruitingPostSkeleton } from "../../components/skeletons"
import { NoteAddRounded } from "@mui/icons-material"
import { Link } from "react-router-dom"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { EmptyRecruiting } from "../../components/empty-states"
import { PullToRefresh } from "../../components/gestures"

export function Recruiting() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [perPage, setPerPage] = useState(15)
  const [page, setPage] = useState(0)
  const [searchState, setSearchState] = useState<RecruitingSearchState>({
    sorting: "activity",
    query: "",
    fields: [],
    rating: 0,
    language_codes: undefined,
  })

  const {
    data: posts,
    isLoading,
    isFetching,
    refetch,
  } = useRecruitingGetAllPostsQuery({
    index: page,
    pageSize: perPage,
    ...searchState,
    language_codes:
      searchState.language_codes && searchState.language_codes.length > 0
        ? searchState.language_codes.join(",")
        : undefined,
  })
  const [currentOrg] = useCurrentOrg()
  const { data: mypost, isSuccess: alreadyPosted } =
    useRecruitingGetPostByOrgQuery(currentOrg?.spectrum_id!, {
      skip: !currentOrg?.spectrum_id,
    })

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

  const [drawerOpen] = useDrawerOpen()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Page title={t("recruiting_orgs")}>
      <RecruitingSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
        <RecruitingSearchContext.Provider value={[searchState, setSearchState]}>
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
              {t("recruiting_sidebar.filters", "Filters")}
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

          <RecruitingSidebar />
          <ContainerGrid
            maxWidth={"md"}
            sidebarOpen={sidebarOpen}
            sidebarWidth={marketDrawerWidth}
          >
            <div ref={ref} />
            <Grid
              item
              container
              justifyContent={"space-between"}
              spacing={theme.layoutSpacing.layout}
              xs={12}
            >
              <HeaderTitle lg={7} xl={7}>
                {t("recruiting_orgs")}
              </HeaderTitle>
              {currentOrg && (
                <Grid item>
                  {alreadyPosted ? (
                    <Link
                      to={`/recruiting/post/${mypost?.post_id}/update`}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      <Button
                        startIcon={<NoteAddRounded />}
                        variant={"contained"}
                      >
                        {t("update_post")}
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      to={"/recruiting/post/create"}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      <Button
                        startIcon={<NoteAddRounded />}
                        variant={"contained"}
                      >
                        {t("create_post")}
                      </Button>
                    </Link>
                  )}
                </Grid>
              )}
            </Grid>
            <PullToRefresh
              onRefresh={async () => {
                await refetch()
              }}
              enabled={isMobile}
            >
              <Grid container spacing={theme.layoutSpacing.layout}>
                {!(isLoading || isFetching) ? (
                  (posts?.items || []).length === 0 ? (
                    <Grid item xs={12}>
                      <EmptyRecruiting
                        isSearchResult={
                          searchState.query !== "" ||
                          (searchState.fields &&
                            searchState.fields.length > 0) ||
                          searchState.rating > 0 ||
                          (searchState.language_codes &&
                            searchState.language_codes.length > 0)
                        }
                        showCreateAction={!!currentOrg}
                        sx={{ py: 4 }}
                      />
                    </Grid>
                  ) : (
                    (posts?.items || []).map((item, index) => (
                      <RecruitingPostItem
                        post={item}
                        key={index}
                        index={index}
                      />
                    ))
                  )
                ) : (
                  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <RecruitingPostSkeleton key={i} />
                  ))
                )}
              </Grid>
            </PullToRefresh>

            <Grid item xs={12}>
              <Divider light />
            </Grid>

            <Grid item xs={12}>
              <TablePagination
                labelRowsPerPage={t("rows_per_page")}
                labelDisplayedRows={({ from, to, count }) =>
                  t("displayed_rows", { from, to, count })
                }
                rowsPerPageOptions={[5, 15, 25]}
                component="div"
                count={posts?.total || 0}
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
        </RecruitingSearchContext.Provider>
      </RecruitingSidebarContext.Provider>
    </Page>
  )
}
