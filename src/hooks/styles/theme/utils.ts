import type { Theme } from "@mui/material"

export type ExtendedTheme = Theme

export const makeCut = (radius: string, _theme?: ExtendedTheme) => ({
  clipPath: `polygon(${radius} 0, 100% 0, 100% calc(100% - ${radius}), calc(100% - ${radius}) 100%, 0 100%, 0 ${radius})`,
})

export const makeReverseCut = (radius: string, theme?: ExtendedTheme) => ({
  clipPath: `polygon(${radius} 0, 100% 0, 100% calc(100% - ${radius}), calc(100% - ${radius}) 100%, 0 100%, 0 ${radius})`,
  boxSizing: "border-box" as const,
  filter: `drop-shadow( 0px  1px 0 ${theme?.palette?.outline?.main}) drop-shadow( 0px -1px 0 ${theme?.palette?.outline?.main}) drop-shadow( 1px  0px 0 ${theme?.palette?.outline?.main}) drop-shadow(-1px  0px 0 ${theme?.palette?.outline?.main})`,
})
