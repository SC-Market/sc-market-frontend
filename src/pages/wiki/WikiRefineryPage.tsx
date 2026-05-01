import React from "react"
import {
  Card, CardContent, Chip, Grid, Typography, Stack,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, Box,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useGetRefiningMethodsQuery, type RefiningMethod } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { TableSkeleton } from "../../components/game-data/GameDataSkeletons"
import { Speed, HighQuality, Science } from "@mui/icons-material"

const speedColor: Record<string, string> = { Fast: "#4caf50", Normal: "#ff9800", Slow: "#f44336" }
const qualityColor: Record<string, string> = { Careful: "#4caf50", Normal: "#ff9800", Wasteful: "#f44336" }
const speedDesc: Record<string, string> = {
  Fast: "Shortest processing time — get your refined materials quickly",
  Normal: "Balanced processing time",
  Slow: "Longest processing time — but often paired with better yield",
}
const qualityDesc: Record<string, string> = {
  Careful: "Highest yield — minimal material loss during refining",
  Normal: "Balanced yield — moderate material loss",
  Wasteful: "Lowest yield — significant material loss, but cheaper",
}

function MethodCard({ method }: { method: RefiningMethod }) {
  return (
    <Card sx={{ height: "100%", borderLeft: 3, borderColor: qualityColor[method.quality] || "grey.500" }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          {method.name}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Chip
            icon={<Speed sx={{ fontSize: 14 }} />}
            label={method.speed}
            size="small"
            sx={{ bgcolor: speedColor[method.speed] + "22", color: speedColor[method.speed], fontWeight: 600, height: 24 }}
          />
          <Chip
            icon={<HighQuality sx={{ fontSize: 14 }} />}
            label={method.quality}
            size="small"
            sx={{ bgcolor: qualityColor[method.quality] + "22", color: qualityColor[method.quality], fontWeight: 600, height: 24 }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block">
          {speedDesc[method.speed]}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {qualityDesc[method.quality]}
        </Typography>
      </CardContent>
    </Card>
  )
}

export function WikiRefineryPage() {
  const { t } = useTranslation()
  const { data, isLoading, error } = useGetRefiningMethodsQuery()
  const methods = data?.methods || []

  // Group by speed
  const bySpeed: Record<string, RefiningMethod[]> = {}
  for (const m of methods) {
    const s = m.speed || "Unknown"
    if (!bySpeed[s]) bySpeed[s] = []
    bySpeed[s].push(m)
  }

  return (
    <StandardPageLayout
      title="Refining Methods"
      headerTitle="Refining Methods"
      breadcrumbs={[
        { label: "Wiki", href: "/wiki/items" },
        { label: "Refining Methods" },
      ]}
      isLoading={isLoading}
      skeleton={<TableSkeleton rows={9} />}
      error={error || undefined}
      sidebarOpen={true}
      maxWidth="lg"
    >
      <Grid item xs={12}>
        <Typography variant="body1" color="text.secondary" paragraph>
          Refining methods determine how quickly your raw ore is processed and how much refined material you receive.
          Fast methods save time but may waste material. Careful methods maximize yield but take longer.
        </Typography>
      </Grid>

      {/* Comparison Table */}
      <Grid item xs={12}>
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Method</strong></TableCell>
                <TableCell align="center"><strong>Speed</strong></TableCell>
                <TableCell align="center"><strong>Yield</strong></TableCell>
                <TableCell><strong>Best For</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {methods.map((m) => (
                <TableRow key={m.name} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={m.speed} size="small" sx={{ bgcolor: speedColor[m.speed] + "22", color: speedColor[m.speed], fontWeight: 600, height: 22, fontSize: "0.75rem" }} />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={m.quality} size="small" sx={{ bgcolor: qualityColor[m.quality] + "22", color: qualityColor[m.quality], fontWeight: 600, height: 22, fontSize: "0.75rem" }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {m.speed === "Fast" && m.quality === "Careful" && "Best overall — fast with high yield"}
                      {m.speed === "Fast" && m.quality === "Normal" && "Quick turnaround, decent yield"}
                      {m.speed === "Fast" && m.quality === "Wasteful" && "Fastest possible, accept material loss"}
                      {m.speed === "Normal" && m.quality === "Careful" && "Popular choice — good yield, reasonable time"}
                      {m.speed === "Normal" && m.quality === "Normal" && "Balanced all-around"}
                      {m.speed === "Normal" && m.quality === "Wasteful" && "Quick-ish with lower yield"}
                      {m.speed === "Slow" && m.quality === "Careful" && "Maximum yield — worth the wait for expensive ores"}
                      {m.speed === "Slow" && m.quality === "Normal" && "Slow but steady"}
                      {m.speed === "Slow" && m.quality === "Wasteful" && "Slow AND wasteful — generally avoid"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>

      {/* Cards by Speed */}
      {["Fast", "Normal", "Slow"].map((speed) => (
        bySpeed[speed]?.length ? (
          <React.Fragment key={speed}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2 }}>
                <Chip label={speed} size="small" sx={{ bgcolor: speedColor[speed] + "22", color: speedColor[speed], fontWeight: 700, mr: 1 }} />
                {speed} Processing
              </Typography>
            </Grid>
            {bySpeed[speed].map((m) => (
              <Grid item xs={12} sm={6} md={4} key={m.name}>
                <MethodCard method={m} />
              </Grid>
            ))}
          </React.Fragment>
        ) : null
      ))}
    </StandardPageLayout>
  )
}
