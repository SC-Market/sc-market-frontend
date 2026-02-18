import { useCallback, useEffect, useMemo, useState } from "react"
import { User } from "../../../datatypes/User"
import { Contractor } from "../../../datatypes/Contractor"
import { BACKEND_URL } from "../../../util/constants"
import throttle from "lodash/throttle"
import { useCreateTransaction } from "../../../store/transactions"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"

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
  const [targetObject, setTargetObject] = useState<User | Contractor | null>(null)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState<"recipient" | "details">("recipient")

  const [createTransaction, { isSuccess, isLoading: isSubmitting }] = useCreateTransaction()

  // Search for recipients
  const getOptions = useCallback(
    (query: string) => {
      if (query.length < 3) {
        return
      }

      fetch(
        `${BACKEND_URL}/api/${
          recipientType === "user" ? "profile" : "contractor"
        }/search/${encodeURIComponent(query)}`,
        {
          method: "GET",
          credentials: "include",
        },
      )
        .then(async (resp) => {
          const data = await resp.json()
          if (data.error) {
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
  }, [target, targetObject, amount, note, isOrgTransaction, currentOrg, createTransaction])

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
