import SearchIcon from "@mui/icons-material/Search"
import React, { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { marketApi } from "../api/marketApi"
import { debounce } from "lodash"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Breakpoint } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';

interface ItemSearchAutocompleteProps {
  value: string | null
  onChange: (itemName: string | null, itemType: string | null) => void
  label?: string
  size?: "small" | "medium"
}

export function ItemSearchAutocomplete({
  value,
  onChange,
  label,
  size = "medium",
}: ItemSearchAutocompleteProps) {
  const { t } = useTranslation()
  const [searchTrigger] = marketApi.useLazySearchMarketListingsQuery()
  const [itemOptions, setItemOptions] = useState<
    Array<{ name: string; type: string }>
  >([])
  const [inputValue, setInputValue] = useState("")

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        if (searchQuery.length > 1) {
          const result = await searchTrigger({
            query: searchQuery,
            index: 0,
            page_size: 20,
            sort: "title",
          })
          if (result.data?.listings) {
            const uniqueItems = Array.from(
              new Map(
                result.data.listings
                  .filter((item) => item.item_name && item.item_type)
                  .map((item) => [
                    item.item_name,
                    { name: item.item_name!, type: item.item_type! },
                  ]),
              ).values(),
            )
            setItemOptions(uniqueItems)
          }
        } else {
          setItemOptions([])
        }
      }, 300),
    [searchTrigger],
  )

  useEffect(() => {
    debouncedSearch(inputValue)
  }, [inputValue, debouncedSearch])

  return (
    <Autocomplete
      size={size}
      options={itemOptions}
      value={itemOptions.find((opt) => opt.name === value) || null}
      inputValue={inputValue}
      onInputChange={(event, newValue) => {
        setInputValue(newValue)
      }}
      onChange={(event, newValue) => {
        onChange(newValue?.name || null, newValue?.type || null)
      }}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || t("MarketListingForm.searchItem", "Search Item")}
          color="secondary"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <IconButton size="small">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}
