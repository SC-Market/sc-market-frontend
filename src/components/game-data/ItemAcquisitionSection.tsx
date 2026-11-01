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
  Button,
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
import { ShoppingCart } from "@mui/icons-material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { ItemAcquisitionDocument } from "../../store/api/v2/market"
import { MARKET_PATHS } from "../../routes/paths"
import {
  acquisitionBlueprintPath,
  acquisitionGiver,
  acquisitionMissionName,
  acquisitionMissionPath,
  acquisitionSections,
  blueprintFacts,
  blueprintLabel,
  formatAmount,
  ingredientAmount,
  ingredientPath,
  locationLines,
  missionChance,
  missionRewardKind,
  resourceMethods,
} from "../../seo/itemAcquisition"

function SubsectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle1" component="h3" fontWeight={700} gutterBottom>
      {children}
    </Typography>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.primary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600} color="text.secondary">
        {value}
      </Typography>
    </Box>
  )
}

export function ItemAcquisitionSection({
  doc,
  itemName,
  onAddToCart,
}: {
  doc: ItemAcquisitionDocument
  itemName: string
  onAddToCart?: (listingId: string) => void
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const sections = acquisitionSections(doc)
  const aUEC = (value: number) =>
    t("itemAcquisition.priceUnit", { defaultValue: "{{price}} aUEC", price: formatAmount(value, locale) })
  const any = Object.values(sections).some(Boolean)
  const current = doc.price.current
  const median = current.confidence !== "low" && current.confidence !== "none" ? current.median_ask : null

  return (
    <Card sx={{ mt: 2 }} component="section" aria-labelledby="how-to-get-title">
      <CardContent>
        <Typography id="how-to-get-title" variant="h6" component="h2" gutterBottom>
          {t("itemAcquisition.title", { defaultValue: "How to get {{name}}", name: itemName })}
        </Typography>
        {!any && (
          <Typography variant="body2" color="text.secondary">
            {t("itemAcquisition.noSources", {
              defaultValue: "No player listings, missions, blueprints or in-game shops for {{name}} yet.",
              name: itemName,
            })}
          </Typography>
        )}

        <Stack spacing={2.5} divider={<Divider flexItem />}>
          {sections.buy && (
            <Box>
              <SubsectionTitle>{t("itemAcquisition.buyTitle", "Buy from players")}</SubsectionTitle>
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                {typeof doc.listings.lowest_ask === "number" && (
                  <Fact label={t("itemAcquisition.lowestAsk", "Lowest ask")} value={aUEC(doc.listings.lowest_ask)} />
                )}
                {typeof median === "number" && (
                  <Fact
                    label={`${t("itemAcquisition.medianAsk", "Median ask")} (${
                      current.confidence === "high"
                        ? t("itemAcquisition.confidenceHigh", "high confidence")
                        : t("itemAcquisition.confidenceMedium", "medium confidence")
                    })`}
                    value={aUEC(median)}
                  />
                )}
                <Fact label={t("itemAcquisition.sellers", "Sellers")} value={formatAmount(doc.listings.seller_count, locale)} />
                <Fact label={t("itemAcquisition.listings", "Listings")} value={formatAmount(doc.listings.count, locale)} />
                <Fact label={t("itemAcquisition.inStock", "In stock")} value={formatAmount(doc.listings.quantity_available, locale)} />
              </Stack>
              {doc.listings.top.length > 0 && (
                <Table size="small" sx={{ "& td": { px: 1 } }}>
                  <TableBody>
                    {doc.listings.top.map((listing) => (
                      <TableRow key={listing.listing_id} hover>
                        <TableCell>
                          <Link component={RouterLink} to={MARKET_PATHS.listing(listing.listing_id, listing.title)} underline="hover">
                            {listing.title}
                          </Link>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {typeof listing.price === "number" ? aUEC(listing.price) : "—"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption" color="text.secondary">
                            {t("itemAcquisition.inStockCount", {
                              defaultValue: "{{quantity}} in stock",
                              quantity: formatAmount(listing.quantity_available, locale),
                            })}
                          </Typography>
                        </TableCell>
                        {onAddToCart && (
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              aria-label={t("itemAcquisition.addToCart", "Add to cart")}
                              onClick={() => onAddToCart(listing.listing_id)}
                              disabled={listing.quantity_available === 0}
                            >
                              <ShoppingCart fontSize="small" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <Button
                component={RouterLink}
                to={MARKET_PATHS.aggregate(doc.item.id, doc.item.name)}
                size="small"
                variant="contained"
                startIcon={<ShoppingCart />}
                sx={{ mt: 1.5 }}
              >
                {t("itemAcquisition.compareAll", { defaultValue: "Compare all {{name}} listings", name: itemName })}
              </Button>
            </Box>
          )}

          {sections.missions && (
            <Box>
              <SubsectionTitle>{t("itemAcquisition.missionsTitle", "Missions that reward it")}</SubsectionTitle>
              <Stack spacing={1}>
                {doc.missions.top.map((m) => {
                  const giver = acquisitionGiver(m)
                  const chance = missionChance(m, t)
                  return (
                    <Box key={`${m.mission_id}-${m.reward_kind}`}>
                      <Link component={RouterLink} to={acquisitionMissionPath(m)} underline="hover" fontWeight={600}>
                        {acquisitionMissionName(m)}
                      </Link>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                        <Chip
                          size="small"
                          color={m.reward_kind === "item" ? "success" : "default"}
                          label={missionRewardKind(m, t)}
                        />
                        {chance && <Chip size="small" variant="outlined" label={chance} />}
                        {giver && (
                          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
                            {t("itemAcquisition.giver", { defaultValue: "Giver: {{giver}}", giver })}
                          </Typography>
                        )}
                        {m.star_system && (
                          <Typography variant="caption" color="text.primary" sx={{ alignSelf: "center" }}>
                            {m.star_system}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  )
                })}
              </Stack>
              {doc.missions.total > doc.missions.top.length && (
                <Typography variant="caption" color="text.primary" display="block" sx={{ mt: 1 }}>
                  {t("itemAcquisition.showingMissions", {
                    defaultValue: "Showing {{shown}} of {{total}} missions",
                    shown: doc.missions.top.length,
                    total: doc.missions.total,
                  })}
                </Typography>
              )}
            </Box>
          )}

          {sections.blueprints && (
            <Box>
              <SubsectionTitle>{t("itemAcquisition.craftTitle", "Craft it")}</SubsectionTitle>
              <Stack spacing={2}>
                {doc.blueprints.items.map((bp) => (
                  <Box key={bp.blueprint_id}>
                    <Link component={RouterLink} to={acquisitionBlueprintPath(bp)} underline="hover" fontWeight={600}>
                      {blueprintLabel(itemName, t)}
                    </Link>
                    {blueprintFacts(bp, t).length > 0 && (
                      <Typography variant="caption" color="text.primary" display="block">
                        {blueprintFacts(bp, t).join(" · ")}
                      </Typography>
                    )}
                    {bp.ingredients.length > 0 && (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {t("itemAcquisition.ingredients", "Ingredients")}
                        </Typography>
                        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                          {bp.ingredients.map((ing) => (
                            <Typography component="li" variant="body2" key={`${ing.game_item_id}-${ing.slot_display_name ?? ""}`}>
                              <Link component={RouterLink} to={ingredientPath(ing)} underline="hover">
                                {ing.name}
                              </Link>{" "}
                              <Typography component="span" variant="body2" color="text.primary">
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
                <Typography variant="caption" color="text.primary" display="block" sx={{ mt: 1 }}>
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
              <SubsectionTitle>{t("itemAcquisition.shopsTitle", "In-game shops")}</SubsectionTitle>
              <Table size="small" sx={{ "& td, & th": { px: 1 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("itemAcquisition.columnShop", "Shop")}</TableCell>
                    <TableCell>{t("itemAcquisition.columnLocation", "Location")}</TableCell>
                    <TableCell align="right">{t("itemAcquisition.columnBuyPrice", "Buy price")}</TableCell>
                    <TableCell align="right">{t("itemAcquisition.columnSellPrice", "Sell price")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {doc.in_game_shops.shops.map((shop, i) => (
                    <TableRow key={`${shop.name}-${shop.location}-${i}`}>
                      <TableCell>{shop.name}</TableCell>
                      <TableCell>{shop.location}</TableCell>
                      <TableCell align="right">{typeof shop.buy_price === "number" ? aUEC(shop.buy_price) : "—"}</TableCell>
                      <TableCell align="right">{typeof shop.sell_price === "number" ? aUEC(shop.sell_price) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {doc.in_game_shops.total > doc.in_game_shops.shops.length && (
                <Typography variant="caption" color="text.primary" display="block" sx={{ mt: 1 }}>
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
              <SubsectionTitle>{t("itemAcquisition.resourceTitle", "Mining, salvage and loot")}</SubsectionTitle>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {resourceMethods(doc, t).map((label) => (
                  <Chip key={label} size="small" label={label} />
                ))}
              </Stack>
              {locationLines(doc.resource.mining_locations).length > 0 && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {t("itemAcquisition.miningLocations", "Where to mine it")}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {locationLines(doc.resource.mining_locations).map((line) => (
                      <Typography component="li" variant="body2" key={line}>
                        {line}
                      </Typography>
                    ))}
                  </Box>
                </>
              )}
              {locationLines(doc.resource.purchase_locations).length > 0 && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {t("itemAcquisition.purchaseLocations", "Where to buy it")}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {locationLines(doc.resource.purchase_locations).map((line) => (
                      <Typography component="li" variant="body2" key={line}>
                        {line}
                      </Typography>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          )}
        </Stack>

        {any && (
          <Typography variant="caption" color="text.primary" display="block" sx={{ mt: 2 }}>
            {t(
              "itemAcquisition.attribution",
              "Data: SC Market (sc-market.space), CC BY 4.0. Game data © Cloud Imperium Games.",
            )}{" "}
            <Link href={doc.links.json} target="_blank" rel="noopener">
              {t("itemAcquisition.jsonData", "JSON data")}
            </Link>
            {" · "}
            <Link href={doc.feed.license.url} target="_blank" rel="license noopener">
              {t("itemAcquisition.license", "CC BY 4.0")}
            </Link>
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
