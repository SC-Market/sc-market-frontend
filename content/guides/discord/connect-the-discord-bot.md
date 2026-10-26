---
title: Connect the SC Market Discord bot
description: Add the bot to your server, then run /setup in a channel so every new offer and order gets its own Discord thread there.
order: 10
updated: 2026-10-25
keywords: [discord, bot, setup, register, thread, order thread, server, channel, forum]
related: [discord/order-alerts-and-claiming, discord/webhooks, orders/how-orders-work]
howto: true
---

Add the SC Market bot to your Discord server and run `/setup` in the channel that should hold order threads. After that, every new offer and order you receive gets its own thread there, with the buyer added, and messages are copied between the thread and the order chat on SC Market.

## Before you start

- **Administrator** permission in the Discord server.
- A [verified SC Market account](/guides/getting-started/create-an-account) with your Discord account linked.
- For an organization: the org's **Manage Webhooks** permission (see [roles and permissions](/guides/orgs/roles-and-permissions)).

## Steps

1. Add the bot with the **Discord Bot** link in the site footer and pick your server.
2. In the channel where threads should go, run `/setup` and choose **Order threads** as the `kind`. For an org, also fill in `org` with its Spectrum ID; for yourself, leave it empty.
3. Read the bot's reply. It confirms the setup, and warns you if the bot is missing a permission in that channel.
4. Check the result in [Settings](/settings) under **Discord Integration** (for an org: the org's **Discord Integration** tab). **Integrated Channel** shows the server and channel.

Run `/help` in Discord for the 3 setup steps and every bot command. `/help alerts` compares order threads, alerts and [webhooks](/guides/discord/webhooks).

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

## Advanced: the /register commands

`/setup` runs the same registration as the older commands, which still work:

- `/register channel user` sets your personal thread channel, and `/register channel contractor` with the org's Spectrum ID as `name` sets the org's. Either one also records the server.
- `/register server user` or `/register server contractor` only sets the server buyers are invited to, without a thread channel.

Both need **Administrator** in the Discord server.

## What happens next

- Messages in the thread appear in the order chat on SC Market, and messages on the site appear in the thread.
- Status changes are posted to the thread, and the thread is archived when the order is fulfilled or cancelled.

[Get order alerts and claim orders](/guides/discord/order-alerts-and-claiming "cta")
