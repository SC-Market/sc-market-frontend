import { Box, Divider, Grid, GridProps, Paper, Typography } from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import React from "react"
import { useTheme } from "@mui/material/styles"

export const Section = React.forwardRef<
  HTMLDivElement,
  {
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
  } & GridProps
>((props, ref) => {
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
    <Grid item {...gridprops} ref={ref}>
      <Paper
        sx={{
          height: fill ? "100%" : h,
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Grid container direction={"column"}>
          {(!!title || !!element_title) && (
            <>
              <Grid item sx={{ padding: 2, maxWidth: "100%" }}>
                {/* wrap: on a phone the subtitle controls (search fields)
                    go below the title instead of squeezing it */}
                <Box
                  display={"flex"}
                  justifyContent={"space-between"}
                  flexWrap={"wrap"}
                  gap={1}
                >
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
          {/* width: the column container's wrapping flex line grows to its
              widest item (and MUI sets max-width: none on column items), so
              without it wide content (a table on a phone) made this item
              wider than the Paper and was clipped instead of fitting. */}
          <Grid
            item
            sx={{
              overflow: "hidden",
              minWidth: 0,
              maxWidth: "100%",
              width: "100%",
            }}
          >
            <Grid
              container
              spacing={theme.layoutSpacing.component}
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
})

Section.displayName = "Section"

export function FlatSection(props: {
  title: React.ReactNode
  children: React.ReactNode
}) {
  const theme = useTheme<ExtendedTheme>()
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
      <Grid item xs={12} lg={8} sx={{ pr: 2 }}>
        <Grid
          container
          spacing={theme.layoutSpacing.component}
          justifyContent={"right"}
        >
          {props.children}
        </Grid>
      </Grid>
    </Section>
  )
}
