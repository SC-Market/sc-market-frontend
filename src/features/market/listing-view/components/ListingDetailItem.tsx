import { Typography } from "@mui/material"
import { Stack } from "@mui/system"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"

export function ListingDetailItem(props: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Stack
      direction={"row"}
      alignItems={"center"}
      spacing={theme.layoutSpacing.compact}
    >
      {props.icon}
      <Typography color={"text.primary"} variant={"subtitle2"}>
        {props.children}
      </Typography>
    </Stack>
  )
}
