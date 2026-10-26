import React, { Suspense, useCallback, useRef, useState } from "react"
import { Button, Grid } from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { HapticTablePagination } from "../../components/haptic"
import FilterListIcon from "@mui/icons-material/FilterList"
import { NoteAddRounded } from "@mui/icons-material"
import { RecruitingSidebar } from "../../views/recruiting/RecruitingSidebar"
import { RecruitingSidebarContext } from "../../features/recruiting/hooks/RecruitingSidebar"
import {
  RecruitingSearchContext,
  RecruitingSearchState,
} from "../../features/recruiting/hooks/RecruitingSearch"
import { RecruitingPostItem } from "../../views/recruiting/RecruitingList"
import {
  RecruitingListFrame,
  RecruitingPostListSkeleton,
} from "../../components/skeletons/RecruitingListSkeleton"
import { PageBusy, usePageReady } from "../../components/metadata/PageReady"
import type { RecruitingPost } from "../../features/recruiting/domain/types"
import { Link } from "react-router-dom"
import { useSelectedOrg } from "../../hooks/login/useSelectedOrg"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { has_permission } from "../../features/contractor/domain/permissions"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { EmptyRecruiting } from "../../components/empty-states"
import { SidebarPageLayout } from "../../components/layout/SidebarPageLayout"
import { usePageRecruiting } from "../../features/recruiting/hooks/usePageRecruiting"
import { recruitingSeoText } from "../../seo/hubHeads"

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

  // Create/Update Post act for the org selected in the sidebar and need its
  // Manage Recruiting permission (same check as /recruiting/post/create).
  const { org: selectedOrg } = useSelectedOrg()
  const { data: profile } = useGetUserProfileQuery()
  const canRecruit = has_permission(selectedOrg, profile, "manage_recruiting", profile?.contractors)
  const pageData = usePageRecruiting({
    page,
    perPage,
    searchState,
    currentOrgSpectrumId: canRecruit ? selectedOrg?.spectrum_id : undefined,
  })
  // The header and filters are static; the page is ready once the posts are in.
  usePageReady(pageData.awaitingData)

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
  const isMobile = useIsMobile()

  const headerActions = canRecruit && pageData.data && (
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
      title={recruitingSeoText().title}
      description={recruitingSeoText().description}
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

          <RecruitingListFrame
            pagination={
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
            }
          >
            {!pageData.awaitingData ? (
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
                    showCreateAction={canRecruit}
                    sx={{ py: 4 }}
                  />
                </Grid>
              ) : (
                // The cards render their text with the lazy Markdown chunk:
                // keep the card skeletons (and the page busy) until it loads,
                // instead of suspending the whole page into the route skeleton.
                <Suspense
                  fallback={
                    <>
                      <PageBusy />
                      <RecruitingPostListSkeleton />
                    </>
                  }
                >
                  {(pageData.data?.posts?.items ?? []).map(
                    (item: RecruitingPost, index: number) => (
                      <RecruitingPostItem
                        post={item}
                        key={index}
                        index={index}
                      />
                    ),
                  )}
                </Suspense>
              )
            ) : (
              <RecruitingPostListSkeleton />
            )}
          </RecruitingListFrame>
        </RecruitingSearchContext.Provider>
      </RecruitingSidebarContext.Provider>
    </SidebarPageLayout>
  )
}
