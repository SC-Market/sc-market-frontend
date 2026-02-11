import { BWINCORP_theme } from "./themes/BWINCORP"
import { MEDRUNNER_theme } from "./themes/MEDRUNNER"
import { RSNM_theme } from "./themes/RSNM"
import { INDUSTRIAL_theme } from "./themes/INDUSTRIAL"
import { NATURE_theme } from "./themes/NATURE"
import { NATURE_DARK_theme } from "./themes/NATURE_DARK"
import { CYBERPUNK_theme } from "./themes/CYBERPUNK"
import { OCEAN_theme } from "./themes/OCEAN"
import { SUNSET_theme } from "./themes/SUNSET"
import { SPACE_theme } from "./themes/SPACE"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export const CUSTOM_THEMES = new Map<string, Theme>()
CUSTOM_THEMES.set("BWINCORP", BWINCORP_theme)
CUSTOM_THEMES.set("MEDRUNNER", MEDRUNNER_theme)
CUSTOM_THEMES.set("RSNM", RSNM_theme)
CUSTOM_THEMES.set("INDUSTRIAL", INDUSTRIAL_theme)
CUSTOM_THEMES.set("NATURE", NATURE_theme)
CUSTOM_THEMES.set("NATURE_DARK", NATURE_DARK_theme)
CUSTOM_THEMES.set("CYBERPUNK", CYBERPUNK_theme)
CUSTOM_THEMES.set("OCEAN", OCEAN_theme)
CUSTOM_THEMES.set("SUNSET", SUNSET_theme)
CUSTOM_THEMES.set("SPACE", SPACE_theme)
