---
title: Post shop events to Discord with a webhook
description: Paste a Discord webhook URL into your shop's Settings to post new offers, order status changes and auction bids in a channel, without the bot.
order: 30
updated: 2026-10-26
keywords: [discord, webhook, webhooks, notifications, order created, status change, bid, channel, alerts, threads]
related: [discord/connect-the-discord-bot, discord/order-alerts-and-claiming, orgs/org-shop]
howto: true
---

A webhook posts a message in a Discord channel when something happens in your shop, such as a new offer or a status change. You create the webhook in Discord, paste its URL into your shop's settings on SC Market, and pick the events. It doesn't need the SC Market bot.

## Webhook, alerts or threads?

SC Market has three ways to hear about orders in Discord. They work side by side:

- **Order threads**: a private thread per order with the buyer in it, synced with the order chat. Use them to talk to buyers. Needs the bot ([connect the bot](/guides/discord/connect-the-discord-bot)).
- **Alerts**: a post per new org order or offer with a **Claim** button. Use them so your team can grab work. Needs the bot ([order alerts](/guides/discord/order-alerts-and-claiming)).
- **Webhooks**: a plain message per event you choose, with no buttons. Use them for a log channel, or when you can't add the bot.

In Discord, `/help alerts` shows the same comparison.

## Before you start

- **Manage Webhooks** permission in the Discord server, to create the webhook.
- For a personal shop: you own it. For an org shop: the org's **Manage Market** permission.

## Steps

1. In Discord, open the channel's settings, go to **Integrations** › **Webhooks** and click **New Webhook**. Click **Copy Webhook URL**.
2. On SC Market, switch the sidebar to your shop and open **Settings**. Scroll to **Webhooks**.
3. Under **Add Webhook**, enter a **Webhook Name** and paste the **Webhook URL**.
4. Tick the events to send (see below), then click **Add Webhook**.

The webhook is listed above the form, and messages start with the next matching event. In Discord, `/setup webhook` shows these steps too.

> [!NOTE]
> Only Discord webhook URLs work, the kind that start with `https://discord.com/api/webhooks/`. Other addresses are refused.

## Which events are sent

- **Order Created**: new offers and counter-offers for the shop, and new orders that nobody is assigned to yet.
- **Order Status Change**: an order of the shop moves to in progress, fulfilled, cancelled or not started.
- **Market Bid**: a new bid on one of the shop's auctions.
- **Public Order Created**: new unassigned orders placed without any shop, from anyone on SC Market. Leave it off unless you want that feed.

**Order Assigned**, **Order Review** and **Order Comment** are listed too, but they don't send anything for shop webhooks at the moment. Webhook messages never ping anyone.

## Remove or replace a webhook

- **Remove**: click the delete icon next to the webhook in your shop's **Webhooks** section.
- **Replace the URL**: add the new URL as a new webhook, then delete the old entry. There's no edit button.
- **If the URL leaks**: anyone with it can post in your channel. Delete the webhook in Discord (channel settings › **Integrations** › **Webhooks**), create a new one, and swap it on SC Market.

Anyone who can open the shop's **Settings** can see the full webhook URLs.

## Advanced

- **Route events to different channels**: add several webhooks to one shop, each with its own events. For example, send **Order Created** to a sales channel and **Order Status Change** to a logistics channel.
- **Several shops**: webhooks belong to one shop. Give each org shop its own, or point them all at the same channel.
- **Use it with the bot**: webhooks don't replace threads or alerts. Many org shops use threads for buyers, alerts for claiming, and a webhook for a status log.

[Connect the Discord bot](/guides/discord/connect-the-discord-bot "cta")
