import React, { useState } from "react"
import {
  Box, Card, CardContent, Typography, Grid, Chip, Stack,
  ToggleButtonGroup, ToggleButton, Table, TableBody, TableCell, TableHead, TableRow, Paper,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useGetManufacturersQuery } from "../../store/api/v2/market"
import { BusinessCenter, GridViewRounded, ViewListRounded } from "@mui/icons-material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"

export function WikiManufacturerList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: manufacturers, isLoading, error } = useGetManufacturersQuery()
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    () => (localStorage.getItem("wiki-mfr-view") as "grid" | "list") || "grid",
  )

  const go = (code: string) => navigate(`/wiki/manufacturers/${encodeURIComponent(code)}`)

  return (
    <StandardPageLayout
      title={t("wiki.manufacturers.title", "Manufacturers")}
      headerTitle={t("wiki.manufacturers.title", "Manufacturers")}
      sidebarOpen={true} maxWidth="xl"
      isLoading={isLoading} skeleton={<CardGridSkeleton />}
      error={error || undefined}
    >
      <Grid item xs={12}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            {manufacturers ? `${manufacturers.length} manufacturers` : ""}
          </Typography>
          <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => { if (v) { setViewMode(v); localStorage.setItem("wiki-mfr-view", v) } }}>
            <ToggleButton value="grid"><GridViewRounded fontSize="small" /></ToggleButton>
            <ToggleButton value="list"><ViewListRounded fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {viewMode === "grid" ? (
          <Grid container spacing={2}>
            {manufacturers?.map((m) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={m.manufacturer}>
                <Card sx={{ cursor: "pointer", transition: "transform 0.15s", "&:hover": { transform: "translateY(-2px)", boxShadow: 4 } }}
                  onClick={() => go(m.manufacturer)}>
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <BusinessCenter color="primary" />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                          {m.display_name || m.manufacturer}
                        </Typography>
                        <Chip label={`${m.item_count} items`} size="small" color="primary" sx={{ mt: 0.5, height: 20, fontSize: "0.7rem" }} />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Manufacturer</TableCell>
                  <TableCell align="right">Items</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {manufacturers?.map((m) => (
                  <TableRow key={m.manufacturer} hover sx={{ cursor: "pointer" }} onClick={() => go(m.manufacturer)}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{m.display_name || m.manufacturer}</Typography>
                    </TableCell>
                    <TableCell align="right">{m.item_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Grid>
    </StandardPageLayout>
  )
}
