import React, { MouseEventHandler, ReactElement, useCallback } from "react"
import { Box, IconButton, TableCell, TableRow, Typography } from "@mui/material"
import { Section } from "../../components/paper/Section"
import { HeadCell, PaginatedTable } from "../../components/table/PaginatedTable"
import { useGetContractorWebhooksQuery } from "../../features/contractor/api/contractorApi"
import { useGetUserWebhooks } from "../../features/profile/api/profileApi"
import { useDeleteWebhook } from "../../features/notifications/hooks/useNotificationChannelActions"
import { useParams } from "react-router-dom"
import { OrderWebhook } from "../../features/contractor/domain/types"
import { DeleteRounded } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"

export const headCells: readonly HeadCell<OrderWebhook>[] = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Webhooks.name",
  },
  {
    id: "webhook_id",
    numeric: false,
    disablePadding: false,
    label: "",
    noSort: true,
  },
]

export function WebhookRow(props: {
  row: OrderWebhook
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
  org?: boolean
}): ReactElement {
  const { row, index, isItemSelected } = props // TODO: Add `assigned_to` column
  const { contractor_id } = useParams<{ contractor_id: string }>()

  const deleteWebhook = useDeleteWebhook(!!props.org, contractor_id)

  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const submitDelete = useCallback(async () => {
    await deleteWebhook(row.webhook_id)
    return false
  }, [deleteWebhook, row.webhook_id])

  return (
    <>
      <TableRow
        hover
        // onClick={onClick}
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        key={index}
        selected={isItemSelected}
        // component={Link} to={`/contract/${row.order_id}`}
        sx={{
          textDecoration: "none",
          color: "inherit",
          borderBottom: "none",
          border: "none",
        }}
      >
        <TableCell align={"left"}>
          <Box
            sx={{
              alignItems: "center",
              display: "inline-flex",
            }}
          >
            <Typography color={"text.secondary"} variant={"body1"}>
              {row.name}
            </Typography>
          </Box>
          <Box
            sx={{
              alignItems: "center",
              overflowWrap: "anywhere",
            }}
          >
            <Typography color={"text.primary"} variant={"body2"}>
              {row.webhook_url}
            </Typography>
          </Box>
        </TableCell>

        <TableCell
          padding="checkbox"
          onClick={(event) => {
            event.stopPropagation()
          }}
          align={"right"}
        >
          <IconButton
            aria-label={t(
              "notificationWebhooks.delete",
              "Delete webhook {{name}}",
              { name: row.name },
            )}
            onClick={(event) => {
              submitDelete()
              event.stopPropagation()
            }}
          >
            <DeleteRounded style={{ color: theme.palette.error.main }} />
          </IconButton>
        </TableCell>
      </TableRow>
    </>
  )
}

export function MyWebhooks(props: { org?: boolean }) {
  const { contractor_id } = useParams<{ contractor_id: string }>()
  const { data: contractorWebhooks } = useGetContractorWebhooksQuery(
    contractor_id!,
    { skip: !props.org || !contractor_id },
  )
  const { data: webhooks } = useGetUserWebhooks(undefined, {
    skip: !!props.org,
  })
  const { t } = useTranslation()

  return (
    <Section
      xs={12}
      md={12}
      lg={12}
      xl={12}
      disablePadding
      title={t("Webhooks.title")}
    >
      <PaginatedTable
        rows={webhooks || contractorWebhooks || []}
        initialSort={"name"}
        generateRow={(iprops) => <WebhookRow {...iprops} org={props.org} />}
        keyAttr={"webhook_id"}
        headCells={headCells.map((cell) => ({
          ...cell,
          label: cell.label ? t(cell.label) : cell.label,
        }))}
        disableSelect
      />
    </Section>
  )
}
