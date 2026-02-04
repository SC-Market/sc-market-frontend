import { Grid, Typography, TypographyProps } from "@mui/material"
import React from "react"

export const HeaderTitle = React.forwardRef<
  HTMLDivElement,
  {
    lg?: number
    xl?: number
    xs?: number
    md?: number
    center?: boolean
  } & TypographyProps
>((props, ref) => {
  const { xs, lg, xl, md, center, ...rest } = props
  return (
    <Grid
      item
      xs={props.xs || 12}
      lg={props.lg}
      xl={props.xl}
      md={props.md}
      justifyContent={props.center ? "center" : "left"}
      ref={ref}
    >
      <Typography
        variant={"h4"}
        sx={{ fontWeight: "bold" }}
        color={"text.secondary"}
        {...rest}
      />
    </Grid>
  )
})

HeaderTitle.displayName = "HeaderTitle"
