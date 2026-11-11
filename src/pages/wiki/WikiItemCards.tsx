import React from "react"
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Stack,
  TableCell,
  TableRow,
} from "@mui/material"
import { ImageAvatar } from "../../components/avatar/ImageAvatar"
import {
  type GameItemMarketPrice,
  type WikiItemSearchResult,
} from "../../store/api/v2/market"
import { Link as RouterLink } from "react-router-dom"
import { MISSING_IMAGE_URL } from "../../util/constants"
import { WIKI_ITEM_CARD_HEIGHT } from "../../components/game-data/cardGrids"
import { wikiItemImage } from "./wikiItemImage"
import { WIKI_PATHS } from "../../routes/paths"
import { TagChip } from "../../components/tags/TagChip"
import { useFormatters } from "../../util/format"
import {
  MarketPriceCaption,
  hasMarketPrice,
  useMarketPriceText,
} from "../../features/game-data/market-price/MarketPriceLine"

export const CARD_HEIGHT = WIKI_ITEM_CARD_HEIGHT

export function ItemGridCard({
  item,
  price,
}: {
  item: WikiItemSearchResult
  /** SC Market price; none when nobody sells the item */
  price?: GameItemMarketPrice
}) {
  // A real link (crawlable, middle-click, prerendered with the hub).
  return (
    <Card
      component={RouterLink}
      to={WIKI_PATHS.item(item.id, item.name)}
      data-testid="wiki-item-card"
      data-id={item.id}
      sx={{
        cursor: "pointer",
        textDecoration: "none",
        height: CARD_HEIGHT,
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.15s",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <CardMedia
        component="img"
        height="160"
        image={wikiItemImage(item)}
        alt={item.name}
        // Lazy: no server-render preload (Early Hint) per card.
        loading="lazy"
        sx={{ objectFit: "contain", bgcolor: "background.default", p: 1 }}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null
          currentTarget.src = MISSING_IMAGE_URL
        }}
      />
      <CardContent
        sx={{
          p: 1.5,
          pt: 1,
          flex: 1,
          overflow: "hidden",
          "&:last-child": { pb: 1.5 },
        }}
      >
        <Typography
          variant="subtitle2"
          noWrap
          fontWeight={600}
          title={item.name}
        >
          {item.name}
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mt: 0.5 }}
          flexWrap="wrap"
          useFlexGap
        >
          {item.type && (
            <TagChip
              tag="category"
              label={item.display_type || item.type}
              sx={{ height: 18, fontSize: "0.65rem" }}
            />
          )}
          {item.size != null && (
            <TagChip
              tag="size"
              label={`S${item.size}`}
              sx={{ height: 18, fontSize: "0.65rem" }}
            />
          )}
          {item.grade && (
            <TagChip
              tag="tier"
              label={item.grade}
              sx={{ height: 18, fontSize: "0.65rem" }}
            />
          )}
        </Stack>
        {item.manufacturer && (
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ mt: 0.5, display: "block" }}
          >
            {item.manufacturer}
          </Typography>
        )}
        <MarketPriceCaption price={price} />
      </CardContent>
    </Card>
  )
}

export function ItemListRow({
  item,
  price,
  onClick,
}: {
  item: WikiItemSearchResult
  /** SC Market price; none when nobody sells the item */
  price?: GameItemMarketPrice
  onClick: () => void
}) {
  return (
    <TableRow hover sx={{ cursor: "pointer" }} onClick={onClick}>
      <TableCell sx={{ py: 0.5, width: 40 }}>
        <ImageAvatar
          alt=""
          src={wikiItemImage(item)}
          variant="rounded"
          sx={{ width: 32, height: 32, bgcolor: "background.default" }}
          imgProps={{ loading: "lazy", style: { objectFit: "contain" } }}
        />
      </TableCell>
      <TableCell sx={{ py: 0.5 }}>
        <Typography
          variant="body2"
          fontWeight={600}
          component={RouterLink}
          to={WIKI_PATHS.item(item.id, item.name)}
          onClick={(event: React.MouseEvent) => event.stopPropagation()}
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          {item.name}
        </Typography>
      </TableCell>
      <TableCell sx={{ py: 0.5 }}>
        <TagChip
          tag="category"
          label={item.display_type || item.type || "—"}
          sx={{ height: 18, fontSize: "0.65rem" }}
        />
      </TableCell>
      <TableCell sx={{ py: 0.5 }}>
        {item.size != null ? `S${item.size}` : "—"}
      </TableCell>
      <TableCell sx={{ py: 0.5 }}>{item.grade || "—"}</TableCell>
      <TableCell sx={{ py: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {item.manufacturer || "—"}
        </Typography>
      </TableCell>
      <TableCell sx={{ py: 0.5, whiteSpace: "nowrap" }} align="right">
        <MarketPriceCell price={price} />
      </TableCell>
    </TableRow>
  )
}

/** The list view's price column: "1.5M aUEC · 3 sellers", or a dash. */
function MarketPriceCell({ price }: { price?: GameItemMarketPrice }) {
  const text = useMarketPriceText()
  const fmt = useFormatters()
  if (!hasMarketPrice(price)) return <>—</>
  return (
    <Typography
      variant="body2"
      component="span"
      title={fmt.exactPrice(price.lowest_price)}
    >
      {text(price, "compact")}
    </Typography>
  )
}
