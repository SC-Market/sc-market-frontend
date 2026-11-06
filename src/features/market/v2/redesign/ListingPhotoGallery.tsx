import { useState } from "react"
import { Box, Card, CardMedia, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"

/** Main photo with a thumbnail strip to switch between the listing's photos. */
export function ListingPhotoGallery({
  photos,
  title,
}: {
  photos: string[]
  title: string
}) {
  const theme = useTheme<ExtendedTheme>()
  const [activePhoto, setActivePhoto] = useState(0)
  return (
    <>
      <Card sx={{ overflow: "hidden" }}>
        <CardMedia
          component="img"
          image={photos[activePhoto] || FALLBACK_IMAGE_URL}
          alt={title}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = FALLBACK_IMAGE_URL
          }}
          sx={{
            width: "100%",
            aspectRatio: "4 / 3",
            objectFit: "cover",
            bgcolor: "background.default",
            transition: theme.transitions.create("opacity", {
              duration: theme.transitions.duration.standard,
            }),
          }}
        />
      </Card>
      {photos.length > 1 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1.5, flexWrap: "wrap" }}
          useFlexGap
        >
          {photos.map((p, i) => (
            <Box
              key={`${p}-${i}`}
              component="img"
              src={p || FALLBACK_IMAGE_URL}
              alt=""
              onClick={() => setActivePhoto(i)}
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = FALLBACK_IMAGE_URL
              }}
              sx={{
                width: 64,
                height: 64,
                objectFit: "cover",
                borderRadius: 1,
                cursor: "pointer",
                border: "2px solid",
                borderColor: i === activePhoto ? "primary.main" : "divider",
                transition: "border-color .2s",
              }}
            />
          ))}
        </Stack>
      )}
    </>
  )
}
