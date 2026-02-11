import { ServiceSidebar } from "../contracts/ServiceSidebar"
import { ServiceListings } from "../contracts/ServiceListings"
import { useServiceSidebar } from "../../hooks/contract/ServiceSidebar"
import React from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { ServiceSearchArea } from "./ServiceSearchArea"

import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';

export function ServiceMarketView() {
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [open] = useServiceSidebar()

  return (
    <>
      {xs && <ServiceSidebar />}
      <Container maxWidth={"xxl"}>
        <Grid
          container
          spacing={theme.layoutSpacing.layout}
          justifyContent={"center"}
        >
          <Grid item xs={12}>
            <Divider light />
          </Grid>

          {/* Desktop: Persistent sidebar */}
          {!xs && (
            <Grid item md={2.25}>
              <Paper
                sx={{
                  position: "sticky",
                  top: theme.spacing(2),
                  maxHeight: `calc(100vh - ${theme.spacing(4)})`,
                  overflowY: "auto",
                }}
              >
                <ServiceSearchArea />
              </Paper>
            </Grid>
          )}
          <Grid item xs={12} md={xs ? 12 : 9.75}>
            <Grid
              container
              spacing={theme.layoutSpacing.layout}
              justifyContent={"center"}
            >
              <ServiceListings />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
