import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { AttributeFilterSection } from "../AttributeFilterSection"

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
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import CreateRounded from '@mui/icons-material/CreateRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';

// Mock i18n
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}))

describe("AttributeFilterSection", () => {
  describe("select type", () => {
    it("renders single-select dropdown", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="size"
          displayName="Component Size"
          attributeType="select"
          allowedValues={["4", "5", "6"]}
          selectedValues={[]}
          onChange={onChange}
        />,
      )

      expect(screen.getByLabelText("Component Size filter")).toBeInTheDocument()
    })

    it("renders with selected value", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="size"
          displayName="Component Size"
          attributeType="select"
          allowedValues={["4", "5", "6"]}
          selectedValues={["4"]}
          onChange={onChange}
        />,
      )

      expect(screen.getByLabelText("Component Size filter")).toBeInTheDocument()
    })
  })

  describe("multiselect type", () => {
    it("renders Autocomplete for few options", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="class"
          displayName="Component Class"
          attributeType="multiselect"
          allowedValues={["Military", "Stealth", "Industrial"]}
          selectedValues={[]}
          onChange={onChange}
        />,
      )

      expect(
        screen.getByLabelText("Component Class filter"),
      ).toBeInTheDocument()
    })

    it("renders Autocomplete for many options", () => {
      const onChange = jest.fn()
      const manyValues = Array.from({ length: 10 }, (_, i) => `Value ${i}`)
      render(
        <AttributeFilterSection
          attributeName="manufacturer"
          displayName="Manufacturer"
          attributeType="multiselect"
          allowedValues={manyValues}
          selectedValues={[]}
          onChange={onChange}
        />,
      )

      expect(screen.getByLabelText("Manufacturer filter")).toBeInTheDocument()
    })

    it("renders with selected values as chips", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="class"
          displayName="Component Class"
          attributeType="multiselect"
          allowedValues={["Military", "Stealth"]}
          selectedValues={["Military"]}
          onChange={onChange}
        />,
      )

      expect(
        screen.getByLabelText("Component Class filter"),
      ).toBeInTheDocument()
      expect(screen.getByText("Military")).toBeInTheDocument()
    })
  })

  describe("range type", () => {
    it("renders min and max inputs", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="size"
          displayName="Component Size"
          attributeType="range"
          allowedValues={null}
          selectedValues={[]}
          onChange={onChange}
        />,
      )

      expect(screen.getByText("Component Size")).toBeInTheDocument()
      expect(
        screen.getByLabelText("Component Size minimum"),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText("Component Size maximum"),
      ).toBeInTheDocument()
    })

    it("handles min value change", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="size"
          displayName="Component Size"
          attributeType="range"
          allowedValues={null}
          selectedValues={[]}
          onChange={onChange}
        />,
      )

      const minInput = screen.getByLabelText("Component Size minimum")
      fireEvent.change(minInput, { target: { value: "4" } })

      expect(onChange).toHaveBeenCalledWith(["4"])
    })

    it("handles max value change", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="size"
          displayName="Component Size"
          attributeType="range"
          allowedValues={null}
          selectedValues={["4"]}
          onChange={onChange}
        />,
      )

      const maxInput = screen.getByLabelText("Component Size maximum")
      fireEvent.change(maxInput, { target: { value: "8" } })

      expect(onChange).toHaveBeenCalledWith(["4", "8"])
    })
  })
})
