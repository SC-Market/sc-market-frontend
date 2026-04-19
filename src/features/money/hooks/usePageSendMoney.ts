import { useCallback, useEffect, useMemo, useState } from "react"
import { User } from "../../../datatypes/User"
import { Contractor } from "../../../datatypes/Contractor"
import throttle from "lodash/throttle"
import { useCreateTransaction } from "../../../store/transactions"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { store } from "../../../store/store"
import { userApi } from "../../../store/profile"
import { contractorsApi } from "../../../store/api/contractors"

export type RecipientType = "user" | "contractor"

/**
 * Page hook for send money form page
 * Manages recipient search, form state, and transaction creation
 */
export function usePageSendMoney(isOrgTransaction: boolean = false) {
  const [currentOrg] = useCurrentOrg()
  const [recipientType, setRecipientType] = useState<RecipientType>("user")
  const [options, setOptions] = useState<(User | Contractor)[]>([])
  const [target, setTarget] = useState("")
  const [targetObject, setTargetObject] = useState<User | Contractor | null>(
    null,
  )
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState<"recipient" | "details">("recipient")

  const [createTransaction, { isSuccess, isLoading: isSubmitting }] =
    useCreateTransaction()

  // Search for recipients
  const getOptions = useCallback(
    (query: string) => {
      if (query.length < 3) {
        return
      }

      const endpoint =
        recipientType === "user"
          ? userApi.endpoints.profileSearchUsers.initiate(query)
          : contractorsApi.endpoints.searchContractors.initiate({ query })

      store
        .dispatch(endpoint as any)
        .then((result: any) => {
          const data = result.data
          if (!data) {
            setOptions([])
          } else {
            setOptions(data as (User | Contractor)[])
          }
        })
        .catch(() => {
          setOptions([])
        })
    },
    [recipientType],
  )

  const retrieve = useMemo(
    () =>
      throttle((query: string) => {
        getOptions(query)
      }, 400),
    [getOptions],
  )

  useEffect(() => {
    retrieve(target)
  }, [target, retrieve])

  // Submit transaction
  const submitTransaction = useCallback(async () => {
    if (target === "") {
      setError("Please enter a user or contractor")
      return
    }
    if (targetObject === null) {
      setError("Invalid user or contractor")
      return
    }

    if (isNaN(Number.parseInt(amount))) {
      return
    }

    await createTransaction({
      spectrum_id: isOrgTransaction ? currentOrg?.spectrum_id : null,
      body: {
        amount: Number.parseInt(amount),
        note: note,
        contractor_recipient_id: (targetObject as Contractor).spectrum_id
          ? (targetObject as Contractor).spectrum_id
          : null,
        user_recipient_id: (targetObject as User).username
          ? (targetObject as User).username
          : null,
      },
    })
  }, [
    target,
    targetObject,
    amount,
    note,
    isOrgTransaction,
    currentOrg,
    createTransaction,
  ])

  return {
    // Recipient selection
    recipientType,
    setRecipientType,
    options,
    target,
    setTarget,
    targetObject,
    setTargetObject,

    // Form state
    amount,
    setAmount,
    note,
    setNote,
    error,
    setError,
    step,
    setStep,

    // Transaction
    submitTransaction,
    isSuccess,
    isSubmitting,
  }
}
