import React from "react"
import {
  Dialog, DialogContent, DialogTitle, IconButton, Typography, Box,
  Alert, Chip, Stack, Divider, Table, TableBody, TableCell,
  TableContainer, TableRow, Paper,
} from "@mui/material"
import { Close } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useGetShipDetailQuery } from "../../store/api/v2/market"
import { DetailPageSkeleton } from "./GameDataSkeletons"
import { ShipSilhouette, getShipColor } from "../wiki/ShipSilhouette"
import { formatShipRole, formatShipCareer } from "../../util/shipDisplay"

interface Props {
  shipId: string | null
  open: boolean
  onClose: () => void
}

export function ShipDetailModal({ shipId, open, onClose }: Props) {
  const navigate = useNavigate()
  const { data: ship, isLoading, error } = useGetShipDetailQuery(
    { id: shipId! },
    { skip: !shipId },
  )

  const shipColor = ship ? getShipColor(ship.career, ship.role, ship.focus) : undefined

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" noWrap sx={{ flex: 1 }}>
          {ship?.name || "Ship Details"}
        </Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ minHeight: 400 }}>
        {isLoading && <DetailPageSkeleton />}
        {error && <Alert severity="error">Failed to load ship details.</Alert>}

        {ship && (
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="flex-start">
              <Box
                sx={{
                  width: { xs: "100%", sm: 200 },
                  flexShrink: 0,
                  height: 140,
                  bgcolor: "background.default",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    bgcolor: shipColor,
                    opacity: 0.08,
                  },
                }}
              >
                {ship.ship_code ? (
                  <ShipSilhouette shipCode={ship.ship_code} career={ship.career} role={ship.role} focus={ship.focus} height={120} opacity={0.9} />
                ) : ship.image_url ? (
                  <Box component="img" src={ship.image_url} alt={ship.name}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
                  {ship.manufacturer && <Chip label={ship.manufacturer} color="primary" />}
                  {ship.career && <Chip label={formatShipCareer(ship.career)} color="secondary" variant="outlined" />}
                  {ship.role && <Chip label={formatShipRole(ship.role)} variant="outlined"
                    sx={{ borderColor: shipColor, color: shipColor }} />}
                  {ship.focus && !ship.role && <Chip label={ship.focus} />}
                  {ship.size && <Chip label={`Size ${ship.size}`} />}
                </Stack>

                <Stack direction="row" spacing={3} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                  {ship.crew_size != null && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Crew:</strong> {ship.crew_size}
                    </Typography>
                  )}
                  {(ship.length_m != null || ship.width_m != null || ship.height_m != null) && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Dimensions:</strong>{" "}
                      {[ship.length_m, ship.width_m, ship.height_m]
                        .filter(v => v != null)
                        .map(v => `${v}m`)
                        .join(" × ")}
                    </Typography>
                  )}
                </Stack>

                {ship.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                    {ship.description.replace(/\\n/g, "\n")}
                  </Typography>
                )}
              </Box>
            </Stack>

            {Object.keys(ship.attributes).length > 0 && (
              <>
                <Divider />
                <Typography variant="subtitle2">Specifications</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      {Object.entries(ship.attributes)
                        .filter(([key]) => !key.includes("loadout") && key !== "description" && key !== "ship_focus")
                        .slice(0, 12)
                        .map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell component="th" scope="row" sx={{ fontWeight: "bold", width: "40%" }}>
                              {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                            </TableCell>
                            <TableCell>
                              {typeof value === "object" ? JSON.stringify(value) : String(value)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  )
}
