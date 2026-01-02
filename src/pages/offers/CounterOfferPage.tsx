import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import React, { useEffect, useState } from "react"
import {
  CounterOfferBody,
  useGetOfferSessionByIDQuery,
} from "../../store/offer"
import { Link, useParams, Navigate } from "react-router-dom"
import {
  Breadcrumbs,
  Grid,
  Link as MaterialLink,
  Skeleton,
  Typography,
} from "@mui/material"
import { OfferDetailSkeleton } from "../../components/skeletons"
import { OfferDetailsEditArea } from "../../views/offers/OfferDetailsEditArea"
import { CounterOfferSubmitArea } from "../../views/offers/CounterOfferSubmitArea"
import { CounterOfferDetailsContext } from "../../hooks/offer/CounterOfferDetails"
import { OfferServiceEditArea } from "../../views/offers/OfferServiceEditArea"
import { OfferMarketListingsEditArea } from "../../views/offers/OfferMarketListingsEditArea"
import { useTranslation } from "react-i18next"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../errors/ErrorPage"

export function CounterOfferPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session, error, isLoading, isFetching } = useGetOfferSessionByIDQuery(id!)
  const { t } = useTranslation()

  const [counterOffer, setCounterOffer] = useState<CounterOfferBody>({
    cost: "0",
    description: "",
    kind: "",
    market_listings: [],
    payment_type: "",
    service_id: null,
    title: "",
    session_id: id || "",
    status: "counteroffered",
  })

  useEffect(() => {
    if (session) {
      setCounterOffer({
        cost: session.offers[0].cost,
        description: session.offers[0].description,
        kind: session.offers[0].kind,
        payment_type: session.offers[0].payment_type,
        session_id: session.id,
        service_id: session.offers[0].service?.service_id ?? null,
        title: session.offers[0].title,
        market_listings: session.offers[0].market_listings,
        status: "counteroffered",
      })
    }
  }, [session])

  return (
    <Page title={t("offers.viewOffer")}>
      <CounterOfferDetailsContext.Provider
        value={[counterOffer, setCounterOffer]}
      >
        <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
          <Grid item xs={12}>
            <Breadcrumbs>
              <MaterialLink
                component={Link}
                to={"/dashboard"}
                underline="hover"
                color={"text.primary"}
              >
                {t("offers.dashboard")}
              </MaterialLink>
              <MaterialLink
                component={Link}
                to={"/offers/received"}
                underline="hover"
                color={"text.primary"}
              >
                {t("offers.receivedOffers")}
              </MaterialLink>
              <MaterialLink
                component={Link}
                to={"/offers/received"}
                underline="hover"
                color={"text.primary"}
              >
                {t("offers.offer")} {(id || "").substring(0, 8).toUpperCase()}
              </MaterialLink>
              <Typography color={"text.secondary"}>
                {t("offers.counterOffer")}
              </Typography>
            </Breadcrumbs>
          </Grid>

          <HeaderTitle lg={12} xl={12}>
            {t("offers.viewOffer")}
          </HeaderTitle>

          {shouldRedirectTo404(error) ? <Navigate to={"/404"} /> : null}
          {shouldShowErrorPage(error) ? <ErrorPage /> : null}

          {!(isLoading || isFetching) && session ? (
            <OfferDetailsEditArea session={session} />
          ) : (
            <Grid item xs={12} lg={8} md={6}>
              <OfferDetailSkeleton
                showContract={!!session?.contractor}
                showAssigned={!!session?.assigned_to}
                showContractLink={!!session?.contract_id}
              />
            </Grid>
          )}

          {!(isLoading || isFetching) && session ? (
            <OfferServiceEditArea offer={session} />
          ) : (
            <Grid item xs={12} lg={4}>
              <Skeleton width={"100%"} height={400} />
            </Grid>
          )}

          {!(isLoading || isFetching) && session ? (
            <OfferMarketListingsEditArea offer={session} />
          ) : (
            <Grid item xs={12} lg={8}>
              <Skeleton width={"100%"} height={400} />
            </Grid>
          )}

          {!(isLoading || isFetching) && session && <CounterOfferSubmitArea session={session} />}
        </ContainerGrid>
      </CounterOfferDetailsContext.Provider>
    </Page>
  )
}
