/**
 * The app shell: the components the root and the route modules render
 * (src/root.tsx, src/routes/{layouts,elements}), provided to them by name
 * (src/routes/shell.ts). Only entry.client.tsx imports this (and the tests
 * that mount the route table), so the shell is bundled with the client
 * entry and the route modules stay tiny. Add a component here when a route
 * module needs one.
 */
// i18next is set up before anything renders.
import "../util/i18n"
import { App } from "./App"
import { AppLayout } from "./AppLayout"
import { FrontendErrorElement } from "../pages/errors/FrontendError"
import { LandingPage } from "../pages/home/LandingPage"
import {
  LoggedInRoute,
  OrgAdminRoute,
  OrgRoute,
  SiteAdminRoute,
} from "../components/router/LoggedInRoute"
import { OrgContextFromRoute } from "../components/router/OrgContextFromRoute"
import { RouteErrorFallback } from "../components/error-boundaries"
import { ShopContextFromRoute } from "../components/router/ShopContextFromRoute"
import {
  ShopRedirect,
  ShopRedirectListings,
  ShopRedirectStock,
} from "../components/router/ShopRedirect"

export const shell = {
  App,
  AppLayout,
  FrontendErrorElement,
  LandingPage,
  LoggedInRoute,
  OrgAdminRoute,
  OrgContextFromRoute,
  OrgRoute,
  RouteErrorFallback,
  ShopContextFromRoute,
  ShopRedirect,
  ShopRedirectListings,
  ShopRedirectStock,
  SiteAdminRoute,
}
