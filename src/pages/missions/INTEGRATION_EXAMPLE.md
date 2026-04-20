# MissionRatingDialog Integration Example

This document shows how to integrate the `MissionRatingDialog` component into the `MissionDetail` page.

## Integration Steps

### 1. Import the Component

```typescript
import { MissionRatingDialog } from "../../components/game-data"
```

### 2. Add State Management

```typescript
const [ratingDialogOpen, setRatingDialogOpen] = useState(false)
```

### 3. Add "Rate Mission" Button

Add this button to the Community Ratings section or as a floating action button:

```typescript
<Button
  variant="contained"
  color="primary"
  onClick={() => setRatingDialogOpen(true)}
  startIcon={<StarIcon />}
>
  {user_rating ? "Update Rating" : "Rate Mission"}
</Button>
```

### 4. Add the Dialog Component

```typescript
<MissionRatingDialog
  open={ratingDialogOpen}
  onClose={() => setRatingDialogOpen(false)}
  missionId={mission.mission_id}
  missionName={mission.mission_name}
  existingRating={user_rating}
/>
```

## Complete Example

```typescript
import React, { useState } from "react"
import { Button } from "@mui/material"
import { Star as StarIcon } from "@mui/icons-material"
import { MissionRatingDialog } from "../../components/game-data"

export function MissionDetail() {
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false)
  
  // ... existing code ...

  return (
    <Box>
      {/* ... existing mission detail content ... */}
      
      {/* Community Ratings Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">
              Community Ratings
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setRatingDialogOpen(true)}
              startIcon={<StarIcon />}
            >
              {user_rating ? "Update Rating" : "Rate Mission"}
            </Button>
          </Stack>
          
          {/* ... existing ratings display ... */}
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      <MissionRatingDialog
        open={ratingDialogOpen}
        onClose={() => setRatingDialogOpen(false)}
        missionId={mission.mission_id}
        missionName={mission.mission_name}
        existingRating={user_rating}
      />
    </Box>
  )
}
```

## Features

- **Difficulty Rating**: 1-5 stars (Requirement 49.1)
- **Satisfaction Rating**: 1-5 stars (Requirement 49.2)
- **Optional Comment**: Up to 1000 characters (Requirements 49.6, 49.7)
- **Update Existing Ratings**: Automatically detects and updates existing ratings (Requirement 49.8)
- **Validation**: Client-side validation with error messages
- **Loading States**: Shows loading indicator during submission
- **Error Handling**: Displays error messages on failure
- **Cache Invalidation**: Automatically refreshes mission detail after rating

## API Integration

The component uses the `useRateMissionMutation` hook from `missionsApi`:

```typescript
POST /api/v2/game-data/missions/:mission_id/rate
{
  "difficulty_rating": 4,
  "satisfaction_rating": 5,
  "rating_comment": "Great mission!"
}
```

The mutation automatically invalidates the mission detail cache, so the updated ratings will be reflected immediately.

## Requirements Satisfied

- ✅ 49.1: Allow authenticated users to rate mission difficulty (1-5 stars)
- ✅ 49.2: Allow authenticated users to rate mission satisfaction (1-5 stars)
- ✅ 49.6: Optional comment field
- ✅ 49.7: Comment validation (max 1000 characters)
- ✅ 49.8: Update existing ratings
- ✅ 49.9: Prevent rating manipulation (one rating per user per mission - enforced by backend)
- ✅ 49.10: Display user's own rating separately from community average
