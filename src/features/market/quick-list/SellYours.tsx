/**
 * "Sell yours": opens Quick List with the page's item picked. A page wraps
 * its content in <QuickListProvider item={...}> once, and puts a
 * <SellYoursButton> wherever selling fits (header, Sell Orders, empty
 * market). Signed-out visitors get a short sign-in prompt that brings them
 * back to the same page with Quick List open (?sell=1).
 */
import React, { Suspense, createContext, useCallback, useContext, useEffect, useState } from "react"
import { Button, Typography, type ButtonProps } from "@mui/material"
import { SellRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useSession } from "../../../hooks/login/useSession"
import { PATHS } from "../../../routes/paths"
import { lazyWithRetry } from "../../../util/lazyWithRetry"
import { ResponsiveDialog } from "../../../components/dialog/ResponsiveDialog"
import { SELL_PARAM, type QuickListItem } from "../domain/quickList"

// Loaded on first use: the pages showing "Sell yours" don't carry the form
const QuickListDialog = lazyWithRetry(() =>
  import("./QuickListDialog").then((m) => ({ default: m.QuickListDialog })),
)

const QuickListLauncher = createContext<(() => void) | null>(null)

export function QuickListProvider({
  item,
  children,
}: {
  /** The page's item; null while it loads */
  item: QuickListItem | null
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  const session = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)
  const signedIn = session.status === "authenticated"
  const returning = searchParams.has(SELL_PARAM)

  // Back from signing in: open Quick List once, and drop the marker
  useEffect(() => {
    if (!returning || !signedIn || !item) return
    setOpen(true)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete(SELL_PARAM)
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }, [returning, signedIn, item, setSearchParams])

  const launch = useCallback(() => {
    if (session.status === "authenticated") setOpen(true)
    else if (session.status === "anonymous") setSignInOpen(true)
  }, [session.status])

  const signIn = () => {
    const back = new URLSearchParams(location.search)
    back.set(SELL_PARAM, "1")
    navigate(`${PATHS.login}?redirect=${encodeURIComponent(`${location.pathname}?${back.toString()}`)}`)
  }

  return (
    <QuickListLauncher.Provider value={launch}>
      {children}
      {open && signedIn && (
        <Suspense fallback={null}>
          <QuickListDialog open onClose={() => setOpen(false)} item={item} />
        </Suspense>
      )}
      <ResponsiveDialog
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        maxWidth="xs"
        fullScreenOnMobile={false}
        title={t("quickList.signIn.title", "Sign in to sell")}
        closeLabel={t("quickList.close", "Close")}
        actions={
          <>
            <Button onClick={() => setSignInOpen(false)}>{t("ui.cancel", "Cancel")}</Button>
            <Button variant="contained" onClick={signIn}>
              {t("quickList.signIn.action", "Sign in")}
            </Button>
          </>
        }
      >
        <Typography variant="body2" color="text.secondary">
          {item
            ? t("quickList.signIn.bodyItem", {
                defaultValue: "Sign in and we'll bring you straight back to listing {{name}}.",
                name: item.name,
              })
            : t("quickList.signIn.body", "Sign in and we'll bring you straight back here to list your item.")}
        </Typography>
      </ResponsiveDialog>
    </QuickListLauncher.Provider>
  )
}

/** Opens Quick List for the page's item (inside a QuickListProvider). */
export function SellYoursButton({ children, ...props }: ButtonProps) {
  const { t } = useTranslation()
  const launch = useContext(QuickListLauncher)
  return (
    <Button startIcon={<SellRounded />} {...props} onClick={() => launch?.()} disabled={!launch || props.disabled}>
      {children ?? t("quickList.sellYours", "Sell yours")}
    </Button>
  )
}
