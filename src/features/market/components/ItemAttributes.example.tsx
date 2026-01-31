/**
 * Example usage of ItemAttributes component
 * 
 * This file demonstrates how to integrate the ItemAttributes component
 * into a listing detail view.
 */

import React from "react"
import { Box, Card, CardContent, Typography } from "@mui/material"
import { ItemAttributes } from "./ItemAttributes"
import { MarkdownRender } from "../../../components/markdown/Markdown"

/**
 * Example: Adding ItemAttributes to a listing detail view
 * 
 * The ItemAttributes component should be placed after the description
 * section in the listing detail view. It will automatically:
 * - Load attributes using the game_item_id
 * - Display standard attributes (size, grade, etc.) as chips
 * - Display custom attributes as a key-value list
 * - Only render if attributes exist
 */
export function ListingDetailWithAttributes({ listing }: { listing: any }) {
  const details = listing.details

  return (
    <Card>
      <CardContent>
        {/* Existing description section */}
        <Box sx={{ paddingTop: 2 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="text.secondary"
          >
            Description
          </Typography>
          <Typography variant="body2">
            <MarkdownRender text={details.description} />
          </Typography>
        </Box>

        {/* Add ItemAttributes component here */}
        {details.game_item_id && (
          <Box sx={{ paddingTop: 3 }}>
            <ItemAttributes gameItemId={details.game_item_id} />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Integration steps:
 * 
 * 1. Import the component:
 *    import { ItemAttributes } from "../../features/market"
 * 
 * 2. Add it to your detail view after the description:
 *    {details.game_item_id && (
 *      <Box sx={{ paddingTop: 3 }}>
 *        <ItemAttributes gameItemId={details.game_item_id} />
 *      </Box>
 *    )}
 * 
 * 3. The component will automatically:
 *    - Fetch attributes from the API
 *    - Display standard attributes as chips
 *    - Display custom attributes as a list
 *    - Hide itself if no attributes exist
 */
