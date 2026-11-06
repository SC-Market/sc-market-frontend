/**
 * SplitAllocationView Component
 *
 * The order page's Stock Allocation tab. For each of the order's V2 lines:
 * - Left: the lots of the same listing item and variant with free units
 * - Right: the lots the line's units are allocated from
 *
 * Everything goes through V2 /api/v2/orders/{orderId}/allocations (read,
 * auto-allocate, set a lot's allocation, release), which only the order's
 * seller side may use. Allocating takes units out of the lot; releasing puts
 * them back.
 */

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Link,
  Stack,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../../../components/avatar/ImageAvatar"
import { InventoryRounded } from "@mui/icons-material"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import {
  useGetOrderAllocationsQuery,
  type OrderAllocationLine,
} from "../../../../store/api/v2/market"
import {
  apiErrorMessage,
  useOrderAllocationActions,
} from "../../hooks/useOrderAllocationActions"
import { MARKET_PATHS } from "../../../../routes/paths"
import { AvailableLots, AllocatedLots } from "./AllocationLotLists"

interface SplitAllocationViewProps {
  orderId: string
}

/** Label for a non-editable (terminal) order status. */
function orderStatusLabel(status: string, t: TFunction) {
  if (status === "fulfilled") return t("allocationUi.orderStatus.fulfilled")
  if (status === "cancelled") return t("allocationUi.orderStatus.cancelled")
  return status
}

function allocationModeLabel(mode: "auto" | "manual" | "none", t: TFunction) {
  if (mode === "auto") return t("allocationUi.mode.auto")
  if (mode === "manual") return t("allocationUi.mode.manual")
  return t("allocationUi.mode.none")
}

export function SplitAllocationView({ orderId }: SplitAllocationViewProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useGetOrderAllocationsQuery({ orderId })
  const {
    setLotAllocation,
    autoAllocateAll: handleAutoAllocate,
    releaseAll: handleReleaseAll,
    autoLoading,
    releaseLoading,
  } = useOrderAllocationActions(orderId)

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress aria-label={t("allocationUi.loading")} />
      </Box>
    )
  }
  if (error || !data) {
    return (
      <Alert severity="error">
        {apiErrorMessage(error, t("allocationUi.loadFailed"))}
      </Alert>
    )
  }

  const fullyAllocated = data.total_allocated >= data.total_requested

  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          mb={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">{t("allocationUi.title")}</Typography>
            <Chip
              label={`${data.total_allocated} / ${data.total_requested}`}
              color={fullyAllocated ? "success" : "warning"}
              size="small"
            />
            <Chip
              label={t("allocationUi.modeLabel", {
                mode: allocationModeLabel(data.allocation_mode, t),
              })}
              size="small"
              variant="outlined"
            />
          </Stack>
          {data.editable && data.lines.length > 0 && (
            <Stack direction="row" spacing={1}>
              <LoadingButton
                variant="contained"
                size="small"
                loading={autoLoading}
                disabled={fullyAllocated}
                onClick={handleAutoAllocate}
              >
                {t("allocationUi.autoAllocate")}
              </LoadingButton>
              <LoadingButton
                variant="outlined"
                size="small"
                loading={releaseLoading}
                disabled={data.total_allocated === 0}
                onClick={handleReleaseAll}
              >
                {t("allocationUi.releaseAll")}
              </LoadingButton>
            </Stack>
          )}
        </Stack>

        {!data.editable && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {t("allocationUi.locked", {
              status: orderStatusLabel(data.order_status, t),
            })}
          </Alert>
        )}
        {data.lines.length === 0 && (
          <Typography color="text.secondary">
            {t("allocationUi.noItems")}
          </Typography>
        )}

        <Stack spacing={3}>
          {data.lines.map((line) => (
            <LineAllocation
              key={line.order_item_id}
              line={line}
              editable={data.editable}
              onSet={setLotAllocation}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

function LineAllocation({
  line,
  editable,
  onSet,
}: {
  line: OrderAllocationLine
  editable: boolean
  onSet: (
    line: OrderAllocationLine,
    lotId: string,
    quantity: number,
    success: string,
  ) => Promise<void>
}) {
  const { t } = useTranslation()
  const remaining = line.quantity - line.quantity_allocated
  const heldByLot = new Map<string, number>()
  for (const a of line.allocations)
    if (a.lot_id) heldByLot.set(a.lot_id, a.quantity)

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        <ImageAvatar
          alt=""
          src={line.listing_photo || undefined}
          sx={{ width: 32, height: 32, borderRadius: 1 }}
          variant="rounded"
        >
          <InventoryRounded />
        </ImageAvatar>
        <Link
          href={MARKET_PATHS.listing(line.listing_id)}
          target="_blank"
          underline="hover"
        >
          <Typography variant="subtitle1">{line.listing_title}</Typography>
        </Link>
        <Chip
          label={line.variant.display_name}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`${line.quantity_allocated} / ${line.quantity}`}
          color={remaining <= 0 ? "success" : "warning"}
          size="small"
        />
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            {t("allocationUi.availableStock")}
          </Typography>
          <AvailableLots
            line={line}
            remaining={remaining}
            editable={editable}
            onAllocate={(lotId, qty) =>
              onSet(
                line,
                lotId,
                (heldByLot.get(lotId) ?? 0) + qty,
                t("allocationUi.stockAllocated"),
              )
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            {t("allocationUi.allocated")}
          </Typography>
          <AllocatedLots
            allocations={line.allocations}
            editable={editable}
            onDeallocate={async (alloc, qty) => {
              if (alloc.lot_id)
                await onSet(
                  line,
                  alloc.lot_id,
                  alloc.quantity - qty,
                  t("allocationUi.allocationUpdated"),
                )
            }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
