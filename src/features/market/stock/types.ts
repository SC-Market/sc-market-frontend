import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
export interface StockRow {
  title: string
  quantity_available: number
  listing_id: string
  price: number
  status: string
  image_url: string
  expiration: string
  order_count: number
  offer_count: number
}

export interface NewListingRow {
  id: string
  item_type: string
  item_name: string | null
  price: number
  quantity_available: number
  status: "active" | "inactive"
  isNew: boolean
}
