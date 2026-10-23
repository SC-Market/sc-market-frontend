import React, { useState } from "react"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import FilterListIcon from "@mui/icons-material/FilterList"
import {
  Button,
  Grid,
  IconButton,
  Box,
  Typography,
} from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { ServiceSidebar } from "../../views/contracts/ServiceSidebar"
import { ServiceSidebarContext } from "../../features/contracting/hooks/ServiceSidebar"
import { ServiceListings } from "../../views/contracts/ServiceListings.lazy"
import { Link } from "react-router-dom"
import { CreateRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageServices } from "../../features/contracting/hooks/usePageServices"

export function Services() {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(true)
  const pageData = usePageServices()

  const headerContent = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {isMobile ? (
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<FilterListIcon />}
          aria-label={t("services.toggleSidebar")}
          onClick={() => {
            setOpen((prev) => !prev)
          }}
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          {t("services.filters", "Filters")}
        </Button>
      ) : (
        <IconButton
          color="secondary"
          aria-label={t("services.toggleSidebar")}
          onClick={() => {
            setOpen((prev) => !prev)
          }}
          sx={{
            transition: "0.3s",
          }}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      )}
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", margin: 0 }}
        color={"text.secondary"}
      >
        {t("services.contractorServices")}
      </Typography>
    </Box>
  )

  const headerActions = (
    <Link
      to={"/order/service/create"}
      style={{ color: "inherit", textDecoration: "none" }}
    >
      <Button
        color={"secondary"}
        startIcon={<CreateRounded />}
        variant={"contained"}
        size={"large"}
      >
        {t("services.createService")}
      </Button>
    </Link>
  )

  return (
    <StandardPageLayout
      title={t("services.contractsTitle")}
      sidebarOpen={true}
      maxWidth="lg"
      isLoading={pageData.isLoading}
      error={pageData.error}
      headerTitle={headerContent}
      headerActions={headerActions}
    >
      <ServiceSidebarContext.Provider value={[open, setOpen]}>
        <ServiceSidebar />
        <ServiceListings />
      </ServiceSidebarContext.Provider>
    </StandardPageLayout>
  )
}
