import { useState } from "react"
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../../../components/avatar/ImageAvatar"
import {
  KeyboardArrowLeftRounded,
  KeyboardArrowRightRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import {
  type OrderAllocation,
  type OrderAllocationLine,
  type OrderAllocationLot,
} from "../../../../store/api/v2/market"

function lotLocation(lot: OrderAllocationLot | null, t: TFunction) {
  return lot?.location?.name || t("allocationUi.unknownLocation")
}

function LotOwner({ lot }: { lot: OrderAllocationLot | null }) {
  if (!lot?.owner) {
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    )
  }
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <ImageAvatar
        alt=""
        src={lot.owner.avatar_url || undefined}
        sx={{ width: 24, height: 24 }}
      />
      <Typography variant="body2" color="text.secondary">
        {lot.owner.display_name || lot.owner.username}
      </Typography>
    </Box>
  )
}

export function AvailableLots({
  line,
  remaining,
  editable,
  onAllocate,
}: {
  line: OrderAllocationLine
  remaining: number
  editable: boolean
  onAllocate: (lotId: string, quantity: number) => Promise<void>
}) {
  const { t } = useTranslation()
  const [qtys, setQtys] = useState<Record<string, number>>({})

  if (line.available_lots.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("allocationUi.noFreeStock")}
      </Typography>
    )
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{t("allocationUi.colLocation")}</TableCell>
          <TableCell>{t("allocationUi.colUser")}</TableCell>
          <TableCell width={130}>{t("allocationUi.colQuantity")}</TableCell>
          <TableCell width={50} />
        </TableRow>
      </TableHead>
      <TableBody>
        {line.available_lots.map((lot) => {
          const qty = qtys[lot.lot_id] || 0
          const wouldExceed = qty > remaining
          const disabled = !editable || remaining <= 0
          return (
            <TableRow key={lot.lot_id}>
              <TableCell>
                {lotLocation(lot, t)}
                {!lot.listed && (
                  <Chip
                    label={t("allocationUi.unlisted")}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                )}
              </TableCell>
              <TableCell>
                <LotOwner lot={lot} />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  inputMode="numeric"
                  value={qty || ""}
                  disabled={disabled}
                  error={wouldExceed}
                  helperText={
                    wouldExceed
                      ? t("allocationUi.lineNeedsMore", { count: remaining })
                      : undefined
                  }
                  inputProps={{
                    "aria-label": t("allocationUi.quantityToAllocateFrom", {
                      location: lotLocation(lot, t),
                    }),
                  }}
                  onChange={(e) =>
                    setQtys({
                      ...qtys,
                      [lot.lot_id]: Math.max(
                        0,
                        Math.min(
                          lot.quantity_available,
                          parseInt(e.target.value) || 0,
                        ),
                      ),
                    })
                  }
                  onFocus={() => {
                    if (!qty) {
                      setQtys({
                        ...qtys,
                        [lot.lot_id]: Math.min(
                          lot.quantity_available,
                          remaining,
                        ),
                      })
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        / {lot.quantity_available}
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 130 }}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  aria-label={t("allocationUi.allocateFrom", {
                    location: lotLocation(lot, t),
                  })}
                  disabled={disabled || qty === 0 || wouldExceed}
                  onClick={async () => {
                    await onAllocate(lot.lot_id, qty)
                    setQtys({ ...qtys, [lot.lot_id]: 0 })
                  }}
                >
                  <KeyboardArrowRightRounded />
                </IconButton>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export function AllocatedLots({
  allocations,
  editable,
  onDeallocate,
}: {
  allocations: OrderAllocation[]
  editable: boolean
  onDeallocate: (allocation: OrderAllocation, quantity: number) => Promise<void>
}) {
  const { t } = useTranslation()
  const [qtys, setQtys] = useState<Record<string, number>>({})

  if (allocations.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("allocationUi.nothingAllocated")}
      </Typography>
    )
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell width={50} />
          <TableCell width={130}>{t("allocationUi.colQuantity")}</TableCell>
          <TableCell>{t("allocationUi.colLocation")}</TableCell>
          <TableCell>{t("allocationUi.colUser")}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {allocations.map((alloc) => {
          const qty = qtys[alloc.allocation_id] || 0
          // A deleted lot has nowhere to return units to.
          const disabled = !editable || !alloc.lot_id
          return (
            <TableRow key={alloc.allocation_id}>
              <TableCell>
                <IconButton
                  size="small"
                  aria-label={t("allocationUi.returnUnitsTo", {
                    location: lotLocation(alloc.lot, t),
                  })}
                  disabled={disabled || qty === 0}
                  onClick={async () => {
                    await onDeallocate(alloc, qty)
                    setQtys({ ...qtys, [alloc.allocation_id]: 0 })
                  }}
                >
                  <KeyboardArrowLeftRounded />
                </IconButton>
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  inputMode="numeric"
                  value={qty || ""}
                  disabled={disabled}
                  inputProps={{
                    "aria-label": t("allocationUi.quantityToReturnTo", {
                      location: lotLocation(alloc.lot, t),
                    }),
                  }}
                  onChange={(e) =>
                    setQtys({
                      ...qtys,
                      [alloc.allocation_id]: Math.max(
                        0,
                        Math.min(alloc.quantity, parseInt(e.target.value) || 0),
                      ),
                    })
                  }
                  onFocus={() => {
                    if (!qty)
                      setQtys({
                        ...qtys,
                        [alloc.allocation_id]: alloc.quantity,
                      })
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        / {alloc.quantity}
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 130 }}
                />
              </TableCell>
              <TableCell>
                {alloc.lot
                  ? lotLocation(alloc.lot, t)
                  : t("allocationUi.deletedLot")}
              </TableCell>
              <TableCell>
                <LotOwner lot={alloc.lot} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
