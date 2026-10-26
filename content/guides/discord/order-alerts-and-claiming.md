---
title: Get order alerts in Discord and claim orders
description: Subscribe a channel to your org's order and offer alerts with /subscribe alerts. Members with the Claim Orders permission can claim new orders from the alert.
order: 20
updated: 2026-10-25
keywords: [discord, alerts, subscribe, claim, claim order, order status, notifications]
related: [discord/connect-the-discord-bot, orders/handle-orders-as-a-seller]
howto: true
---

Run `/subscribe alerts` in a Discord channel to post your org's new orders and offers there. Each alert has a claim button, so a team member can take the work with one click. Alerts work separately from order threads, so you can use either one or both.

## Before you start

- **Manage Channels** permission in the Discord server, and the SC Market bot in the server ([connect the bot](/guides/discord/connect-the-discord-bot)).
- Your Discord account linked to SC Market.
- For org alerts: the org's **Manage Orders** or **Manage Webhooks** permission.

## Steps

1. Open the channel that should receive alerts.
2. Run `/subscribe alerts` with your org's Spectrum ID as `org_name`. For your personal alerts, run `/subscribe alerts_user` instead.
3. Wait for the next offer or order: the bot posts a **New Offer** or **New Order** embed with the price, kind and items.
4. To take one, click **Claim Order** (or **Claim Offer**). The button changes to **Claimed by** and your name, and the work is assigned to you.

> [!NOTE]
> Each channel holds one subscription. Run `/unsubscribe alerts` to remove it.

## What gets posted where

- **New Order** alerts go to org channels only, and only for orders nobody is assigned to yet.
- **New Offer** alerts go to the org's channels, or to the seller's personal channel for personal shops.
- A personal channel (`alerts_user`) therefore only gets offers.

## Who can claim

Claiming works for org orders and offers only. You must be a member of the org with its **Claim Orders** permission, and the order must still be open and unassigned. If someone was faster, you see "This order has already been claimed".

## Update an order from Discord

Run `/order status` with `newstatus` set to **In Progress**, **Fulfilled** or **Cancelled**. Inside the order's thread you can leave `order` empty; elsewhere, pick the order from the list. The same rules apply as on the site: see [how orders work](/guides/orders/how-orders-work).

[Handle orders as a seller or org team](/guides/orders/handle-orders-as-a-seller "cta")
