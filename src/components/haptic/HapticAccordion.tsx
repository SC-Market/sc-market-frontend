import { Accordion, AccordionProps } from "@mui/material"
import { haptic } from "../../util/haptics"

export function HapticAccordion(props: AccordionProps) {
  const { onChange, ...rest } = props

  const handleChange = (event: React.SyntheticEvent, expanded: boolean) => {
    haptic.light()
    onChange?.(event, expanded)
  }

  return <Accordion {...rest} onChange={handleChange} />
}
