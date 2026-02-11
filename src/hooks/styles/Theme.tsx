/**
 * Theme barrel – re-exports from the modular theme package.
 * Import from here for backward compatibility.
 */
import { SxProps } from '@mui/material/SxProps';

import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
export { makeCut, makeReverseCut, refTheme, themeBase, mainThemeOptions, mainTheme, lightThemeOptions, lightTheme, MISSING_IMAGE_URL } from "./theme/index";

export type { ExtendedTheme } from "./theme/index"
