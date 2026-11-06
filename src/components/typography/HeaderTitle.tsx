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
  const { xs, lg, xl, md, center, component = "h1", ...rest } = props
  return (
    <Grid
      item
      xs={xs || 12}
      lg={lg}
      xl={xl}
      md={md}
      justifyContent={center ? "center" : "left"}
      ref={ref}
    >
      <Typography
        variant={"h4"}
        component={component as React.ElementType}
        sx={{ fontWeight: "bold" }}
        color={"text.secondary"}
        {...rest}
      />
    </Grid>
  )
})

HeaderTitle.displayName = "HeaderTitle"
