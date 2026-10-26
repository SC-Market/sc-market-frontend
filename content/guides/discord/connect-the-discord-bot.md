---
title: Connect the SC Market Discord bot
description: Add the bot to your server, then run /register server and /register channel so every new offer and order gets its own Discord thread.
order: 10
updated: 2026-10-25
keywords: [discord, bot, register, thread, order thread, server, channel, forum]
related: [discord/order-alerts-and-claiming, orders/how-orders-work]
howto: true
---

Connect the SC Market bot to your Discord server and register a server and a channel. After that, every new offer and order you receive gets its own thread there, with the buyer added, and messages are copied between the thread and the order chat on SC Market.

## Before you start

- **Administrator** permission in the Discord server.
- A [verified SC Market account](/guides/getting-started/create-an-account) with your Discord account linked.
- For an organization: the org's **Manage Webhooks** permission (see [roles and permissions](/guides/orgs/roles-and-permissions)).

## Steps

1. Add the bot with the **Discord Bot** link in the site footer and pick your server.
2. In the channel where threads should go, run `/register channel user` for yourself, or `/register channel contractor` with your org's Spectrum ID as `name`.
3. In the same server, run `/register server user`, or `/register server contractor` with the same `name`.
4. Check the result in [Settings](/settings) under **Discord Integration** (for an org: the org's **Discord Integration** page). **Integrated Channel** shows the server and channel.

> [!IMPORTANT]
> You need both: the bot only creates threads once a server **and** a channel are registered.

Run `/help` in Discord to list every bot command, or `/help register` for the options of one command.

## Text or forum channel

- In a text channel, each offer or order becomes a **private thread**.
- In a forum channel, it becomes a forum post.
- Other channel types can't hold order threads.

The bot needs to see the channel and create private threads in it. Threads are named `offer-…` and renamed `order-…` when the offer is accepted.

## Which server gets the thread

1. The shop's own Discord settings, if both **Discord Server ID** and **Thread Channel ID** are filled in (Shop Settings › **Discord**).
2. Otherwise the org's registration, for an org shop.
3. Otherwise the assigned seller's personal registration.

## What buyers need

Buyers are added to the thread only if their Discord account is linked to SC Market. If they aren't in your server, the bot sends them an invite by direct message, so they need DMs open. After checkout, SC Market also opens a server invite for them.

## What happens next

- Messages in the thread appear in the order chat on SC Market, and messages on the site appear in the thread.
- Status changes are posted to the thread, and the thread is archived when the order is fulfilled or cancelled.

[Get order alerts and claim orders](/guides/discord/order-alerts-and-claiming "cta")
