---
title: Use the SC Market API with a token
description: Create an API token in Settings and send it with each request, so your own bot or script can read and update your listings, stock and orders.
order: 40
updated: 2026-10-28
keywords: [api, api token, token, bearer, developer, bot, script, integration, automation, stock sync, scm_live, revoke]
related: [discord/webhooks, selling/stock-lots-and-allocation, selling/handle-orders-as-a-seller]
howto: true
---

An API token lets your own bot, script or spreadsheet tool use SC Market as you, without a browser: read your listings and orders, or keep your stock in sync. You create it in [Settings → API Tokens](/settings?tab=api-tokens), choose what it may do, and send it with every request.

> [!NOTE]
> A dedicated public API for tokens is on the way, with its own address, permissions for each kind of task (like stock or orders) and limits for each token. This guide covers tokens as they work today. They keep working until the new API is ready, and the switch will be announced ahead of time.

## Before you start

- An SC Market account. Each token belongs to you and can only do what you can do.
- Somewhere private to run your code, such as a server or your own computer. A token in a web page or a shared sheet is a token anyone can copy.

## Steps

1. Open [Settings → API Tokens](/settings?tab=api-tokens) and click **Create Token**.
2. Enter a **Token Name**, like the name of your bot. A **Description** is optional.
3. Under **Permissions (Scopes)**, tick only what it needs. For example, **Read Market** and **Write Market** to sync stock, or **Read Orders** to watch your orders.
4. Under **Organization Access**, tick each org it may act for. Leave them all unticked if it only works with your personal shop.
5. Optional: set an **Expiration Date** (in UTC). If you leave it empty, the token never expires.
6. Click **Create Token**. Click **Copy Token** and store it somewhere safe: it's only shown this once.

## Make your first request

Send the token in the `Authorization` header to `https://api.sc-market.space`:

```
curl https://api.sc-market.space/api/v1/profile \
  -H "Authorization: Bearer scm_live_…"
```

You get your own profile back, which shows the token works. A `401` means the token is wrong, expired or deleted.

## Change or delete a token

In [Settings → API Tokens](/settings?tab=api-tokens), each token shows its scopes, its orgs and when it was last used.

- **Change it**: click the edit icon, change the scopes, orgs or expiration date, and click **Update Token**. The token itself stays the same.
- **Delete it**: click the delete icon, then **Delete**. The token stops working right away, and anything still using it gets a `401`. If a token leaks, delete it and create a new one.

## Advanced

### Which scope each call needs

The API has two versions, `/api/v1` and `/api/v2`, and a token works on both. Most of the selling tools are in v2. Each call needs a scope for its area: a **Read** scope to look, and a **Write** scope to create, change or delete.

- **Market** (`market:read`, `market:write`): shops, listings, stock lots, buy orders, auctions, inventory, images, suppliers, the watchlist, price alerts and market stats.
- **Orders** (`orders:read`, `orders:write`): orders, the cart and requisitions.
- **Offers** (`offers:read`, `offers:write`): offers and counter offers.
- **Profile** (`profile:read`, `profile:write`): your account, availability, wishlists and the SCMDB link.
- **Organizations**, **Services**, **Chats**, **Notifications**, **Recruiting** and **Comments**: the v1 calls of those areas, plus org domains and notification settings in v2.
- **Read Only** gives every read scope. **Full Access** gives every scope and works for all your orgs, whatever you tick under **Organization Access**. Pick single scopes instead when you can.
- Game data and the public market (search, shop pages, listing pages) need no token at all.

Tokens can never manage tokens, set up two-factor sign-in, change your email or linked RSI account, download your data export or use the site's debug tools: those calls answer `403`. `GET /api/v1/profile` answers any valid token, whatever its scopes, which is why it's the call to check a token with. The **Admin** and **Moderation** scopes are only for site admins.

### Common calls

Write calls send JSON: add `-H "Content-Type: application/json"` and the body with `-d`.

- **Your shops**: `GET /api/v2/shops/mine` (Read Market). It lists your personal shop and the shops of the orgs the token has under **Organization Access**, with each `shop_id` and your permissions there.
- **Your listings**: `GET /api/v2/listings/mine?shop_id=…&status=active` (Read Market).
- **Stock of a listing**: `GET /api/v2/stock-lots?listing_id=…` (Read Market) lists its lots, each with a `lot_id`.
- **Set stock**: `PUT /api/v2/stock-lots/{lot_id}` with `{"quantity_total": 40}`. For many lots at once, `POST /api/v2/stock-lots/bulk-update` with `{"updates": [{"lot_id": "…", "quantity_total": 40}]}` (Write Market).
- **Orders to work on**: `GET /api/v2/orders?role=seller&status=not-started`, and one order with `GET /api/v2/orders/{order_id}` (Read Orders).
- **Move an order on**: `PUT /api/v1/orders/{order_id}` with `{"status": "in-progress"}`, `"fulfilled"` or `"cancelled"` (Write Orders). The same rules apply as on the site.
- **Open offers**: `GET /api/v2/offers/search?role=seller&status=active` (Read Offers).
- **Market search, no token needed**: `GET /api/v2/listings/search?text=…`.

Every call, with its parameters and answers, is in the [API docs](https://api.sc-market.space/docs), for both v1 and v2.

### Orgs

To work with an org's shop, its listings or its orders, the token needs that org under **Organization Access**, and you need the org permission for it, the same as on the site (for example **Manage Market** for listings and stock). Without the org:

- A call that names the org, its shop, listing, lot, order or offer answers `403`, on v1 and v2.
- Lists leave the org out: your orders and offers as a seller, your shops, stock, buy orders, requisitions, suppliers and the org's private listings show only the orgs the token has.
- What you bought or asked for yourself stays in your lists, even from an org's shop.

**Full Access** tokens work for all your orgs.

### Paging

v2 lists take `page` (from 1, at most 500) and `page_size` (20 by default, at most 100; anything bigger is cut to 100). The answer has the items plus `total`, `page` and `page_size`, like `{"listings": […], "total": 42, "page": 1, "page_size": 20}`. Stop when you've read `total` items.

### Errors

Errors look like `{"error": {"code": "FORBIDDEN", "message": "Insufficient token permissions"}}`.

- `400 VALIDATION_ERROR`: a parameter or the body is wrong. `validationErrors` lists the fields when there are any.
- `401 UNAUTHORIZED`: no token, or it's wrong, expired or deleted.
- `403 FORBIDDEN`: the token lacks the scope (`Insufficient token permissions`) or the org (`Token does not have access to this contractor`), or you lack the permission yourself.
- `404 NOT_FOUND`: it doesn't exist, or you can't see it.
- `409 CONFLICT`: it changed or clashes with something else. Read it again, then retry.
- `429 RATE_LIMIT_EXCEEDED`: slow down (see below).

On public calls, like market search or a shop page, a token that doesn't work or doesn't cover the call is simply ignored: you get the public answer, not an error. Check your token with `/api/v1/profile` if results look like you're signed out.

### Rate limits

- **v1** calls count against your account, from each IP address: 500 points a minute. Most calls cost 1 point and some heavy ones 15. Each answer has `X-RateLimit-Remaining` and `X-RateLimit-Reset` (when the minute ends, in unix seconds); `X-RateLimit-Limit` is what that call cost. When you run out, you get a `429` whose `retryAfter` (also the `X-RateLimit-Retry-After` header) says how many seconds to wait.
- **v2** has no limit per token yet, apart from photo uploads. Stay around one request a second, and wait before retrying on `429` or `503`.
- Without a token, v1 allows 120 calls a minute from each IP address, then refuses calls for a minute.

### Keep your tokens safe

- Call the API from your server or script, not from a web page: browsers block other websites from calling the API, and anyone who opens the page could copy the token.
- Use one token for each tool, so you can delete one without breaking the others. You can have up to 25.
- Set an expiration date, and delete tokens you no longer use. **Last used** shows which ones are idle.
- If your account is banned or deleted, its tokens stop working.
