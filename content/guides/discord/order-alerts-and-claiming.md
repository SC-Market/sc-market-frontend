---
title: Get order alerts in Discord and claim orders
description: Run /setup with Alerts to post your org's new orders and offers in a channel. Members with the Claim Orders permission can claim them from the alert.
order: 20
updated: 2026-10-25
keywords: [discord, alerts, setup, subscribe, claim, claim order, order status, notifications]
related: [discord/connect-the-discord-bot, discord/webhooks, orders/handle-orders-as-a-seller]
howto: true
---

Run `/setup` with **Alerts** in a Discord channel to post your org's new orders and offers there. Each org alert has a claim button, so a team member can take the work with one click. Alerts work separately from order threads, so you can use either one or both.

## Before you start

- **Manage Channels** permission in the Discord server, and the SC Market bot in the server ([connect the bot](/guides/discord/connect-the-discord-bot)).
- Your Discord account linked to SC Market.
- For org alerts: the org's **Manage Orders** or **Manage Webhooks** permission.

## Steps

1. Open the channel that should receive alerts.
2. Run `/setup`, choose **Alerts** as the `kind`, and fill in `org` with your org's Spectrum ID. For your personal alerts, leave `org` empty.
3. Wait for the next offer or order: the bot posts a **New Offer** or **New Order** embed with the price, kind and items.
4. To take one, click **Claim Order** (or **Claim Offer**). The button changes to **Claimed by** and your name, and the work is assigned to you.

> [!NOTE]
> Each channel holds one alert subscription. Run `/unsubscribe alerts` in the channel to remove it.

## What gets posted where

- **New Order** alerts go to org channels only, and only for orders nobody is assigned to yet.
- **New Offer** alerts go to the org's channels, or to the seller's personal channel for personal shops.
- A personal alert channel therefore only gets offers, without a claim button.

## Who can claim

Claiming works for org orders and offers only. You must be a member of the org with its **Claim Orders** permission, and the order must still be open and unassigned. If someone was faster, you see "This order has already been claimed".

## Update an order from Discord

Run `/order status` with `newstatus` set to **In Progress**, **Fulfilled** or **Cancelled**. Inside the order's thread you can leave `order` empty; elsewhere, pick the order from the list. The same rules apply as on the site: see [how orders work](/guides/orders/how-orders-work).

## Advanced: the /subscribe commands

`/setup` runs the same subscription as the older commands, which still work: `/subscribe alerts` with your org's Spectrum ID as `org_name`, or `/subscribe alerts_user` for yourself. Both need **Manage Channels** in the Discord server.

For a message on more kinds of events, such as status changes and auction bids, add a [webhook](/guides/discord/webhooks) as well.

[Handle orders as a seller or org team](/guides/orders/handle-orders-as-a-seller "cta")
