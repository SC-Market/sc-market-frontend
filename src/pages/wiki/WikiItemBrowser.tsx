/**
 * Wiki Item Browser — grid/list mode with dense, uniform cards
 */

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from "@mui/material"
import { GridViewRounded, ViewListRounded } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { useSearchItemsQuery, WikiItemSearchResult } from "../../store/api/v2/market"
import { useNavigate } from "react-router-dom"
import { useDebounce } from "../../hooks/useDebounce"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { FALLBACK_IMAGE_URL } from "../../util/constants"
import { getFactionIcon } from "../../util/gameIcons"

const CARD_HEIGHT = 220

function ItemGridCard({ item, onClick }: { item: WikiItemSearchResult; onClick: () => void }) {
  return (
    <Card
      sx={{
        cursor: "pointer",
        height: CARD_HEIGHT,
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
      }}
      onClick={onClick}
    >
      <CardMedia
        component="img"
        height="100"
        image={item.image_url || item.thumbnail_path || getFactionIcon(item.manufacturer) || FALLBACK_IMAGE_URL}
        alt={item.name}
        sx={{ objectFit: "contain", bgcolor: "background.default", p: 0.5 }}
        onError={({ currentTarget }) => { currentTarget.onerror = null; currentTarget.src = FALLBACK_IMAGE_URL }}
      />
      <CardContent sx={{ p: 1.5, pt: 1, flex: 1, overflow: "hidden", "&:last-child": { pb: 1.5 } }}>
        <Typography variant="subtitle2" noWrap fontWeight={600} title={item.name}>
          {item.name}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
          {item.type && <Chip label={item.display_type || item.type} size="small" color="primary" sx={{ height: 20, fontSize: "0.7rem" }} />}
          {item.size && <Chip label={`S${item.size}`} size="small" sx={{ height: 20, fontSize: "0.7rem" }} />}
          {item.grade && <Chip label={item.grade} size="small" sx={{ height: 20, fontSize: "0.7rem" }} />}
        </Stack>
        {item.manufacturer && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: 0.5, display: "block" }}>
            {item.manufacturer}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

function ItemListRow({ item, onClick }: { item: WikiItemSearchResult; onClick: () => void }) {
  return (
    <TableRow hover sx={{ cursor: "pointer" }} onClick={onClick}>
      <TableCell sx={{ py: 0.75, width: 40 }}>
        <Avatar
          src={item.image_url || item.thumbnail_path || getFactionIcon(item.manufacturer) || FALLBACK_IMAGE_URL}
          variant="rounded"
          sx={{ width: 32, height: 32, bgcolor: "background.default" }}
          imgProps={{ style: { objectFit: "contain" } }}
        />
      </TableCell>
      <TableCell sx={{ py: 0.75 }}>
        <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
      </TableCell>
      <TableCell sx={{ py: 0.75 }}>
        <Chip label={item.display_type || item.type || "—"} size="small" color="primary" sx={{ height: 20, fontSize: "0.7rem" }} />
      </TableCell>
      <TableCell sx={{ py: 0.75 }}>
        {item.size ? `S${item.size}` : "—"}
      </TableCell>
      <TableCell sx={{ py: 0.75 }}>
        {item.grade || "—"}
      </TableCell>
      <TableCell sx={{ py: 0.75 }}>
        <Typography variant="caption" color="text.secondary">{item.manufacturer || "—"}</Typography>
      </TableCell>
    </TableRow>
  )
}

export function WikiItemBrowser() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState("")
  const [type, setType] = useState("")
  const [size, setSize] = useState("")
  const [grade, setGrade] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const debouncedSearch = useDebounce(searchText, 300)

  const { data, isLoading, error } = useSearchItemsQuery({
    text: debouncedSearch || undefined,
    type: type || undefined,
    size: size || undefined,
    grade: grade || undefined,
    manufacturer: manufacturer || undefined,
    page,
    pageSize: viewMode === "list" ? 30 : 20,
  })

  const handleItemClick = (itemId: string) => navigate(`/wiki/items/${itemId}`)
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0

  return (
    <StandardPageLayout
      title={t("wiki.items.title", "Game Items Database")}
      headerTitle={t("wiki.items.title", "Game Items Database")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        {/* Filters */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ pb: "12px !important" }}>
            <Grid container spacing={1.5} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField fullWidth size="small" label="Search items" value={searchText}
                  onChange={(e) => { setSearchText(e.target.value); setPage(1) }} placeholder="Search by name..." />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select value={type} label="Type" onChange={(e) => { setType(e.target.value); setPage(1) }}>
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="WeaponGun">Weapon</MenuItem>
                    <MenuItem value="Shield">Shield</MenuItem>
                    <MenuItem value="PowerPlant">Power Plant</MenuItem>
                    <MenuItem value="Cooler">Cooler</MenuItem>
                    <MenuItem value="QuantumDrive">QD</MenuItem>
                    <MenuItem value="Armor">Armor</MenuItem>
                    <MenuItem value="Commodity">Commodity</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={1.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Size</InputLabel>
                  <Select value={size} label="Size" onChange={(e) => { setSize(e.target.value); setPage(1) }}>
                    <MenuItem value="">All</MenuItem>
                    {[1,2,3,4,5].map(s => <MenuItem key={s} value={String(s)}>S{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={1.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Grade</InputLabel>
                  <Select value={grade} label="Grade" onChange={(e) => { setGrade(e.target.value); setPage(1) }}>
                    <MenuItem value="">All</MenuItem>
                    {["A","B","C","D"].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField fullWidth size="small" label="Manufacturer" value={manufacturer}
                  onChange={(e) => { setManufacturer(e.target.value); setPage(1) }} placeholder="e.g. Aegis" />
              </Grid>
              <Grid item xs="auto">
                <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)}>
                  <ToggleButton value="grid"><GridViewRounded fontSize="small" /></ToggleButton>
                  <ToggleButton value="list"><ViewListRounded fontSize="small" /></ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {isLoading && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>Failed to load items.</Alert>}

        {data && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              {data.total.toLocaleString()} items
            </Typography>

            {viewMode === "grid" ? (
              <Grid container spacing={1.5}>
                {data.items.map((item) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
                    <ItemGridCard item={item} onClick={() => handleItemClick(item.id)} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 40 }} />
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Manufacturer</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.items.map((item) => (
                      <ItemListRow key={item.id} item={item} onClick={() => handleItemClick(item.id)} />
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}

            {data.items.length === 0 && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography color="text.secondary">No results found. Try adjusting your filters.</Typography>
              </Box>
            )}

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
              </Box>
            )}
          </>
        )}
      </Grid>
    </StandardPageLayout>
  )
}
