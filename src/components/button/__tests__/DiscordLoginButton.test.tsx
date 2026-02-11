import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Popover from '@mui/material/Popover';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CreateRounded from '@mui/icons-material/CreateRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';

// Type declaration for require in Jest tests
declare const require: (module: string) => unknown

// Mock i18n hook to return the key fallback
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}))

// Mock constants to avoid import.meta.env in tests
jest.mock("../../../util/constants", () => ({
  BACKEND_URL: "http://backend",
}))

// Mock icon to avoid MUI SvgIcon rendering complexity
jest.mock("../../icon/DiscordIcon", () => ({
  Discord: () => <span data-testid="discord-icon" />,
}))

describe("DiscordLoginButton", () => {
  const installHrefSpy = () => {
    const hrefSet = jest.fn()
    Object.defineProperty(window, "location", {
      value: {
        set href(v: string) {
          hrefSet(v)
        },
        get href() {
          return ""
        },
      },
      writable: true,
    })
    return hrefSet
  }

  it("navigates to discord auth URL on click using current path", () => {
    const hrefSet = installHrefSpy()
    const { DiscordLoginButton } = require("../DiscordLoginButton") as {
      DiscordLoginButton: React.ComponentType
    }

    render(
      <MemoryRouter initialEntries={["/foo"]}>
        <DiscordLoginButton />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("button", { name: /Login with Discord/i }))

    expect(hrefSet).toHaveBeenCalledWith(
      "http://backend/auth/discord?path=%2Ffoo",
    )
  })

  it("uses /market when on root path", () => {
    const hrefSet = installHrefSpy()
    const { DiscordLoginButton } = require("../DiscordLoginButton") as {
      DiscordLoginButton: React.ComponentType
    }

    render(
      <MemoryRouter initialEntries={["/"]}>
        <DiscordLoginButton />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("button", { name: /Login with Discord/i }))

    expect(hrefSet).toHaveBeenCalledWith(
      "http://backend/auth/discord?path=%2Fmarket",
    )
  })
})
