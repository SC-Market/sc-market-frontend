import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
const domains = new Map<string, string>()
domains.set("bwsc.sc-market.space", "BWINCORP")
domains.set("medrunner.sc-market.space", "MEDRUNNER")
domains.set("redscar.sc-market.space", "RSNM")
export const CURRENT_CUSTOM_ORG = domains.get(window.location.hostname)
