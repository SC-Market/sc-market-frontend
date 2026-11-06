import { useState, useLayoutEffect, useRef } from "react"
import {
  Autocomplete,
  Box,
  IconButton,
  TextField,
  Typography,
} from "@mui/material"
import { EditRounded as EditIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  GridRenderCellParams,
  GridRenderEditCellParams,
  useGridApiContext,
} from "@mui/x-data-grid"
import { type LocationInfo } from "../../../store/api/v2/market"
import { selectOnFocus } from "../../../util/selectOnFocus"
import { useFormatters } from "../../../util/format"

/* ── All Stock Lots Grid ── */

export function QuantityEditCell(params: GridRenderEditCellParams) {
  const apiRef = useGridApiContext()
  const inputRef = useRef<HTMLInputElement>(null)
  // The grid says which cell holds focus (editing started there); follow it.
  useLayoutEffect(() => {
    if (params.hasFocus) inputRef.current?.focus()
  }, [params.hasFocus])
  return (
    <TextField
      type="number"
      size="small"
      fullWidth
      inputRef={inputRef}
      onFocus={selectOnFocus}
      value={params.value ?? 0}
      onChange={(e) => {
        const val = Math.max(0, Number(e.target.value) || 0)
        apiRef.current.setEditCellValue({
          id: params.id,
          field: params.field,
          value: val,
        })
      }}
      inputProps={{ min: 0, step: 1 }}
      sx={{ "& input": { textAlign: "right" } }}
    />
  )
}

// Location edit cell: picks one of the locations the lots are at
export function LocationEditCell(
  props: GridRenderEditCellParams & { locations: LocationInfo[] },
) {
  const { t } = useTranslation()
  const { id, value, field, locations } = props
  const apiRef = useGridApiContext()
  const [inputValue, setInputValue] = useState("")
  const filtered = locations.filter((l) =>
    l.name.toLowerCase().includes(inputValue.toLowerCase()),
  )
  const selected = locations.find((l) => l.location_id === value) ?? null

  return (
    <Autocomplete
      value={selected}
      onChange={(_, v) =>
        apiRef.current.setEditCellValue({
          id,
          field,
          value: v?.location_id ?? null,
        })
      }
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      options={filtered}
      getOptionLabel={(o) => o.name}
      renderInput={(params) => (
        <TextField
          {...params}
          size="medium"
          placeholder={t("AllStockLots.selectLocation", "Select location...")}
        />
      )}
      fullWidth
      size="medium"
      disablePortal={false}
      sx={{ height: "100%" }}
    />
  )
}

/**
 * A lot's quantity with a visible edit affordance: the pencil starts editing
 * the cell (double-click does too).
 */
export function EditableCell({
  params,
  canEdit,
}: {
  params: GridRenderCellParams
  canEdit: boolean
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const apiRef = useGridApiContext()
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 0.5,
        width: "100%",
      }}
    >
      <Typography variant="body2" fontWeight={600}>
        {fmt.number(params.value)}
      </Typography>
      {canEdit && (
        <IconButton
          size="small"
          aria-label={t("AllStockLots.editQuantity", "Edit quantity")}
          onClick={(e) => {
            e.stopPropagation()
            apiRef.current.startCellEditMode({
              id: params.id,
              field: params.field,
            })
          }}
          sx={{ color: "text.secondary", p: 0.25 }}
        >
          <EditIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Box>
  )
}
