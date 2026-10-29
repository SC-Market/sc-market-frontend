---
title: Use the SC Market API with a token
description: Create an API token in Settings and call the SC Market public API, so your bot or script can read your shops, stock and orders and answer offers.
order: 40
updated: 2026-10-29
keywords: [api, public api, api token, token, bearer, developer, bot, script, integration, automation, stock sync, scmp_live, scm_live, legacy token, revoke]
related: [discord/webhooks, selling/stock-lots-and-allocation, selling/handle-orders-as-a-seller]
howto: true
---

An API token lets your own bot, script or spreadsheet tool use SC Market as you, without a browser: read your shops, listings and stock, follow your orders, move them on and answer offers. You create the token in [Settings → API Tokens](/settings?tab=api-tokens), pick what it may do, and send it with every request to the **public API** at `https://api.sc-market.space/api/public/v1`.

> [!NOTE]
> The public API is the way to go for anything new. Tokens made before it, now listed under **Legacy tokens**, keep working on the old `/api/v1` and `/api/v2` routes for now, but not on the public API (see [Legacy tokens](#legacy-tokens) below). Any switch-off will be announced ahead of time.

## Before you start

- An SC Market account. Each token belongs to you and can only do what you can do, right now: if you lose a permission in an org, your tokens lose it too.
- Somewhere private to run your code, such as a server or your own computer. A token in a web page or a shared sheet is a token anyone can copy.

## Steps

1. Open [Settings → API Tokens](/settings?tab=api-tokens) and click **Create token**.
2. Enter a **Name**, like the name of your bot. A **Description** is optional.
3. Under **What it may do**, pick a preset:
   - **Shop sync**: read your shops, listings and stock.
   - **Order desk**: read your shops and orders, move orders on, and accept or decline offers.
   - **Read only**: read shops, listings, stock, orders and offers, and change nothing.
4. Under **Orgs it may act for**, tick each org it may work with. Leave them all unticked if it only works with your personal shop.
5. Under **Expires after**, choose how long it lasts (90 days by default, a year at most).
6. Click **Create token**, then **Copy token**, and store it somewhere safe: it's only shown this once.

## Make your first request

Send the token in the `Authorization` header:

```
curl https://api.sc-market.space/api/public/v1/me \
  -H "Authorization: Bearer scmp_live_…"
```

You get back your user and the token's scopes, orgs and expiry date, which shows the token works. A `401` means the token is wrong, expired or revoked.

## Revoke a token

In [Settings → API Tokens](/settings?tab=api-tokens), each token shows its preset, scopes, orgs, expiry date, when it was last used and how many requests it made in the last 30 days. Click the revoke icon, then **Revoke**. Anything still using it gets a `401` within a minute. If a token leaks, revoke it and create a new one. To change what a token may do, create a new one and revoke the old one.

## Advanced

### What you can call

Every call needs the scope shown in brackets; the presets above bundle them. `{shop}` is a shop's id or its slug.

- **The token itself**: `GET /me` (any token).
- **Your shops**: `GET /shops` lists your personal shop and the shops of the orgs the token has, with your permissions in each; `GET /shops/{shop}` (shops:read).
- **Listings**: `GET /shops/{shop}/listings?status=active` lists every listing of the shop, private and unlisted ones included; `GET /listings/{id}` (listings:read).
- **Stock**: `GET /listings/{id}/stock` lists the listing's stock lots, with quantities and locations (stock:read).
- **Orders**: `GET /orders?role=seller&status=not-started`, also with `shop` and `updated_since`; `GET /orders/{id}` (orders:read).
- **Move an order on**: `POST /orders/{id}/status` with `{"status": "in-progress"}`, `"fulfilled"` or `"cancelled"` (orders:write). The same rules and notifications apply as on the site: the seller side moves an order forward, and the customer may cancel.
- **Offers**: `GET /offers?role=seller&status=active`; `GET /offers/{id}` (offers:read).
- **Answer an offer**: `POST /offers/{id}/accept` (creates the order) or `POST /offers/{id}/decline` (offers:write). Only when it's your turn: the seller answers the customer's offer, the customer answers a counter offer.

Write calls send JSON: add `-H "Content-Type: application/json"` and the body with `-d`. The full list, with every parameter and answer, is in the [API docs](https://api.sc-market.space/docs) and the [OpenAPI spec](https://api.sc-market.space/api/public/v1/openapi.json).

Game data and the public market (search, shop pages, listing pages) need no token at all and aren't part of the public API.

### Orgs

To work with an org's shop, its listings, orders or offers, the token needs that org under **Orgs it may act for**, and you need the org permission for it yourself, the same as on the site (for example **Manage Orders** to move an org's order on).

- Anything of an org the token doesn't have answers `404`, as if it didn't exist.
- Lists leave those orgs out: your shops, and your orders and offers as a seller.
- What you bought or asked for yourself stays visible, even from an org's shop.

### Answers and paging

A successful answer is `{"data": …}`. Lists take `page` (from 1) and `page_size` (25 by default, at most 100; anything bigger is cut to 100), and answer like `{"data": {"orders": […], "total": 42, "page": 1, "page_size": 25}}`. Stop when you've read `total` items. For syncing, ask only for what changed with `updated_since` (an ISO date and time, like `2026-10-29T12:00:00Z`).

### Errors

Errors look like `{"error": {"code": "INSUFFICIENT_SCOPE", "message": "…"}}`.

- `400 VALIDATION_ERROR`: a parameter or the body is wrong. `validationErrors` lists the fields.
- `401 UNAUTHORIZED`: no token. `401 INVALID_TOKEN`: the token is wrong, expired, revoked, or a legacy token.
- `403 INSUFFICIENT_SCOPE`: the token lacks the scope; `details.required` and `details.granted` say which. `403 FORBIDDEN`: you may not do this yourself (for example, it isn't your turn on an offer). `403 ACCOUNT_BANNED`: the account is banned.
- `404 NOT_FOUND`: it doesn't exist, or the token can't reach it.
- `409 CONFLICT`: the order or offer is already closed.
- `429 RATE_LIMIT_EXCEEDED`: slow down; wait the seconds in `Retry-After`.
- `503 SERVICE_UNAVAILABLE`: the API is busy; wait the seconds in `Retry-After` and retry.

### Rate limits

- Each token: 120 reads a minute (at most 30 in any 10 seconds) and 30 writes a minute.
- All your tokens together: 300 requests a minute.
- Every answer has `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset` (unix seconds) for the token.
- After 20 requests with a wrong token from one IP address in 15 minutes, that address gets `429` for a while.

### Keep your tokens safe

- Call the API from your server or script, not from a web page: the public API doesn't answer browsers on other sites, and anyone who opens the page could copy the token.
- Use one token for each tool, so you can revoke one without breaking the others. You can have up to 25 active tokens.
- Give each token only the preset and orgs it needs, and revoke tokens you no longer use. **Last used** shows which ones are idle.
- Tokens of test accounts start with `scmp_test_` and only see the test realm.
- If your account is banned or deleted, its tokens stop working.

## Legacy tokens

Tokens made before the public API (they start with `scm_live_`) are listed under **Legacy tokens** in [Settings → API Tokens](/settings?tab=api-tokens). They still work, as before, on the old routes under `https://api.sc-market.space/api/v1` and `/api/v2`, with the scopes and orgs you gave them. You can still create one there with **Create legacy token**.

- A legacy token doesn't work on the public API, and a public API token doesn't work on the old routes: each answers `401 INVALID_TOKEN` on the other. There's no way to convert one into the other; create a new token instead.
- On the old routes, a legacy token that doesn't cover a public call (like market search) is ignored, so you get the anonymous answer. Check a legacy token with `GET /api/v1/profile`.
- Legacy tokens will stop working some time after the public API is in use. The date will be announced on this page and in your token settings well ahead of time.
