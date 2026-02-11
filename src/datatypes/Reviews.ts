import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
export interface OrgReview {
  username: string
  rating: number
  message: string
  org_id: string
}

export function makeOrgReviews(): OrgReview[] {
  return [
    {
      username: "Henry",
      rating: 5,
      message: "They did a great job",
      org_id: "DEICOMPANY",
    },
    {
      username: "Pumpkintitan",
      rating: 2.5,
      message: "They did a great job",
      org_id: "DEICOMPANY",
    },
    {
      username: "Bridge4",
      rating: 2.0,
      message: "Terrible delivery, they ate some of my fries",
      org_id: "DEICOMPANY",
    },
    {
      username: "John",
      rating: 3.5,
      message: "They did a great job",
      org_id: "DEICOMPANY",
    },
  ]
}
