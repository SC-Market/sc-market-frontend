import React, { useCallback } from "react"
import { useMarketSearch } from ".."
import { useTranslation } from "react-i18next"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Breakpoint from '@mui/material/Breakpoint';
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
import ButtonBase from '@mui/material/ButtonBase';
import CardMedia from '@mui/material/CardMedia';
import Modal from '@mui/material/Modal';
import AppBar from '@mui/material/AppBar';
import { PaperProps } from '@mui/material/PaperProps';
import Toolbar from '@mui/material/Toolbar';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ImageListItem, { imageListItemClasses } from '@mui/material/ImageListItem';
import CardActionArea from '@mui/material/CardActionArea';
import Menu from '@mui/material/Menu';
import TablePagination from '@mui/material/TablePagination';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';
import AddCircleOutlineRounded from '@mui/icons-material/AddCircleOutlineRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import ShareRounded from '@mui/icons-material/ShareRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';

export function MarketPageNav(props: {
  ref: React.RefObject<HTMLDivElement>
  total: number
}) {
  const { ref, total } = props
  const [searchState, setSearchState] = useMarketSearch()
  const { t } = useTranslation()

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      setSearchState({
        ...searchState,
        index: newPage,
      })
      if (ref.current) {
        ref.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        })
      }
    },
    [ref, searchState, setSearchState],
  )

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchState({
        ...searchState,
        page_size: +event.target.value,
      })
    },
    [searchState, setSearchState],
  )

  return (
    <TablePagination
      labelRowsPerPage={t("rows_per_page")}
      labelDisplayedRows={({ from, to, count }) =>
        t("displayed_rows", { from, to, count })
      }
      rowsPerPageOptions={[12, 24, 48, 96]}
      component="div"
      count={total}
      rowsPerPage={searchState.page_size || 48}
      page={searchState.index || 0}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      color={"primary"}
      nextIconButtonProps={{ color: "primary" }}
      backIconButtonProps={{ color: "primary" }}
    />
  )
}
