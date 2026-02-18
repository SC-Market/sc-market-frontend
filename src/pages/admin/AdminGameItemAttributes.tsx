import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminGameItemAttributesView } from "../../views/admin/AdminGameItemAttributesView"
import { TextField, Button, Box, Typography, Grid, Paper } from "@mui/material"
import SearchIcon from "@mui/icons-material/SearchRounded"

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
    <StandardPageLayout
      title={t("admin.gameItemAttributes.title", "Game Item Attributes")}
      headerTitle={t("admin.gameItemAttributes.title", "Game Item Attributes")}
      sidebarOpen={true}
      maxWidth="xl"
    >
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
    </StandardPageLayout>
  )
}
