import React from "react"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetTransactionsByContractor } from "../../features/money/api/transactionsApi"
import { TransactionTableView } from "../transactions/TransactionTableView"
import { skipToken } from "@reduxjs/toolkit/query/react"

export function OrgTransactions() {
  const [currentOrg] = useCurrentOrg()

  const { data: transactions } = useGetTransactionsByContractor(
    currentOrg?.spectrum_id || skipToken,
  )

  return <TransactionTableView transactions={transactions || []} />
}
