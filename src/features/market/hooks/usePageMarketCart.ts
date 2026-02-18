import { useCookies } from "react-cookie"
import { useCallback } from "react"
import { CartSeller } from "../../../datatypes/Cart"

/**
 * Page hook interface for consistent data fetching patterns.
 */
export interface UsePageResult<T> {
  data: T | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

/**
 * Page data structure for market cart page.
 */
export interface MarketCartPageData {
  cart: CartSeller[]
  updateCart: () => void
  removeSellerEntry: (item: CartSeller) => void
}

/**
 * Page hook for MarketCart page.
 * Manages cart state from cookies and provides cart manipulation functions.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */
export function usePageMarketCart(): UsePageResult<MarketCartPageData> {
  const [cookies, setCookie] = useCookies(["market_cart"])
  const cart = cookies.market_cart || []

  const updateCart = useCallback(() => {
    setCookie("market_cart", cart, {
      path: "/",
      sameSite: "strict",
      maxAge: 2592000, // 30 days in seconds
    })
  }, [cart, setCookie])

  const removeSellerEntry = useCallback(
    (item: CartSeller) => {
      const index = cart.indexOf(item)
      cart.splice(index, 1)
      updateCart()
    },
    [cart, updateCart],
  )

  return {
    data: {
      cart,
      updateCart,
      removeSellerEntry,
    },
    isLoading: false,
    isFetching: false,
    error: undefined,
    refetch: () => {
      // Cart is managed via cookies, no refetch needed
    },
  }
}
