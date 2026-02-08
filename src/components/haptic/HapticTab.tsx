import { Tab, TabProps } from "@mui/material"
import { haptic } from "../../util/haptics"

export function HapticTab<C extends React.ElementType>(
  props: TabProps<C, { component?: C }>,
) {
  const { onClick, ...rest } = props

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    haptic.selection()
    onClick?.(event)
  }

  return <Tab {...rest} onClick={handleClick} />
}
