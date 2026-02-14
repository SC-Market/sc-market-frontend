import { DataGridProps } from "@mui/x-data-grid"
import React from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { LazyDataGrid } from "./LazyDataGrid"

export function ThemedDataGrid(props: DataGridProps) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <LazyDataGrid
      {...props}
      sx={{
        borderColor: "outline.main",
        [`& .MuiDataGrid-cell, & .MuiDataGrid-filler > *, & .MuiDataGrid-footerContainer, & .MuiDataGrid-columnSeparator, & .MuiDataGrid-toolbar`]:
          {
            borderColor: "outline.main",
          },
        ".MuiDataGrid-columnSeparator": {
          color: "outline.main",
        },
        [".MuiDataGrid-menu"]: {
          color: theme.palette.background.light,
        },
        ...props.sx,
      }}
    />
  )
}
