import React from "react"
import { Button, ButtonProps } from "@mui/material"
import { UnderlineLink } from "../typography/UnderlineLink"

export function UnderlineButton(props: ButtonProps) {
  return (
    <Button {...props}>
      <UnderlineLink color={props.color}>{props.children}</UnderlineLink>
    </Button>
  )
}
