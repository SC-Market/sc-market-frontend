import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  CardMedia,
  Grid,
  ImageListItem,
  imageListItemClasses,
  Link as MaterialLink,
  Modal,
  Paper,
  TextField,
  Typography,
} from "@mui/material"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Section } from "../../components/paper/Section"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { ExtendedTheme, MISSING_IMAGE_URL } from "../../hooks/styles/Theme"
import { store } from "../../store/store"
import throttle from "lodash/throttle"
import { wikiActionApi, WikiPage } from "../../store/wiki"
import { useTheme } from "@mui/material/styles"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { useTranslation } from "react-i18next"

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
              borderRadius: 3,
              transition: "0.5s",
            }}
          />
          <CardContent>
            <Typography variant={"h5"}>{page.title}</Typography>
          </CardContent>
        </Card>
      </ButtonBase>
    </ImageListItem>
  )
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

  return (
    <Modal open={open} onClose={() => callback(page)}>
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
                borderRadius: 3,
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
    </Modal>
  )
}
