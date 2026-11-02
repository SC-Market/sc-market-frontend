---
title: Get order alerts in Discord and claim orders
description: Pick an alert channel in your shop's or org's Discord settings to post new orders and offers there. Members with Claim Orders can claim them from the alert.
order: 20
updated: 2026-11-02
keywords: [discord, alerts, setup alerts, claim, claim order, order status, notifications]
related: [discord/connect-the-discord-bot, discord/webhooks, selling/handle-orders-as-a-seller]
howto: true
---

Pick one or more alert channels in your shop's or org's Discord settings, and the SC Market bot posts each new order and offer there. Each org alert has a claim button, so a team member can take the work with one click. Alerts work separately from order threads, so you can use either one or both.

## Before you start

- The SC Market bot in your Discord server, added from SC Market so the server is linked ([connect the bot](/guides/discord/connect-the-discord-bot)). Adding it needs **Manage Server** in the server.
- For a shop: permission to manage it (its owner, or the org's **Manage Market** permission). For an org: the org's **Manage Webhooks** permission.

## Steps

1. Open your shop's settings and find the **Discord** section, or open your org's **Discord Integration** tab.
2. Under **Your Discord servers**, find the server. If it isn't listed, press **Add the bot to a server** first.
3. Pick one or more **Order alert channels**, then press **Save channels**.
4. Wait for the next offer or order: the bot posts a **New Offer** or **New Order** embed with the price, kind and items.
5. To take one, click **Claim Order** (or **Claim Offer**). The button changes to **Claimed by** and your name, and the work is assigned to you.

> [!NOTE]
> An org can post alerts in several channels, and one channel can hold alerts for several orgs. `/setup status` in a channel shows what it gets.

## What gets posted where

- **New Order** alerts go to the shop's and the org's alert channels, and only for orders nobody is assigned to yet. Orders with a personal shop always have an assignee, so they don't get order alerts.
- **New Offer** alerts go to the shop's and the org's alert channels, or to the seller's personal channel when there's no org.
- Only org alerts have a claim button.

## Who can claim

Claiming works for org orders and offers only. You must be a member of the org with its **Claim Orders** permission, and the order must still be open and unassigned. If someone was faster, you see "This order has already been claimed".

## Update an order from Discord

Run `/order status` with `newstatus` set to **In Progress**, **Fulfilled** or **Cancelled**. Inside the order's thread you can leave `order` empty; elsewhere, pick the order from the list. The same rules apply as on the site: see [how orders work](/guides/buying/how-orders-work).

## Advanced

- **Added the bot from Discord instead**, or want alerts for orders placed with you personally: link your Discord account in [Settings](/settings), open the channel, and run `/setup alerts`. Fill in `org` with the org's Spectrum ID for an org's alerts, or leave it empty for your own. It needs **Manage Channels** in the server, and the org's **Manage Orders** or **Manage Webhooks** permission for an org.
- **Stop alerts**: untick the channel under **Order alert channels** and press **Save channels**, or run `/setup remove` in the channel with `kind` set to **Order alerts**, and `org` for an org's alerts. The member who set them up, or anyone with the org's **Manage Orders** or **Manage Webhooks** permission, can remove them. If nothing matches, the bot says what the channel does have.
- **More events**: for a message on status changes and auction bids too, add a [webhook](/guides/discord/webhooks).

[Handle orders as a seller or org team](/guides/selling/handle-orders-as-a-seller "cta")
