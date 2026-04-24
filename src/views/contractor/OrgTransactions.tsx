import React from "react"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetTransactionsByContractor } from "../../features/money/api/transactionsApi"
import { TransactionTableView } from "../transactions/TransactionTableView"

export function OrgTransactions() {
  const [currentOrg] = useCurrentOrg()

  const {
    data: transactions,
    isLoading,
    error,
  } = useGetTransactionsByContractor(currentOrg?.spectrum_id!, {
    skip: !currentOrg?.spectrum_id,
  })

  return <TransactionTableView transactions={transactions || []} />
}
