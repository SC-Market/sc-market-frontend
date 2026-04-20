import React, { createContext, useCallback, useContext, useState } from "react"
import { AddToCartDrawer } from "../../features/market/v2/components/AddToCartDrawer"
import { CartDrawer } from "../../components/navbar/CartDrawer"

type CartDrawerMode = { type: "add"; listingId: string } | { type: "preview" } | null

interface CartDrawerContextValue {
  openAddToCart: (listingId: string) => void
  openCartPreview: () => void
  closeCartDrawer: () => void
}

const CartDrawerContext = createContext<CartDrawerContextValue>({
  openAddToCart: () => {},
  openCartPreview: () => {},
  closeCartDrawer: () => {},
})

export const useCartDrawer = () => useContext(CartDrawerContext)

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<CartDrawerMode>(null)

  const openAddToCart = useCallback((listingId: string) => {
    setMode({ type: "add", listingId })
  }, [])

  const openCartPreview = useCallback(() => {
    setMode({ type: "preview" })
  }, [])

  const closeCartDrawer = useCallback(() => {
    setMode(null)
  }, [])

  return (
    <CartDrawerContext.Provider value={{ openAddToCart, openCartPreview, closeCartDrawer }}>
      {children}
      {mode?.type === "add" && (
        <AddToCartDrawer
          open={true}
          onClose={closeCartDrawer}
          listingId={mode.listingId}
        />
      )}
      {mode?.type === "preview" && (
        <CartDrawer
          open={true}
          onClose={closeCartDrawer}
        />
      )}
    </CartDrawerContext.Provider>
  )
}
