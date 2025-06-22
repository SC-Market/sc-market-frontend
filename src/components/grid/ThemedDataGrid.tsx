import { DataGrid, DataGridProps } from "@mui/x-data-grid"
import React from "react"

export function ThemedDataGrid(props: DataGridProps) {
  return (
    <DataGrid
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
          color: "white",
        },
        ...props.sx,
      }}
    />
  )
}
