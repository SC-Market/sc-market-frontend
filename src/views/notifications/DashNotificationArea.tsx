import { Section } from "../../components/paper/Section"
import { Grid, List, TablePagination } from "@mui/material"
import React, { useState, useCallback } from "react"
import { NotificationEntry } from "../../components/navbar/NotificationsButton"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useGetNotificationsQuery } from "../../store/notification"
import { useTranslation } from "react-i18next"
import { EmptyNotifications } from "../../components/empty-states"
import { PullToRefresh } from "../../components/gestures"
import { useMediaQuery } from "@mui/material"

export function DashNotificationArea() {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const { data: notificationsData, refetch } = useGetNotificationsQuery({
    page: page, // API uses 0-based indexing
    pageSize: pageSize,
  })
  const { t } = useTranslation()

  const notifications = notificationsData?.notifications || []
  const total = notificationsData?.pagination?.total || 0

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPageSize(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  return (
    <Section
      title={t("DashNotificationArea.notifications")}
      disablePadding
      xs={12}
    >
      {/*<Box sx={{width: '100%', padding: 2}}>*/}
      <Grid item xs={12}>
        <PullToRefresh
          onRefresh={async () => {
            await refetch()
          }}
          enabled={isMobile}
        >
          {notifications.length === 0 ? (
            <Grid item xs={12}>
              <EmptyNotifications sx={{ py: 4 }} />
            </Grid>
          ) : (
            <List
              sx={{
                "&>:first-child": {
                  borderTop: `1px solid ${theme.palette.outline.main}`,
                },
                "&>:last-child": {
                  borderBottom: "none",
                },
                "& > *": {
                  borderBottom: `1px solid ${theme.palette.outline.main}`,
                },
                padding: 0,
                maxHeight: 400,
                overflowY: "scroll",
                width: "100%",
                maxWidth: "100%",
              }}
            >
              {(notifications || []).map(
                (notification, idx) => (
                  // <Fade in={true} style={{transitionDelay: `${50 + 50 * idx}ms`, transitionDuration: '500ms'}} key={idx}>
                  <NotificationEntry notif={notification} key={idx} />
                ),
                // </Fade>
              )}
            </List>
          )}
        </PullToRefresh>
      </Grid>

      <Grid item xs={12}>
        <TablePagination
          labelRowsPerPage={t("rows_per_page")}
          labelDisplayedRows={({ from, to, count }) =>
            t("displayed_rows", { from, to, count })
          }
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          color={"primary"}
          nextIconButtonProps={{ color: "primary" }}
          backIconButtonProps={{ color: "primary" }}
        />
      </Grid>

      {/*</Box>*/}
    </Section>
  )
}
