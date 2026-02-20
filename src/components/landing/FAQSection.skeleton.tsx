import React from "react"
import { List, Paper, Skeleton, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function FAQSectionSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"row"}
      sx={{ flexWrap: "wrap" }}
      spacing={theme.layoutSpacing.compact}
    >
      <Skeleton
        variant="text"
        width={300}
        height={50}
        sx={{ maxWidth: "min(400px, 100%)", flexShrink: "0", marginBottom: 2 }}
      />
      <Paper sx={{ flexGrow: "1" }}>
        <List
          sx={{
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
            padding: 2,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width="100%"
              height={60}
              sx={{ mb: 1 }}
            />
          ))}
        </List>
      </Paper>
    </Stack>
  )
}
