import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
export interface Transaction {
  transaction_id: string
  kind: "Payment" | "Purchase" | "Order" | "Withdrawal"
  timestamp: Date
  amount: number
  status: "Completed" | "Pending" | "Cancelled"
  contractor_sender_id: string
  contractor_recipient_id: string
  user_sender_id: string
  user_recipient_id: string
  note: string
}

export interface TransactionBody {
  amount: number
  contractor_recipient_id?: string | null
  user_recipient_id?: string | null
  note: string
}

// export function makeTransactions(): Transaction[] {
//     return [
//         {
//             id: 0,
//             kind: "Withdrawal",
//             date: new Date(),
//             status: "Pending",
//             recipient: "External Account",
//             sender: "DEICOMPANY",
//             amount: 167740
//         },
//         {
//             id: 1,
//             kind: "Payment",
//             date: new Date(1640468052 * 1000),
//             status: "Completed",
//             recipient: "DEICOMPANY",
//             sender: "UEXCORP",
//             amount: 1500000
//         },
//         {
//             id: 2,
//             kind: "Purchase",
//             date: new Date(1640338052 * 1000),
//             status: "Cancelled",
//             recipient: "DEICOMPANY",
//             sender: "Henry",
//             amount: 32000
//         },
//         {
//             id: 3,
//             kind: "Order",
//             date: new Date(1640218052 * 1000),
//             status: "Completed",
//             recipient: "DEICOMPANY",
//             sender: "Henry",
//             amount: 61200
//         },
//         {
//             id: 4,
//             kind: "Order",
//             date: new Date(1640108052 * 1000),
//             status: "Completed",
//             recipient: "DEICOMPANY",
//             sender: "Pumpkintitan",
//             amount: 33000
//         },
//         {
//             id: 5,
//             kind: "Order",
//             date: new Date(1640108052 * 1000),
//             status: "Completed",
//             recipient: "DEICOMPANY",
//             sender: "Pumpkintitan",
//             amount: 33000
//         },
//         {
//             id: 6,
//             kind: "Order",
//             date: new Date(1640108052 * 1000),
//             status: "Completed",
//             recipient: "DEICOMPANY",
//             sender: "Pumpkintitan",
//             amount: 33000
//         },
//         {
//             id: 7,
//             kind: "Order",
//             date: new Date(1640108052 * 1000),
//             status: "Completed",
//             recipient: "DEICOMPANY",
//             sender: "Pumpkintitan",
//             amount: 33000
//         },
//         {
//             id: 8,
//             kind: "Order",
//             date: new Date(1640108052 * 1000),
//             status: "Completed",
//             recipient: "DEICOMPANY",
//             sender: "Pumpkintitan",
//             amount: 33000
//         },
//         {
//             id: 9,
//             kind: "Order",
//             date: new Date(1640108052 * 1000),
//             status: "Completed",
//             recipient: "DEICOMPANY",
//             sender: "Pumpkintitan",
//             amount: 33000
//         },
//         {
//             id: 10,
//             kind: "Order",
//             date: new Date(1640108052 * 1000),
//             status: "Completed",
//             recipient: "DEICOMPANY",
//             sender: "Pumpkintitan",
//             amount: 33000
//         },
//         {
//             id: 11,
//             kind: "Order",
//             date: new Date(1640108052 * 1000),
//             status: "Completed",
//             recipient: "DEICOMPANY",
//             sender: "Pumpkintitan",
//             amount: 33000
//         },
//         {
//             id: 12,
//             kind: "Order",
//             date: new Date(1640108052 * 1000),
//             status: "Completed",
//             recipient: "DEICOMPANY",
//             sender: "Pumpkintitan",
//             amount: 33000
//         },
//         {
//             id: 13,
//             kind: "Order",
//             date: new Date(1640108052 * 1000),
//             status: "Completed",
//             recipient: "DEICOMPANY",
//             sender: "Pumpkintitan",
//             amount: 33000
//         },
//         {
//             id: 14,
//             kind: "Order",
//             date: new Date(1640108052 * 1000),
//             status: "Completed",
//             recipient: "DEICOMPANY",
//             sender: "Pumpkintitan",
//             amount: 33000
//         },
//     ]
// }
