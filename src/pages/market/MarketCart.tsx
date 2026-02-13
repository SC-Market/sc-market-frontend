import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Page } from "../../components/metadata/Page"
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  InputAdornment,
  Link as MaterialLink,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { Section } from "../../components/paper/Section"
import { useCookies } from "react-cookie"
import { CartItem, CartSeller } from "../../datatypes/Cart"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Link, useNavigate } from "react-router-dom"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { useGetUserByUsernameQuery } from "../../store/profile"
import { useGetContractorBySpectrumIDQuery } from "../../store/contractor"
import {
  useGetMarketListingQuery,
  usePurchaseMarketListingMutation,
} from "../../features/market"
import { LocalOfferRounded } from "@mui/icons-material"
import { TrashCan } from "mdi-material-ui"
import LoadingButton from "@mui/lab/LoadingButton"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { BackArrow } from "../../components/button/BackArrow"
import { MarkdownEditor } from "../../components/markdown/Markdown"
import { MarketAggregateListingComposite } from "../../features/market"
import { NumericFormat } from "react-number-format"
import { formatCompleteListingUrl, formatMarketUrl } from "../../util/urls"
import { FALLBACK_IMAGE_URL } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import {
  useCheckContractorAvailabilityRequirementQuery,
  useCheckUserAvailabilityRequirementQuery,
  useCheckContractorOrderLimitsQuery,
  useCheckUserOrderLimitsQuery,
} from "../../store/orderSettings"
import {
  useProfileGetAvailabilityQuery,
  useProfileUpdateAvailabilityMutation,
} from "../../store/profile"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { CheckCircle, Warning } from "@mui/icons-material"
import {
  AvailabilitySelector,
  AvailabilityDisplay,
} from "../../components/time/AvailabilitySelector"
import { convertAvailability } from "../../pages/availability/Availability"
import { OrderLimitsDisplay } from "../../components/orders/OrderLimitsDisplay"
import { BottomSheet } from "../../components/mobile/BottomSheet"
import { EmptyCart } from "../../components/empty-states"

export function CartItemEntry(props: {
  item: CartItem
  updateCart: () => void
  removeCartItem: (item: CartItem) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { item, updateCart, removeCartItem } = props
  const { data: listing } = useGetMarketListingQuery(item.listing_id)
  const composite = listing as MarketAggregateListingComposite | undefined

  useEffect(() => {
    if (listing && item.price !== listing.listing.price) {
      item.price = listing.listing.price
      updateCart()
    }

    if (listing && item.quantity > listing.listing.quantity_available) {
      item.quantity = listing.listing.quantity_available
      updateCart()
    }
  }, [item, listing, updateCart])

  return (
    <Grid item xs={12}>
      <Grid
        container
        spacing={theme.layoutSpacing.layout}
        justifyContent={"space-between"}
      >
        <Grid item>
          <img
            height={128}
            width={128}
            src={(listing?.photos || [])[0] || FALLBACK_IMAGE_URL}
            alt={listing?.details?.description}
            style={{
              borderRadius: theme.spacing(theme.borderRadius.image),
              objectFit: "cover",
            }}
            loading="lazy"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null
              currentTarget.src = FALLBACK_IMAGE_URL
            }}
          />
        </Grid>
        <Grid item sx={{ "& > *": { marginBottom: 1 } }}>
          <Box>
            <MaterialLink
              component={Link}
              to={listing ? formatCompleteListingUrl(listing) : ""}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <UnderlineLink
                color={"text.secondary"}
                variant={"h6"}
                sx={{
                  fontWeight: "600",
                }}
              >
                {listing?.details?.title}
              </UnderlineLink>
            </MaterialLink>
          </Box>
          <Box>
            <NumericFormat
              decimalScale={0}
              allowNegative={false}
              customInput={TextField}
              thousandSeparator
              onValueChange={async (values, sourceInfo) => {
                item.quantity = +values.floatValue! || 1
                updateCart()
              }}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    {t("cart.ofAvailable", {
                      available: (
                        listing?.listing?.quantity_available || 0
                      ).toLocaleString(undefined),
                    })}
                  </InputAdornment>
                ),
                inputMode: "numeric",
              }}
              size="small"
              label={t("cart.quantity")}
              value={item.quantity}
              color={"secondary"}
            />
          </Box>
        </Grid>
        <Grid item>
          <Box display={"flex"} justifyContent={"space-between"} width={240}>
            <Box sx={{ width: 120 }}>
              <Typography>{t("cart.price")}</Typography>
              <Typography>{t("cart.quantity")}</Typography>
            </Box>
            <Box sx={{ width: 120 }}>
              <Typography sx={{ textAlign: "right" }}>
                {(listing?.listing?.price || 0).toLocaleString(undefined)} aUEC
              </Typography>
              <Typography sx={{ textAlign: "right" }}>
                x {item.quantity.toLocaleString(undefined)}
              </Typography>
            </Box>
          </Box>
          <Divider light />
          <Box display={"flex"} justifyContent={"space-between"} width={240}>
            <Box sx={{ width: 120 }}>
              <Typography>{t("cart.subtotal")}</Typography>
            </Box>
            <Box sx={{ width: 120 }}>
              <Typography sx={{ textAlign: "right" }}>
                {(
                  (listing?.listing?.price || 0) * item.quantity
                ).toLocaleString(undefined)}{" "}
                aUEC
              </Typography>
            </Box>
          </Box>

          <Box>
            <Button
              color={"error"}
              variant={"text"}
              startIcon={<TrashCan />}
              size={"small"}
              onClick={() => removeCartItem(item)}
            >
              {t("cart.remove")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  )
}

export function CartSellerEntry(props: {
  seller: CartSeller
  updateCart: () => void
  removeSellerEntry: (item: CartSeller) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { seller, updateCart, removeSellerEntry } = props
  const { data: user_seller } = useGetUserByUsernameQuery(
    seller.user_seller_id!,
    { skip: !seller.user_seller_id },
  )
  const { data: contractor_seller } = useGetContractorBySpectrumIDQuery(
    seller.contractor_seller_id!,
    { skip: !seller.contractor_seller_id },
  )

  useEffect(() => {
    if (seller.contractor_seller_id) {
      if (contractor_seller) {
        seller.note = contractor_seller.market_order_template
      }
    } else {
      if (user_seller) {
        seller.note = user_seller?.market_order_template
      }
    }

    updateCart()
  }, [user_seller, contractor_seller])

  const removeCartItem = useCallback(
    (item: CartItem) => {
      const index = seller.items.indexOf(item)
      seller.items.splice(index, 1)
      if (!seller.items.length) {
        removeSellerEntry(seller)
      } else {
        updateCart()
      }
    },
    [seller.items, updateCart],
  )

  const [
    purchaseListing, // This is the mutation trigger
    { isLoading: purchaseLoading }, // This is the destructured mutation result
  ] = usePurchaseMarketListingMutation()

  const total = useMemo(
    () =>
      seller.items
        .map((x) => x.quantity * (x.price || 0))
        .reduce((partialSum, a) => partialSum + a, 0),
    [seller.items],
  )

  useEffect(() => {
    setOffer(total)
  }, [total])

  const [offer, setOffer] = useState(total)

  const issueAlert = useAlertHook()

  const navigate = useNavigate()

  // Check availability requirement for this seller
  const {
    data: contractorRequirement,
    isLoading: checkingContractor,
    refetch: refetchContractorRequirement,
  } = useCheckContractorAvailabilityRequirementQuery(
    seller.contractor_seller_id!,
    {
      skip: !seller.contractor_seller_id,
    },
  )

  const {
    data: userRequirement,
    isLoading: checkingUser,
    refetch: refetchUserRequirement,
  } = useCheckUserAvailabilityRequirementQuery(seller.user_seller_id!, {
    skip: !seller.user_seller_id,
  })

  // If either requires availability, enforce it
  const availabilityRequirement = useMemo(() => {
    if (contractorRequirement?.required) {
      return contractorRequirement
    }
    if (userRequirement?.required) {
      return userRequirement
    }
    return undefined
  }, [contractorRequirement, userRequirement])

  const checkingRequirement = checkingContractor || checkingUser

  // Get user's current availability for this seller's contractor (for display purposes)
  const [currentOrg] = useCurrentOrg()
  const { data: userAvailability } = useProfileGetAvailabilityQuery(
    seller.contractor_seller_id || null,
  )

  // Check if availability is set - use the value from the requirement check
  const hasAvailabilitySet = useMemo(() => {
    if (!availabilityRequirement?.required) return true
    // The backend already checked this, so we can use the hasAvailability from the requirement check
    return availabilityRequirement.hasAvailability
  }, [availabilityRequirement])

  // Check order limits for this seller
  const { data: contractorLimits } = useCheckContractorOrderLimitsQuery(
    seller.contractor_seller_id!,
    { skip: !seller.contractor_seller_id },
  )
  const { data: userLimits } = useCheckUserOrderLimitsQuery(
    seller.user_seller_id!,
    { skip: !seller.user_seller_id },
  )

  // Use contractor limits if available, otherwise user limits
  const orderLimits = contractorLimits || userLimits

  // Calculate current order size (sum of quantities)
  const currentSize = useMemo(
    () => seller.items.reduce((sum, item) => sum + item.quantity, 0),
    [seller.items],
  )

  // Update availability mutation
  const [updateAvailability] = useProfileUpdateAvailabilityMutation()

  // Local state for availability selector
  const [availabilitySelections, setAvailabilitySelections] = useState<
    boolean[]
  >(convertAvailability(userAvailability?.selections || []))
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false)

  // Update availability selections when userAvailability changes
  useEffect(() => {
    if (userAvailability) {
      setAvailabilitySelections(
        convertAvailability(userAvailability.selections || []),
      )
    }
  }, [userAvailability])

  const handleSaveAvailability = useCallback(
    async (selections: boolean[]) => {
      // Convert to spans format (same as Availability page)
      const spans: Array<{ start: number; finish: number }> = []
      let current: { start: number; finish: number } | null = null

      for (let i = 0; i < selections.length; i++) {
        if (selections[i]) {
          if (current) {
            current.finish = i
          } else {
            current = { start: i, finish: i }
          }
        } else {
          if (current) {
            spans.push(current)
            current = null
          }
        }
      }

      if (current) {
        spans.push(current)
      }

      try {
        await updateAvailability({
          contractor: seller.contractor_seller_id || null,
          selections: spans,
        }).unwrap()

        // Refetch availability requirement checks to update form state
        if (seller.contractor_seller_id) {
          refetchContractorRequirement()
        }
        if (seller.user_seller_id) {
          refetchUserRequirement()
        }

        setIsAvailabilityModalOpen(false)
        issueAlert({
          message: t("availability.updated"),
          severity: "success",
        })
      } catch (error) {
        const errorMessage =
          (error as any)?.error ||
          (error as any)?.data?.error ||
          (error instanceof Error ? error.message : String(error))
        issueAlert({
          message: `${t("availability.failed")} ${errorMessage}`,
          severity: "error",
        })
      }
    },
    [
      seller.contractor_seller_id,
      seller.user_seller_id,
      updateAvailability,
      refetchContractorRequirement,
      refetchUserRequirement,
      issueAlert,
      t,
    ],
  )

  const sellerName =
    user_seller?.display_name || contractor_seller?.name || "Seller"

  const handlePurchase = useCallback(
    async (offer: number | undefined | null) => {
      purchaseListing({
        ...seller,
        offer,
      })
        .unwrap()
        .then((res) => {
          issueAlert({
            message: t("cart.purchaseSuccess"),
            severity: "success",
          })
          removeSellerEntry(seller)

          if (res.discord_invite) {
            const newWindow = window.open(
              `https://discord.gg/${res.discord_invite}`,
              "_blank",
            )
            if (newWindow) {
              newWindow.focus()
            }
          }

          navigate(`/offer/${res.session_id}`)
        })
        .catch((error) => {
          if (error?.data?.error?.code === "AVAILABILITY_REQUIRED") {
            issueAlert({
              message:
                error.data.error.message ||
                t("AvailabilityRequirement.apiError"),
              severity: "error",
            })
          } else if (error?.data?.error?.code === "ORDER_LIMIT_VIOLATION") {
            issueAlert({
              message:
                error.data.error.message ||
                "Order does not meet size or value requirements",
              severity: "error",
            })
          } else {
            issueAlert(error)
          }
        })
    },
    [seller, purchaseListing, issueAlert],
  )

  return (
    <Section
      xs={12}
      title={t("cart.seller")}
      element_title={
        <MaterialLink
          component={Link}
          to={
            user_seller
              ? `/user/${user_seller?.username}`
              : `/contractor/${contractor_seller?.spectrum_id}`
          }
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <UnderlineLink
            color={"text.primary"}
            variant={"h6"}
            sx={{
              fontWeight: "600",
            }}
          >
            {user_seller?.display_name || contractor_seller?.name}
          </UnderlineLink>
        </MaterialLink>
      }
    >
      {seller.items.map((item) => (
        <CartItemEntry
          key={item.listing_id}
          item={item}
          updateCart={updateCart}
          removeCartItem={removeCartItem}
        />
      ))}
      <Grid item xs={12}>
        <Box display={"flex"} justifyContent={"space-between"}>
          <Typography variant={"h5"} color={"text.secondary"}>
            {t("cart.total")}
          </Typography>

          <Typography variant={"h5"} color={"text.secondary"}>
            {total.toLocaleString(undefined)} aUEC
          </Typography>
        </Box>
      </Grid>

      {/* Availability Section - Show if required or while checking */}
      {availabilityRequirement?.required && (
        <>
          <Grid item xs={12}>
            {checkingRequirement ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>
                  {t(
                    "availability.checking",
                    "Checking availability requirement...",
                  )}
                </AlertTitle>
              </Alert>
            ) : (
              <Alert
                severity={hasAvailabilitySet ? "success" : "warning"}
                icon={hasAvailabilitySet ? <CheckCircle /> : <Warning />}
                sx={{ mb: 2 }}
              >
                <AlertTitle>
                  {hasAvailabilitySet
                    ? t("AvailabilityRequirement.set")
                    : t("AvailabilityRequirement.required")}
                </AlertTitle>
                <Box>
                  {hasAvailabilitySet ? (
                    <>
                      {t("AvailabilityRequirement.setMessage", {
                        sellerName,
                      })}
                      <Button
                        size="small"
                        onClick={() => setIsAvailabilityModalOpen(true)}
                        sx={{ mt: 1, ml: 1 }}
                      >
                        {t("availability.edit", "Edit")}
                      </Button>
                    </>
                  ) : (
                    <>
                      {t("AvailabilityRequirement.requiredMessage", {
                        sellerName,
                      })}
                      <Box mt={1}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => setIsAvailabilityModalOpen(true)}
                        >
                          {t("AvailabilityRequirement.setAvailability")}
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Alert>
            )}
          </Grid>
        </>
      )}

      {/* Availability Modal */}
      {isMobile ? (
        <BottomSheet
          open={isAvailabilityModalOpen}
          onClose={() => setIsAvailabilityModalOpen(false)}
          title={`${t("availability.select_availability")} - ${sellerName}`}
          maxHeight="90vh"
        >
          <Box sx={{ mt: 1 }}>
            <AvailabilitySelector
              onSave={handleSaveAvailability}
              initialSelections={availabilitySelections}
            />
          </Box>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setIsAvailabilityModalOpen(false)}>
              {t("accessibility.cancel", "Cancel")}
            </Button>
          </Box>
        </BottomSheet>
      ) : (
        <Dialog
          open={isAvailabilityModalOpen}
          onClose={() => setIsAvailabilityModalOpen(false)}
          maxWidth="lg"
          fullWidth
          aria-labelledby="availability-modal-title"
        >
          <DialogTitle id="availability-modal-title">
            {t("availability.select_availability")} - {sellerName}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <AvailabilitySelector
                onSave={handleSaveAvailability}
                initialSelections={availabilitySelections}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAvailabilityModalOpen(false)}>
              {t("accessibility.cancel", "Cancel")}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Order Limits Display */}
      {orderLimits && (
        <Grid item xs={12}>
          <OrderLimitsDisplay
            limits={orderLimits}
            currentSize={currentSize}
            currentValue={offer}
            showValidation={true}
          />
        </Grid>
      )}

      <Grid item xs={12}>
        <MarkdownEditor
          sx={{ marginRight: 2, marginBottom: 1 }}
          TextFieldProps={{
            label: t("cart.note"),
          }}
          value={seller.note || ""}
          onChange={(value: string) => {
            seller.note = value
            updateCart()
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        {t("cart.submitOfferDesc")}
      </Grid>
      <Grid item xs={12} md={8}>
        <Grid
          container
          spacing={theme.layoutSpacing.text}
          justifyContent={"right"}
          alignItems={"center"}
          sx={{ marginBottom: 2 }}
        >
          <Grid item>
            <Typography
              variant={"body1"}
              sx={{ marginRight: 1, alignItems: "center" }}
            >
              {t("cart.payTotal", { total: total.toLocaleString(undefined) })}
            </Typography>
          </Grid>
          {/*<Grid item>
            <LoadingButton
              color={"primary"}
              variant={"contained"}
              loadingPosition="start"
              startIcon={<AddShoppingCartRounded />}
              loading={purchaseLoading}
              onClick={() => handlePurchase(undefined)}
            >
              {t("cart.submitOrder")}
            </LoadingButton>
          </Grid>*/}
        </Grid>
        <Grid
          container
          spacing={theme.layoutSpacing.text}
          justifyContent={"right"}
        >
          <Grid item>
            <Grid container spacing={theme.layoutSpacing.text}>
              <Grid item>
                <NumericFormat
                  decimalScale={0}
                  allowNegative={false}
                  customInput={TextField}
                  thousandSeparator
                  onValueChange={async (values, sourceInfo) => {
                    setOffer(+(values.floatValue || 0))
                    updateCart()
                  }}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">{"aUEC"}</InputAdornment>
                    ),
                    inputMode: "numeric",
                  }}
                  size="small"
                  label={t("cart.offerOptional")}
                  value={offer}
                  color={"secondary"}
                />
              </Grid>
              <Grid item>
                <LoadingButton
                  color={"secondary"}
                  variant={"outlined"}
                  startIcon={<LocalOfferRounded />}
                  loading={purchaseLoading}
                  disabled={
                    !hasAvailabilitySet ||
                    !!(
                      orderLimits &&
                      ((orderLimits.min_order_size &&
                        currentSize <
                          parseInt(orderLimits.min_order_size, 10)) ||
                        (orderLimits.max_order_size &&
                          currentSize >
                            parseInt(orderLimits.max_order_size, 10)) ||
                        (orderLimits.min_order_value &&
                          offer < parseInt(orderLimits.min_order_value, 10)) ||
                        (orderLimits.max_order_value &&
                          offer > parseInt(orderLimits.max_order_value, 10)))
                    )
                  }
                  onClick={() => handlePurchase(offer)}
                >
                  {!hasAvailabilitySet
                    ? t("AvailabilityRequirement.submitDisabled")
                    : t("cart.submitOffer")}
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Section>
  )
}

export function MarketCart() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [cookies, setCookie, deleteCookie] = useCookies(["market_cart"])
  const cart = cookies.market_cart

  const updateCart = useCallback(() => {
    setCookie("market_cart", cart, {
      path: "/",
      sameSite: "strict",
      maxAge: 2592000, // 30 days in seconds - cart items may become unavailable or prices may change
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

  return (
    <Page title={t("marketActions.myCart")}>
      <ContainerGrid maxWidth={"md"} sidebarOpen={true}>
        <Grid
          item
          container
          justifyContent={"space-between"}
          spacing={theme.layoutSpacing.layout}
          xs={12}
        >
          <HeaderTitle>
            <BackArrow /> {t("cart.yourCart")}
          </HeaderTitle>
        </Grid>
        <Grid item xs={12} lg={12}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            {(cart || []).map((seller: CartSeller) => (
              <CartSellerEntry
                key={seller.contractor_seller_id || seller.user_seller_id}
                seller={seller}
                updateCart={updateCart}
                removeSellerEntry={removeSellerEntry}
              />
            ))}
            {(!cart || !cart.length) && (
              <Grid item xs={12}>
                <EmptyCart />
              </Grid>
            )}
          </Grid>
        </Grid>
      </ContainerGrid>
    </Page>
  )
}
