import {
  Box,
  Card,
  CardActionArea,
  Grid,
  Stack,
  Typography,
} from "@mui/material"
import { type WidgetDefinition } from "./widgets/registry"
import { WidgetPreview } from "./widgets/WidgetPreview"

export interface WidgetCardProps {
  def: WidgetDefinition
  selected: boolean
  onSelect: () => void
  title: string
  description: string
}

/** A single selectable widget in the gallery: schematic preview + title + blurb. */
export function WidgetCard({
  def,
  selected,
  onSelect,
  title,
  description,
}: WidgetCardProps) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          borderColor: selected ? "primary.main" : "divider",
          borderWidth: (t) =>
            selected ? t.borderWidth.emphasis : t.borderWidth.hairline,
        }}
      >
        <CardActionArea
          onClick={onSelect}
          sx={{ height: "100%", p: 1.5, alignItems: "stretch" }}
        >
          <Stack spacing={1} sx={{ height: "100%" }}>
            <WidgetPreview kind={def.preview} icon={def.icon} />
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </Stack>
        </CardActionArea>
      </Card>
    </Grid>
  )
}
