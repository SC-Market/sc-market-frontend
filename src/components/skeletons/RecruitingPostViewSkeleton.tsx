import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Skeleton,
  Typography,
} from "@mui/material"
import {
  RECRUITING_AVATAR_SIZE,
  RecruitingPostHeaderSkeleton,
  RecruitingTagChipsSkeleton,
} from "./RecruitingPostSkeleton"

/**
 * A recruiting post's card (RecruitingPostView) while it loads: the post
 * page, the update page and the create page's preview. `empty` is the
 * create page's preview, which has no title or text yet.
 */
export function RecruitingPostViewSkeleton(props: { empty?: boolean } = {}) {
  return (
    <Grid item xs={12} lg={12}>
      <Card
        sx={{
          borderRadius: (theme) => theme.spacing(theme.borderRadius.image),
          padding: 3,
        }}
      >
        <CardHeader
          avatar={
            <Skeleton
              variant="rounded"
              width={RECRUITING_AVATAR_SIZE}
              height={RECRUITING_AVATAR_SIZE}
            />
          }
          title={<RecruitingPostHeaderSkeleton extraLine />}
          disableTypography
          action={
            <Skeleton
              variant="rounded"
              width={64}
              height={31}
              sx={{ borderRadius: 4 }}
            />
          }
        />
        <CardContent>
          {!props.empty && (
            <>
              <Typography variant={"h4"} textAlign={"center"}>
                <Skeleton variant="text" width="70%" sx={{ mx: "auto" }} />
              </Typography>
              <Typography variant={"body2"} component="div">
                {[100, 96, 100, 92, 98, 100, 90, 97, 94, 70].map((w, i) => (
                  <Skeleton key={i} variant="text" width={`${w}%`} />
                ))}
              </Typography>
            </>
          )}
        </CardContent>
        <RecruitingTagChipsSkeleton />
      </Card>
    </Grid>
  )
}
