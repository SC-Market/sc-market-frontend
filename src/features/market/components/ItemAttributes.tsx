import React from "react"
import {
  Box,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useGetItemAttributesQuery } from "../api/marketApi"

interface ItemAttributesProps {
  gameItemId: string
}

// Standard attributes that should be displayed as chips
const STANDARD_ATTRIBUTES = [
  "component_size",
  "component_grade",
  "component_class",
  "manufacturer",
  "component_type",
  "armor_class",
  "color",
]

/**
 * Format attribute key from snake_case to Title Case
 * Example: "component_size" -> "Component Size"
 */
function formatAttributeKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Get color hex value for color attribute display
 */
function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    red: "#f44336",
    blue: "#2196f3",
    green: "#4caf50",
    yellow: "#ffeb3b",
    orange: "#ff9800",
    purple: "#9c27b0",
    pink: "#e91e63",
    black: "#000000",
    white: "#ffffff",
    gray: "#9e9e9e",
    grey: "#9e9e9e",
    brown: "#795548",
    tan: "#d2b48c",
    beige: "#f5f5dc",
    gold: "#ffd700",
    silver: "#c0c0c0",
    bronze: "#cd7f32",
    copper: "#b87333",
  }

  return colorMap[color.toLowerCase()] || "#757575"
}

/**
 * Get contrast color (black or white) for a given background color
 */
function getContrastColor(color: string): string {
  const hex = getColorHex(color)
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? "#000000" : "#ffffff"
}

/**
 * ItemAttributes component displays game item attributes in detail views
 * Standard attributes (size, grade, etc.) are shown as chips
 * Other attributes are displayed as a key-value list
 */
export function ItemAttributes({ gameItemId }: ItemAttributesProps) {
  const { t } = useTranslation()
  const { data: attributes, isLoading } = useGetItemAttributesQuery(gameItemId)

  // Don't render if loading or no attributes
  if (isLoading || !attributes || Object.keys(attributes).length === 0) {
    return null
  }

  // Separate standard and custom attributes
  const standardAttrs: Record<string, string> = {}
  const customAttrs: Record<string, string> = {}

  Object.entries(attributes).forEach(([key, value]) => {
    if (STANDARD_ATTRIBUTES.includes(key)) {
      standardAttrs[key] = String(value)
    } else {
      customAttrs[key] = String(value)
    }
  })

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        {t("ItemAttributes.title", "Item Specifications")}
      </Typography>

      {/* Standard attributes as chips */}
      {Object.keys(standardAttrs).length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1}>
            {standardAttrs.component_size && (
              <Grid item>
                <Chip
                  label={t("ItemAttributes.size", "Size {{size}}", {
                    size: standardAttrs.component_size,
                  })}
                  color="primary"
                  size="medium"
                />
              </Grid>
            )}

            {standardAttrs.component_grade && (
              <Grid item>
                <Chip
                  label={t("ItemAttributes.grade", "Grade {{grade}}", {
                    grade: standardAttrs.component_grade,
                  })}
                  color="secondary"
                  size="medium"
                />
              </Grid>
            )}

            {standardAttrs.component_class && (
              <Grid item>
                <Chip
                  label={standardAttrs.component_class}
                  variant="outlined"
                  size="medium"
                />
              </Grid>
            )}

            {standardAttrs.component_type && (
              <Grid item>
                <Chip label={standardAttrs.component_type} size="medium" />
              </Grid>
            )}

            {standardAttrs.armor_class && (
              <Grid item>
                <Chip
                  label={t("ItemAttributes.armorClass", "{{class}} Armor", {
                    class: standardAttrs.armor_class,
                  })}
                  color="info"
                  size="medium"
                />
              </Grid>
            )}

            {standardAttrs.color && (
              <Grid item>
                <Chip
                  label={standardAttrs.color}
                  size="medium"
                  sx={{
                    backgroundColor: getColorHex(standardAttrs.color),
                    color: getContrastColor(standardAttrs.color),
                  }}
                />
              </Grid>
            )}

            {standardAttrs.manufacturer && (
              <Grid item>
                <Chip
                  label={standardAttrs.manufacturer}
                  variant="outlined"
                  size="medium"
                />
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Custom attributes as key-value list */}
      {Object.keys(customAttrs).length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            {t("ItemAttributes.additionalSpecs", "Additional Specifications")}
          </Typography>
          <List dense>
            {Object.entries(customAttrs).map(([key, value]) => (
              <ListItem key={key} disableGutters>
                <ListItemText
                  primary={formatAttributeKey(key)}
                  secondary={value}
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: "medium",
                  }}
                  secondaryTypographyProps={{
                    variant: "body2",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  )
}
