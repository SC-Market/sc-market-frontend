/**
 * Manage Stock Page
 *
 * Interface for managing stock lots and allocations with search sidebar
 */

import React, { useState } from "react"
import { HapticTab } from "../../../components/haptic"
import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import FilterListIcon from "@mui/icons-material/FilterList"
import { ContainerGrid } from "../../../components/layout/ContainerGrid"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { AllStockLotsGrid } from "./stock/AllStockLotsGrid"
import { AllAllocatedLotsGrid } from "./stock/AllAllocatedLotsGrid"
import { StockSearchArea } from "./stock/StockSearchArea"
import { StockSearchProvider } from "./stock/StockSearchContext"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme1 from '@mui/material/styles';
import Breakpoint from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import ButtonBase from '@mui/material/ButtonBase';
import CardMedia from '@mui/material/CardMedia';
import Modal from '@mui/material/Modal';
import AppBar from '@mui/material/AppBar';
import { PaperProps } from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';

export function ManageStockPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  const currentTab = location.pathname === "/market/manage" ? 0 : 1

  const handleTabChange = (_: any, newValue: number) => {
    if (newValue === 0) {
      navigate("/market/manage")
    } else {
      navigate("/market/manage-stock")
    }
  }

  return (
    <StockSearchProvider>
      {isMobile && (
        <BottomSheet
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          title={t("stock.filters", "Filters")}
          maxHeight="90vh"
        >
          <Box sx={{ overflowY: "auto", overflowX: "hidden", pb: 2 }}>
            <StockSearchArea />
          </Box>
        </BottomSheet>
      )}

      <ContainerGrid maxWidth="xl" sidebarOpen={true}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: 1,
            }}
          >
            {isMobile && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<FilterListIcon />}
                onClick={() => setSidebarOpen((prev) => !prev)}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                {t("market.filters", "Filters")}
              </Button>
            )}
            <Tabs value={currentTab} onChange={handleTabChange}>
              <HapticTab
                label={t("sidebar.manage_listings", "Manage Listings")}
              />
              <HapticTab label={t("sidebar.manage_stock", "Manage Stock")} />
            </Tabs>
          </Box>
        </Grid>

        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Paper>
              <StockSearchArea />
            </Paper>
          </Grid>
        )}

        <Grid item xs={12} md={isMobile ? 12 : 9}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              <AllStockLotsGrid />
            </Grid>

            <Grid item xs={12}>
              <AllAllocatedLotsGrid />
            </Grid>
          </Grid>
        </Grid>
      </ContainerGrid>
    </StockSearchProvider>
  )
}
