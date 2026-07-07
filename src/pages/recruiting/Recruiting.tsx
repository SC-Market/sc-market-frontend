import React, { useCallback, useRef, useState } from "react"
import { Alert, AlertTitle, Button, Divider, Grid, useMediaQuery } from "@mui/material"
import { HapticTablePagination } from "../../components/haptic"
import FilterListIcon from "@mui/icons-material/FilterList"
import { NoteAddRounded, RocketLaunchRounded } from "@mui/icons-material"
import { RecruitingSidebar } from "../../views/recruiting/RecruitingSidebar"
import { RecruitingSidebarContext } from "../../features/recruiting/hooks/RecruitingSidebar"
import {
  RecruitingSearchContext,
  RecruitingSearchState,
} from "../../features/recruiting/hooks/RecruitingSearch"
import { RecruitingPostItem } from "../../views/recruiting/RecruitingList"
import { RecruitingPostSkeleton } from "../../components/skeletons"
import type { RecruitingPost } from "../../features/recruiting/domain/types"
import { Link } from "react-router-dom"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { EmptyRecruiting } from "../../components/empty-states"
import { SidebarPageLayout } from "../../components/layout/SidebarPageLayout"
import { usePageRecruiting } from "../../features/recruiting/hooks/usePageRecruiting"

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

  const [currentOrg] = useCurrentOrg()
  const pageData = usePageRecruiting({
    page,
    perPage,
    searchState,
    currentOrgSpectrumId: currentOrg?.spectrum_id,
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

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const headerActions = currentOrg && pageData.data && (
    <>
      {pageData.data.alreadyPosted ? (
        <Link
          to={`/recruiting/post/${pageData.data.myPost?.post_id}/update`}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <Button startIcon={<NoteAddRounded />} variant={"contained"}>
            {t("update_post")}
          </Button>
        </Link>
      ) : (
        <Link
          to={"/recruiting/post/create"}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <Button startIcon={<NoteAddRounded />} variant={"contained"}>
            {t("create_post")}
          </Button>
        </Link>
      )}
    </>
  )

  return (
    <SidebarPageLayout
      title="Star Citizen Recruiting — Find Organizations | SC Market"
      description="Browse recruiting posts from Star Citizen organizations. Find your next crew."
      breadcrumbs={[{ label: t("recruiting_orgs") }]}
      showOrgInBreadcrumbs={true}
      headerTitle={t("recruiting_orgs")}
      headerActions={headerActions}
      sidebar={
        <RecruitingSidebarContext.Provider
          value={[sidebarOpen, setSidebarOpen]}
        >
          <RecruitingSearchContext.Provider
            value={[searchState, setSearchState]}
          >
            {isMobile && (
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
            )}
            <RecruitingSidebar />
          </RecruitingSearchContext.Provider>
        </RecruitingSidebarContext.Provider>
      }
    >
      <RecruitingSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
        <RecruitingSearchContext.Provider value={[searchState, setSearchState]}>
          <div ref={ref} />

            <Grid container spacing={theme.layoutSpacing.layout}>
              {/* SC Orgs promotion banner */}
              <Grid item xs={12}>
                <Alert
                  severity="info"
                  icon={<RocketLaunchRounded />}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      href="https://sc-orgs.space"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit SC Orgs
                    </Button>
                  }
                  sx={{ mb: 1 }}
                >
                  <AlertTitle>Looking for recruitment &amp; event management?</AlertTitle>
                  Check out <strong>SC Orgs</strong> at sc-orgs.space — our new dedicated platform for org recruitment, event scheduling, and community management.
                </Alert>
              </Grid>
              {!(pageData.isLoading || pageData.isFetching) ? (
                (pageData.data?.posts?.items || []).length === 0 ? (
                  <Grid item xs={12}>
                    <EmptyRecruiting
                      isSearchResult={
                        searchState.query !== "" ||
                        (searchState.fields && searchState.fields.length > 0) ||
                        searchState.rating > 0 ||
                        (searchState.language_codes &&
                          searchState.language_codes.length > 0)
                      }
                      showCreateAction={!!currentOrg}
                      sx={{ py: 4 }}
                    />
                  </Grid>
                ) : (
                  (pageData.data?.posts?.items ?? []).map(
                    (item: RecruitingPost, index: number) => (
                      <RecruitingPostItem
                        post={item}
                        key={index}
                        index={index}
                      />
                    ),
                  )
                )
              ) : (
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <RecruitingPostSkeleton key={i} />
                ))
              )}
            </Grid>

          <Divider light sx={{ mt: 2 }} />

          <HapticTablePagination
            labelRowsPerPage={t("rows_per_page")}
            labelDisplayedRows={({ from, to, count }) =>
              t("displayed_rows", { from, to, count })
            }
            rowsPerPageOptions={[5, 15, 25]}
            component="div"
            count={pageData.data?.posts?.total || 0}
            rowsPerPage={perPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            color={"primary"}
            nextIconButtonProps={{ color: "primary" }}
            backIconButtonProps={{ color: "primary" }}
            sx={{ mt: 2 }}
          />
        </RecruitingSearchContext.Provider>
      </RecruitingSidebarContext.Provider>
    </SidebarPageLayout>
  )
}
