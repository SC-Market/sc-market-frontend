/**
 * "How to get <item>" on the game item page: player listings, missions that
 * reward the item or its blueprint, the blueprints that craft it and what
 * they need, in-game shops, and mining/salvage/loot info, from the item
 * acquisition document (useGetAcquisitionQuery). Empty subsections are
 * hidden. Every entity is a real <a href> (crawlers and SSR HTML). The
 * edge bridge renders the same facts from the same helpers
 * (src/seo/itemAcquisition.ts).
 */
import React from "react"
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { ItemAcquisitionDocument } from "../../features/game-data/api/gameDataApi"
import {
  acquisitionBlueprintPath,
  acquisitionSections,
  blueprintFacts,
  blueprintLabel,
  ingredientAmount,
  ingredientPath,
  locationLines,
  resourceMethods,
} from "../../seo/itemAcquisition"
import { SubsectionTitle, useAUEC } from "./ItemAcquisitionParts"
import { AcquisitionBuySection } from "./ItemAcquisitionBuySection"
import { AcquisitionMissionsSection } from "./ItemAcquisitionMissionsSection"

export function ItemAcquisitionSection({
  doc,
  itemName,
  onAddToCart,
  actions,
}: {
  doc: ItemAcquisitionDocument
  itemName: string
  onAddToCart?: (listingId: string) => void
  /** Buttons beside the title (the wiki page's See listings / Sell yours) */
  actions?: React.ReactNode
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const sections = acquisitionSections(doc)
  const aUEC = useAUEC()
  const any = Object.values(sections).some(Boolean)

  return (
    <Card sx={{ mt: 2 }} component="section" aria-labelledby="how-to-get-title">
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "flex-start" }}
          gap={1}
          sx={{ mb: 1 }}
        >
          <Typography id="how-to-get-title" variant="h6" component="h2">
            {t("itemAcquisition.title", {
              defaultValue: "How to get {{name}}",
              name: itemName,
            })}
          </Typography>
          {actions && (
            <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
              {actions}
            </Stack>
          )}
        </Stack>
        {!any && (
          <Typography variant="body2" color="text.secondary">
            {t("itemAcquisition.noSources", {
              defaultValue:
                "No player listings, missions, blueprints or in-game shops for {{name}} yet.",
              name: itemName,
            })}
          </Typography>
        )}

        <Stack spacing={2.5} divider={<Divider flexItem />}>
          {sections.buy && (
            <AcquisitionBuySection
              doc={doc}
              itemName={itemName}
              onAddToCart={onAddToCart}
            />
          )}

          {sections.missions && <AcquisitionMissionsSection doc={doc} />}

          {sections.blueprints && (
            <Box>
              <SubsectionTitle>
                {t("itemAcquisition.craftTitle", "Craft it")}
              </SubsectionTitle>
              <Stack spacing={2}>
                {doc.blueprints.items.map((bp) => (
                  <Box key={bp.blueprint_id}>
                    <Link
                      component={RouterLink}
                      to={acquisitionBlueprintPath(bp)}
                      underline="hover"
                      fontWeight={600}
                    >
                      {blueprintLabel(itemName, t)}
                    </Link>
                    {blueprintFacts(bp, t).length > 0 && (
                      <Typography
                        variant="caption"
                        color="text.primary"
                        display="block"
                      >
                        {blueprintFacts(bp, t).join(" · ")}
                      </Typography>
                    )}
                    {bp.ingredients.length > 0 && (
                      <>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {t("itemAcquisition.ingredients", "Ingredients")}
                        </Typography>
                        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                          {bp.ingredients.map((ing) => (
                            <Typography
                              component="li"
                              variant="body2"
                              key={`${ing.game_item_id}-${ing.slot_display_name ?? ""}`}
                            >
                              <Link
                                component={RouterLink}
                                to={ingredientPath(ing)}
                                underline="hover"
                              >
                                {ing.name}
                              </Link>{" "}
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                — {ingredientAmount(ing, t, locale)}
                              </Typography>
                            </Typography>
                          ))}
                        </Box>
                      </>
                    )}
                  </Box>
                ))}
              </Stack>
              {doc.blueprints.total > doc.blueprints.items.length && (
                <Typography
                  variant="caption"
                  color="text.primary"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  {t("itemAcquisition.showingBlueprints", {
                    defaultValue: "Showing {{shown}} of {{total}} blueprints",
                    shown: doc.blueprints.items.length,
                    total: doc.blueprints.total,
                  })}
                </Typography>
              )}
            </Box>
          )}

          {sections.shops && (
            <Box>
              <SubsectionTitle>
                {t("itemAcquisition.shopsTitle", "In-game shops")}
              </SubsectionTitle>
              <Table size="small" sx={{ "& td, & th": { px: 1 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      {t("itemAcquisition.columnShop", "Shop")}
                    </TableCell>
                    <TableCell>
                      {t("itemAcquisition.columnLocation", "Location")}
                    </TableCell>
                    <TableCell align="right">
                      {t("itemAcquisition.columnBuyPrice", "Buy price")}
                    </TableCell>
                    <TableCell align="right">
                      {t("itemAcquisition.columnSellPrice", "Sell price")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {doc.in_game_shops.shops.map((shop, i) => (
                    <TableRow key={`${shop.name}-${shop.location}-${i}`}>
                      <TableCell>{shop.name}</TableCell>
                      <TableCell>{shop.location}</TableCell>
                      <TableCell align="right">
                        {typeof shop.buy_price === "number"
                          ? aUEC(shop.buy_price)
                          : "—"}
                      </TableCell>
                      <TableCell align="right">
                        {typeof shop.sell_price === "number"
                          ? aUEC(shop.sell_price)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {doc.in_game_shops.total > doc.in_game_shops.shops.length && (
                <Typography
                  variant="caption"
                  color="text.primary"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  {t("itemAcquisition.showingShops", {
                    defaultValue: "Showing {{shown}} of {{total}} shops",
                    shown: doc.in_game_shops.shops.length,
                    total: doc.in_game_shops.total,
                  })}
                </Typography>
              )}
            </Box>
          )}

          {sections.resource && doc.resource && (
            <Box>
              <SubsectionTitle>
                {t("itemAcquisition.resourceTitle", "Mining, salvage and loot")}
              </SubsectionTitle>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {resourceMethods(doc, t).map((label) => (
                  <Chip key={label} size="small" label={label} />
                ))}
              </Stack>
              {locationLines(doc.resource.mining_locations).length > 0 && (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {t("itemAcquisition.miningLocations", "Where to mine it")}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {locationLines(doc.resource.mining_locations).map(
                      (line) => (
                        <Typography component="li" variant="body2" key={line}>
                          {line}
                        </Typography>
                      ),
                    )}
                  </Box>
                </>
              )}
              {locationLines(doc.resource.purchase_locations).length > 0 && (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {t("itemAcquisition.purchaseLocations", "Where to buy it")}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {locationLines(doc.resource.purchase_locations).map(
                      (line) => (
                        <Typography component="li" variant="body2" key={line}>
                          {line}
                        </Typography>
                      ),
                    )}
                  </Box>
                </>
              )}
            </Box>
          )}
        </Stack>

        {any && (
          <Typography
            variant="caption"
            color="text.primary"
            display="block"
            sx={{ mt: 2 }}
          >
            {t(
              "itemAcquisition.attribution",
              "Data: SC Market (sc-market.space), CC BY 4.0. Game data © Cloud Imperium Games.",
            )}{" "}
            <Link href={doc.links.json} target="_blank" rel="noopener">
              {t("itemAcquisition.jsonData", "JSON data")}
            </Link>
            {" · "}
            <Link
              href={doc.feed.license.url}
              target="_blank"
              rel="license noopener"
            >
              {t("itemAcquisition.license", "CC BY 4.0")}
            </Link>
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
