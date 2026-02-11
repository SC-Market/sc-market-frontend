import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
export interface MessagingEvent {
  event: "create" | "edit" | "delete"
  message: {
    author: {
      username: string
      author: string
    }
    chat_id: string
    timestamp: number
    content: string
    attachments: string[]
    message_id: string
  }
  chat: {
    chat_id: string
    participants: string[]
  }
}
