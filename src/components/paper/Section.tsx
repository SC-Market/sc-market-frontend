import { Box, Divider, Grid, GridProps, Paper, Typography } from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import React from "react"
import { useTheme } from "@mui/material/styles"

export function Section(
  props: {
    children: React.ReactNode
    fill?: boolean
    h?: number
    outline?: boolean
    pad?: boolean
    title?: string | React.ReactElement
    element_title?: React.ReactElement
    subtitle?: React.ReactElement
    disablePadding?: boolean
    innerJustify?: string
  } & GridProps,
) {
  const theme: ExtendedTheme = useTheme()

  const {
    fill,
    h,
    outline,
    pad,
    title,
    disablePadding,
    children,
    innerJustify,
    subtitle,
    element_title,
    ...gridprops
  } = props

  return (
    <Grid item {...gridprops}>
      <Paper
        sx={{
          height: fill ? "100%" : h,
          width: "100%",
        }}
      >
        <Grid container direction={"column"}>
          {(!!title || !!element_title) && (
            <>
              <Grid item sx={{ padding: 2 }}>
                <Box display={"flex"} justifyContent={"space-between"}>
                  <Typography
                    variant={"h6"}
                    align={"left"}
                    color={"text.secondary"}
                    sx={{ fontWeight: "bold" }}
                  >
                    {title}
                    {element_title}
                  </Typography>

                  {subtitle}
                </Box>
              </Grid>

              <Grid item>
                <Divider light />
              </Grid>
            </>
          )}
          <Grid item>
            <Grid
              container
              spacing={2}
              justifyContent={innerJustify || "center"}
              height={"100%"}
              sx={{
                boxSizing: "border-box",
                padding: disablePadding ? 0 : 2,
              }}
            >
              {children}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  )
}

export function FlatSection(props: {
  title: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Section xs={12}>
      <Grid item xs={12} lg={4}>
        <Typography
          variant={"h6"}
          align={"left"}
          color={"text.secondary"}
          sx={{ fontWeight: "bold" }}
        >
          {props.title}
        </Typography>
      </Grid>
      <Grid item xs={12} lg={8}>
        <Grid container spacing={2} justifyContent={"right"}>
          {props.children}
        </Grid>
      </Grid>
    </Section>
  )
}
