import { useGetMyTransactions } from "../../features/money/api/transactionsApi"
import { TransactionTableView } from "../transactions/TransactionTableView"
import React from "react"

export function UserTransactions() {
  const { data: transactions } = useGetMyTransactions()

  return <TransactionTableView transactions={transactions || []} />
}
