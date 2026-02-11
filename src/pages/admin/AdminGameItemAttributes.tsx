import React, { useState } from "react"
import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { useTranslation } from "react-i18next"
import { AdminGameItemAttributesView } from "../../views/admin/AdminGameItemAttributesView"
import SearchIcon from "@mui/icons-material/SearchRounded"

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

export function AdminGameItemAttributes() {
  const { t } = useTranslation()
  const [gameItemId, setGameItemId] = useState<string>("")
  const [selectedGameItemId, setSelectedGameItemId] = useState<string>("")

  const handleSearch = () => {
    if (gameItemId.trim()) {
      setSelectedGameItemId(gameItemId.trim())
    }
  }

  return (
    <Page title={t("admin.gameItemAttributes.title", "Game Item Attributes")}>
      <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t("admin.gameItemAttributes.searchTitle", "Search Game Item")}
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label={t("admin.gameItemAttributes.gameItemId", "Game Item ID")}
                value={gameItemId}
                onChange={(e) => setGameItemId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
                placeholder="Enter game item UUID"
              />
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                sx={{ minWidth: 120 }}
              >
                {t("admin.gameItemAttributes.search", "Search")}
              </Button>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              {t(
                "admin.gameItemAttributes.searchHelp",
                "Enter the UUID of a game item to view and edit its attributes",
              )}
            </Typography>
          </Paper>
        </Grid>

        {selectedGameItemId && (
          <AdminGameItemAttributesView gameItemId={selectedGameItemId} />
        )}

        {!selectedGameItemId && (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "text.secondary",
              }}
            >
              <Typography variant="h6">
                {t(
                  "admin.gameItemAttributes.noSelection",
                  "Enter a game item ID to get started",
                )}
              </Typography>
            </Box>
          </Grid>
        )}
      </ContainerGrid>
    </Page>
  )
}
