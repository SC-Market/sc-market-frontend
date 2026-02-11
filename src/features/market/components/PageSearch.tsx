import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Section } from "../../../components/paper/Section"
import { ContainerGrid } from "../../../components/layout/ContainerGrid"
import { ExtendedTheme, MISSING_IMAGE_URL } from "../../../hooks/styles/Theme"
import { store } from "../../../store/store"
import throttle from "lodash/throttle"
import { wikiActionApi, WikiPage } from "../../../store/wiki"
import { useTheme } from "@mui/material/styles"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { MarkdownRender } from "../../../components/markdown/Markdown"
import { useTranslation } from "react-i18next"
import { BottomSheet } from "../../../components/mobile/BottomSheet"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme1 from '@mui/material/styles';
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
import ButtonBase from '@mui/material/ButtonBase';
import CardMedia from '@mui/material/CardMedia';
import Modal from '@mui/material/Modal';
import AppBar from '@mui/material/AppBar';
import { PaperProps } from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ImageListItem, { imageListItemClasses } from '@mui/material/ImageListItem';
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

const valid_categories = [
  "Category:Armor_set",
  "Category:Torso armor",
  "Category:Legs armor",
  "Category:Arms armor",
  "Category:Undersuits",
  "Category:Helmets",
  "Category:Personal weapons",
  "Category:HMGs",
  "Category:Pistols",
  "Category:Backpacks",
  "Category:Commodities",
  "Category:Commodity",
  "Category:Consumer goods",
  "Category:Unknown consumables",
  "Category:Components",
]

// Component for selecting a page option
function PageChoice(props: {
  page: WikiPage
  i: string | number
  onClick: () => void
}) {
  const { i, onClick, page } = props

  return (
    <ImageListItem key={i}>
      <ButtonBase onClick={onClick}>
        <Card>
          <CardMedia
            component="img"
            loading="lazy"
            height={200}
            width={200}
            image={(page?.thumbnail?.source || "").replace(/\d+px/, "512px")}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null
              currentTarget.src =
                "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
            }}
            alt={""}
            sx={{
              borderRadius: (theme) =>
                theme.spacing((theme as ExtendedTheme).borderRadius.image),
              transition: "0.5s",
            }}
          />
          <CardContent>
            <Typography variant={"h5"}>{page.title}</Typography>
          </CardContent>
        </Card>
      </ButtonBase>
    </ImageListItem>
  );
}

export function PageSearch(props: {
  open: boolean
  setOpen: (val: boolean) => void
  callback: (arg: WikiPage | null) => void
}) {
  const { callback, open, setOpen } = props
  const [page, setPage] = useState<WikiPage | null>(null)
  const [query, setQuery] = useState<string | null>(null)
  const [options, setOptions] = useState<WikiPage[]>([])
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const filteredOptions = useMemo(
    () =>
      options.filter((o) =>
        (o.categories || []).find((c) => valid_categories.includes(c.title)),
      ),
    [options],
  )

  // Throttled wiki search
  const fetchOptions = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        return
      }

      const { status, data, error } = await store.dispatch(
        wikiActionApi.endpoints.searchPages.initiate(query),
      )

      if (data) {
        setOptions(Object.values(data?.query?.pages || {}))
      }
    },
    [setOptions],
  )

  const retrieve = React.useMemo(
    () => throttle((query: string) => fetchOptions(query), 800),
    [fetchOptions],
  )

  useEffect(() => {
    if (query) {
      retrieve(query)
    } else {
      setOptions([])
    }
  }, [query, retrieve])

  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Content to reuse
  const searchContent = (
    <ContainerGrid sidebarOpen={false} maxWidth={"md"} noFooter>
      <Section
        title={t("PageSearch.selectItem")}
        xs={12}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          return false
        }}
      >
        <Grid item xs={12} md={3}>
          <CardMedia
            component="img"
            loading="lazy"
            height={200}
            image={
              (page?.thumbnail?.source || "").replace(/\d+px/, "512px") ||
              MISSING_IMAGE_URL
            }
            alt={""}
            sx={{
              borderRadius: theme.spacing(theme.borderRadius.image),
              transition: "0.5s",
            }}
          />
        </Grid>
        <Grid item xs={12} md={9}>
          <Box sx={{ marginBottom: 2 }}>
            <Typography>
              {t("PageSearch.selectedItem")}: {page?.title} (
              <MaterialLink
                href={page?.canonicalurl}
                target="_blank"
                color={"secondary"}
              >
                <UnderlineLink>{t("PageSearch.wikiPage")}</UnderlineLink>
              </MaterialLink>
              )
            </Typography>
            {/*<TextField*/}
            {/*    variant={'outlined'}*/}
            {/*    label={"Item Wiki Page"}*/}
            {/*    disabled*/}
            {/*    fullWidth*/}
            {/*    focused*/}
            {/*    multiline*/}
            {/*    helperText={"Direct URL to the image, from Imgur, RSI, starcitizen.tools, or Discord"}*/}
            {/*    value={`https://starcitizen.tools/${page?.key}`}*/}
            {/*    // error={!!image && !image.match(external_resource_regex)}*/}
            {/*/>*/}
          </Box>
          <Box sx={{ marginBottom: 2 }}>
            <MarkdownRender text={page?.extract || ""} />
          </Box>
          <Box>
            <TextField
              variant={"outlined"}
              label={t("PageSearch.itemSearch")}
              fullWidth
              focused
              multiline
              helperText={t("PageSearch.searchHelper")}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setQuery(event.target.value)
              }}
              value={query}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Paper
            variant={"outlined"}
            sx={{ border: "2px solid", color: theme.palette.secondary.main }}
          >
            <Box
              sx={{
                display: "grid",
                width: "100%",
                // height: 400,
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                  lg: "repeat(4, 1fr)",
                  xl: "repeat(4, 1fr)",
                },
                // standard variant from here:
                // https://github.com/mui-org/material-ui/blob/3e679ac9e368aeb170d564d206d59913ceca7062/packages/mui-material/src/ImageListItem/ImageListItem.js#L42-L43
                [`& .${imageListItemClasses.root}`]: {
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              {filteredOptions.map((item, i) => (
                <PageChoice
                  page={item}
                  onClick={() => setPage(item)}
                  i={i}
                  key={item.canonicalurl}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              color={"error"}
              variant={"contained"}
              onClick={() => {
                setOpen(false)
                callback(null)
              }}
              sx={{ marginRight: 1 }}
            >
              {t("PageSearch.cancel")}
            </Button>
            <Button
              color={"primary"}
              variant={"contained"}
              onClick={() => {
                setOpen(false)
                callback(page)
              }}
            >
              {t("PageSearch.saveAndClose")}
            </Button>
          </Box>
        </Grid>
      </Section>
    </ContainerGrid>
  )

  // On mobile, use BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={() => callback(page)}
        title={t("PageSearch.selectItem")}
        maxHeight="90vh"
      >
        {searchContent}
      </BottomSheet>
    )
  }

  // On desktop, use Modal
  return (
    <Modal open={open} onClose={() => callback(page)}>
      {searchContent}
    </Modal>
  )
}
