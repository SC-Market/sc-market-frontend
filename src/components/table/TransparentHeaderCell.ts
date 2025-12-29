import { styled } from "@mui/material/styles"
import { TableCell, tableCellClasses, Theme } from "@mui/material"

export const TransparentHeaderCell = styled(TableCell)(
  (props: { theme: Theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor:
        props.theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.05)",
      color: props.theme.palette.text.primary,
      textTransform: "uppercase",
      fontSize: "0.75em",
      fontWeight: "700",
      paddingTop: 1,
      paddingBottom: 1,
    },
    // [`&.${tableCellClasses.body}`]: {
    //     fontSize: 14,
    // },
  }),
)
