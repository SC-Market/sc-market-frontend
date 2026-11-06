import { Theme, Typography, TypographyProps } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import React from "react"
import { linkColor } from "../../hooks/styles/Theme"

export function UnderlineLink(
  props: { to?: string; target?: string; href?: string } & TypographyProps,
) {
  const theme: Theme = useTheme()

  return (
    <Typography
      color={"inherit"}
      {...props}
      sx={{
        display: "inline",
        position: "relative",
        textDecoration: "none",
        fontSize: "inherit",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        ":after": {
          content: '""',
          position: "absolute",
          width: "100%",
          transform: "scaleX(0)",
          height: "2px",
          bottom: 0,
          left: 0,
          backgroundColor: linkColor(theme),
          transformOrigin: "bottom right",
          transition: "transform 0.25s ease-out",
        },
        ":hover:after": {
          transform: "scaleX(1)",
          transformOrigin: "bottom left",
        },
        ":focus:after": {
          transform: "scaleX(1)",
          transformOrigin: "bottom left",
        },
        ...props.sx,
      }}
    >
      {props.children}
    </Typography>
  )
}
