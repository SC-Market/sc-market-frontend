---
title: Connect the SC Market Discord bot
description: Add the bot to your server, then run /setup threads in a channel so every new offer and order gets its own Discord thread there.
order: 10
updated: 2026-10-26
keywords: [discord, bot, setup, setup threads, thread, order thread, server, channel, forum]
related: [discord/order-alerts-and-claiming, discord/webhooks, orders/how-orders-work]
howto: true
---

Add the SC Market bot to your Discord server and run `/setup threads` in the channel that should hold order threads. After that, every new offer and order you receive gets its own thread there, with the buyer added, and messages are copied between the thread and the order chat on SC Market.

## Before you start

- **Manage Channels** permission in the Discord server.
- A [verified SC Market account](/guides/getting-started/create-an-account) with your Discord account linked.
- For an organization: the org's **Manage Webhooks** permission (see [roles and permissions](/guides/orgs/roles-and-permissions)).

## Steps

1. Add the bot with the **Discord Bot** link in the site footer and pick your server.
2. In the channel where threads should go, run `/setup threads`. For an org, fill in `org` with its Spectrum ID; for yourself, leave it empty.
3. Read the bot's reply. It confirms the setup, and warns you if the bot is missing a permission in that channel.
4. Check the result in [Settings](/settings) under **Discord Integration** (for an org: the org's **Discord Integration** tab). **Integrated Channel** shows the server and channel.

Run `/setup status` in a channel to see what it gets and for whom. `/help` lists every bot command, and `/help alerts` compares order threads, alerts and [webhooks](/guides/discord/webhooks).

## Text or forum channel

- In a text channel, each offer or order becomes a **private thread**.
- In a forum channel, it becomes a forum post.
- Other channel types can't hold order threads.

The bot needs View Channel, Create Private Threads (Send Messages in a forum), Send Messages in Threads and Create Invite in the channel. Threads are named `offer-…` and renamed `order-…` when the offer is accepted.

## Which channel gets the thread

You, each org and each shop have one thread channel. Running `/setup threads` in another channel moves it there.

1. The shop's own channel, if both **Discord Server ID** and **Thread Channel ID** are filled in (Shop Settings › **Discord**).
2. Otherwise the org's channel, for an org shop.
3. Otherwise the assigned seller's own channel.

## What buyers need

Buyers are added to the thread only if their Discord account is linked to SC Market. If they aren't in your server, the bot sends them an invite by direct message, so they need DMs open. After checkout, SC Market also opens a server invite for them.

## Advanced

- **Stop threads**: run `/setup remove` with `kind` set to **Order threads** in the thread channel, and `org` for an org. The member who set it up, or anyone with the org's **Manage Webhooks** permission, can remove it.
- **Use the SC Market server**: **Use Official Server** under **Discord Integration** sends your threads to the SC Market Discord instead of your own.
- **One shop elsewhere**: give a shop its own server and channel in Shop Settings › **Discord**. Leave both empty to use the org's or your own channel again.

## What happens next

- Messages in the thread appear in the order chat on SC Market, and messages on the site appear in the thread.
- Status changes are posted to the thread, and the thread is archived when the order is fulfilled or cancelled.

[Get order alerts and claim orders](/guides/discord/order-alerts-and-claiming "cta")
