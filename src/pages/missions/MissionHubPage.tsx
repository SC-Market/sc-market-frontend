/**
 * /missions/<kind>/<slug>: one mission hub (a giver, faction, type or star
 * system): the intro generated from its data, this page of its missions
 * (?page=N, 100 per page, real links), the related hubs and the data's
 * freshness. Prerendered (src/prerender/paths.ts) with the bridge's head
 * (seo/missionHubs.ts); ?page=N gets its head from the bridge.
 */
import React, { useMemo } from "react"
import {
  Alert,
  Box,
  Chip,
  Grid,
  Link,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import {
  Link as RouterLink,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  useGetActiveVersionsQuery,
  useGetMissionHubQuery,
  type MissionHubDetailResponse,
  type MissionHubKind,
} from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { GameDataFreshness } from "../../components/game-data/GameDataFreshness"
import { MissionName } from "../../components/game-data/MissionName"
import { usePageReady } from "../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../components/metadata/pageReadyStore"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { SeoHead } from "../../seo/SeoHead"
import { headDescription, type PageHead } from "../../seo/pageHead"
import { pagedPath, queryIndexing } from "../../seo/queryIndexing"
import { missionGiver, missionRewardRange } from "../../seo/missionText"
import {
  buildMissionHubHead,
  MISSION_HUB_KINDS,
  MISSION_HUB_PAGE_SIZE,
  missionHubIntro,
  missionHubKindLabel,
  missionHubText,
} from "../../seo/missionHubs"
import { FRONTEND_URL } from "../../util/constants"
import { MissionHubIndexLinks } from "./MissionHubIndexLinks"
import { NumberedPagination } from "../../components/pagination/NumberedPagination"
import { scrollPageToTop } from "../../components/layout/pageScroll"

/** Hub pages are bare `?page=N` URLs: the links carry no other params. */
const NO_PARAMS = new URLSearchParams()

/** Page N's head: self-canonical, "— Page N" in the title (like the bridge's paginate). */
function pagedHead(head: PageHead, path: string, page: number): PageHead {
  if (page <= 1) return head
  const canonical = `${FRONTEND_URL}${pagedPath(path, page)}`
  const title = head.title?.replace(
    / \| SC Market$/,
    ` — Page ${page} | SC Market`,
  )
  return { ...head, title, canonical }
}

function isNotFound(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "status" in error &&
    (error as { status: unknown }).status === 404
  )
}

export function MissionHubPage({ kind }: { kind: MissionHubKind }) {
  const { slug = "" } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage || "en"
  const page = queryIndexing(searchParams).pageNumber ?? 1

  const query = useGetMissionHubQuery(
    { kind, slug, page, pageSize: MISSION_HUB_PAGE_SIZE },
    { skip: !slug },
  )
  const { data, isLoading, error } = query
  const { data: versions } = useGetActiveVersionsQuery()
  usePageReady(isPrimaryLoading(query))

  const path = GAME_DATA_PATHS.missionHub(kind, slug)
  const head = useMemo(
    () =>
      data
        ? pagedHead(
            buildMissionHubHead(data, FRONTEND_URL, t, lang, versions?.LIVE),
            path,
            page,
          )
        : null,
    [data, t, lang, versions?.LIVE, path, page],
  )
  const text = data ? missionHubText(data, t) : null
  const kindLabel = missionHubKindLabel(kind, t)
  const notFound = isNotFound(error)

  return (
    <StandardPageLayout
      title={head?.title ?? kindLabel}
      description={head ? headDescription(head) : ""}
      canonicalUrl={path}
      headerTitle={
        text?.heading ??
        (isLoading ? <Skeleton variant="text" width={240} /> : kindLabel)
      }
      breadcrumbs={[
        {
          label: t("missionHubs.missions", "Missions"),
          href: GAME_DATA_PATHS.missions,
        },
        { label: kindLabel, href: GAME_DATA_PATHS.missionHubs(kind) },
        { label: data?.name ?? slug },
      ]}
      sidebarOpen={true}
      maxWidth="lg"
    >
      <Grid item xs={12}>
        {head && <SeoHead head={head} />}
        {isLoading && <HubSkeleton />}
        {error && (
          <Alert severity={notFound ? "info" : "error"} sx={{ mb: 2 }}>
            {notFound
              ? t(
                  "missionHubs.notFound",
                  "This mission hub doesn't exist. Hubs change with game updates: browse them all below.",
                )
              : t(
                  "missionHubs.loadError",
                  "Failed to load this mission hub. Please try again.",
                )}
          </Alert>
        )}
        {data && <HubBody hub={data} page={page} lang={lang} />}
        <MissionHubIndexLinks />
        <GameDataFreshness />
      </Grid>
    </StandardPageLayout>
  )
}

function HubBody({
  hub,
  page,
  lang,
}: {
  hub: MissionHubDetailResponse
  page: number
  lang: string
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const path = GAME_DATA_PATHS.missionHub(hub.kind, hub.slug)
  const related = MISSION_HUB_KINDS.filter(
    (k) => k !== hub.kind && hub[k].length > 0,
  )

  return (
    <>
      <Box
        component="section"
        aria-label={t("missionHubs.missionList", "Missions")}
        sx={{ mb: 2 }}
      >
        {missionHubIntro(hub, t, lang).map((line) => (
          <Typography
            key={line}
            variant="body1"
            color="text.secondary"
            component="p"
            sx={{ mb: 0.75 }}
          >
            {line}
          </Typography>
        ))}
      </Box>

      <Typography variant="h6" component="h2" sx={{ mt: 2, mb: 1 }}>
        {t("missionHubs.missionList", "Missions")}
      </Typography>
      <Paper variant="outlined" sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ "& td, & th": { py: 0.75, px: 1 } }}>
          <TableHead>
            <TableRow>
              <TableCell>
                {t("missionHubs.columns.mission", "Mission")}
              </TableCell>
              <TableCell>{t("missionHubs.columns.system", "System")}</TableCell>
              <TableCell>{t("missionHubs.columns.type", "Type")}</TableCell>
              <TableCell>{t("missionHubs.columns.giver", "Giver")}</TableCell>
              <TableCell>
                {t("missionHubs.columns.legality", "Legality")}
              </TableCell>
              <TableCell align="right">
                {t("missionHubs.columns.reward", "Reward")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hub.missions.map((m) => {
              const giver = missionGiver(m)
              const illegal = m.is_illegal || m.legal_status === "ILLEGAL"
              return (
                <TableRow key={m.mission_id} hover>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Link
                      component={RouterLink}
                      to={GAME_DATA_PATHS.mission(
                        encodeURIComponent(m.mission_code),
                      )}
                      underline="hover"
                      color="inherit"
                    >
                      <MissionName
                        name={m.mission_name}
                        giver={giver}
                        variant="body2"
                        fontWeight={600}
                        component="span"
                      />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {m.star_system || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {m.career_type || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                      {giver || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {illegal ? (
                      <Chip
                        label={t("missionHubs.illegal", "Illegal")}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    ) : m.is_illegal === false || m.legal_status === "LEGAL" ? (
                      <Chip
                        label={t("missionHubs.legal", "Legal")}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      color="success.main"
                      fontWeight={600}
                      noWrap
                    >
                      {missionRewardRange(m, lang) ?? "—"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Paper>

      <NumberedPagination
        count={hub.mission_count}
        page={page - 1}
        rowsPerPage={MISSION_HUB_PAGE_SIZE}
        onPageChange={(newPage) => {
          navigate(pagedPath(path, newPage + 1))
          scrollPageToTop()
        }}
        link={{ path, searchParams: NO_PARAMS }}
        sx={{ mt: 1.5, px: 0 }}
      />

      {related.length > 0 && (
        <Box
          component="section"
          aria-labelledby="mission-hub-related"
          sx={{ mt: 3 }}
        >
          <Typography
            id="mission-hub-related"
            variant="h6"
            component="h2"
            sx={{ mb: 1 }}
          >
            {t("missionHubs.related", "Related mission hubs")}
          </Typography>
          {related.map((k) => (
            <Box key={k} sx={{ mb: 1.5 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                component="h3"
                sx={{ mb: 0.5 }}
              >
                {missionHubKindLabel(k, t)}
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {hub[k].map((other) => (
                  <Chip
                    key={other.slug}
                    label={`${other.name} (${other.mission_count})`}
                    component={RouterLink}
                    to={GAME_DATA_PATHS.missionHub(k, other.slug)}
                    clickable
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      )}
    </>
  )
}

function HubSkeleton() {
  return (
    <Box>
      {[90, 70, 60].map((w) => (
        <Skeleton key={w} variant="text" width={`${w}%`} />
      ))}
      <Skeleton variant="rounded" height={420} sx={{ mt: 2 }} />
    </Box>
  )
}
