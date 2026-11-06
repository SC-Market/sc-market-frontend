---
title: Connect the SC Market Discord bot
description: Add the bot from your shop's or org's Discord settings, then pick a channel there, so every new offer and order gets its own Discord thread.
order: 10
updated: 2026-11-06
keywords: [discord, bot, setup, setup threads, thread, order thread, server, channel, forum, add bot]
related: [discord/order-alerts-and-claiming, discord/webhooks, buying/how-orders-work]
howto: true
---

Add the SC Market bot from your shop's or org's Discord settings and pick the channel that should hold order threads. After that, every new offer and order you receive gets its own thread there, with the buyer added, and messages are copied between the thread and the order chat on SC Market.

## Before you start

- **Manage Server** permission in the Discord server (Discord asks for it to add a bot).
- A [verified SC Market account](/guides/getting-started/create-an-account).
- For a shop: permission to manage it (its owner, or the org's **Manage Market** permission). For an organization: the org's **Manage Webhooks** permission (see [roles and permissions](/guides/orgs/roles-and-permissions)).

## Steps

1. Open your shop's settings and find the **Discord** section, or open your org's **Discord Integration** tab.
2. Press **Add the bot to a server** and pick your server in Discord.
3. Back on SC Market, the server is linked. Pick the **Order threads channel**, and optionally **Order alert channels**, then press **Save channels**.
4. Check the result on the same page. For an org, **Integrated Channel** shows the server and channel.

Run `/setup status` in a channel to see what it gets and for whom. `/help` lists every bot command, and `/help alerts` compares order threads, alerts and [webhooks](/guides/discord/webhooks).

## Text or forum channel

- In a text channel, each offer or order becomes a **private thread**.
- In a forum channel, it becomes a forum post.
- Other channel types can't hold order threads.

The bot needs View Channel, Create Private Threads (Send Messages in a forum), Send Messages in Threads and Create Invite in the channel. Threads are named `offer-…` and renamed `order-…` when the offer is accepted.

## Which channel gets the thread

You, each org and each shop have one thread channel. Picking another channel, or running `/setup threads` in another channel, moves it there.

1. The shop's own channel, if both **Discord Server ID** and **Thread Channel ID** are filled in (Shop Settings › **Discord**).
2. Otherwise the org's channel, for an org shop.
3. Otherwise the assigned seller's own channel.

## What buyers need

Buyers are added to the thread only if their Discord account is linked to SC Market. If they aren't in your server, the bot sends them an invite by direct message, so they need DMs open. After checkout, SC Market also opens a server invite for them.

## Add SC Market to your Discord account

You can also [add SC Market to your Discord account](/discord/install?type=user&src=guide) instead of a server: Discord asks you to authorize the app for your own account, with no server and no permissions. You can then use SC Market's commands anywhere in Discord. If you're signed in to SC Market, this also links your Discord account, unless that Discord account is already linked to another SC Market account.

Adding the app to your account also lets the bot send you direct messages, such as reminders about offers waiting for your reply, even if you don't share a server with it.

> [!NOTE]
> If Discord refuses the bot's direct messages, for example because your privacy settings block them, SC Market can't reach you there. Allow them again in Discord to get DMs.

## If adding the bot didn't work

When you come back from Discord, SC Market shows what happened:

- **Nothing was added**: you left Discord's page early. Click **Start again**.
- **We couldn't finish adding SC Market**: the link expired or was already used. Click **Start again**.
- **Sign in first**: sign in, then add the bot again from your shop's or org's Discord settings.
- **The bot is in your server**: it was added, but not linked to a shop or org. Press **Add the bot to a server** in your shop's or org's Discord settings to link it, or use `/setup threads` (see Advanced).
- **You can't manage this Discord integration**: linking a server needs **Manage Market** for a shop or **Manage Webhooks** for an org. Nothing was linked. Ask someone with that permission to add it.
- **This Discord account is linked to another SC Market account**: nothing changed. Sign in with the SC Market account it belongs to, or use a different Discord account.
- **Your SC Market account is linked to a different Discord account**: nothing changed. Unlink the current one under **Settings › Discord Integration**, then add SC Market again.

## Advanced

- **Added the bot from Discord instead**: the bot can't tell which shop or org the server is for, so link your Discord account in [Settings](/settings), then run `/setup threads` in the channel where threads should go (fill in `org` with its Spectrum ID for an org; leave it empty for yourself). `/setup alerts` does the same for alerts. These commands need **Manage Channels** in the server. [Add the bot](/discord/install?type=server&src=guide) without linking it to anything here.
- **Your own thread channel**: threads for orders placed with you personally (not through a shop or org) are set with `/setup threads` with `org` left empty.
- **Stop threads**: pick **No order threads in this server** and save, or run `/setup remove` with `kind` set to **Order threads** in the thread channel, and `org` for an org. The member who set it up, or anyone with the org's **Manage Webhooks** permission, can remove it.
- **Unlink a server**: **Unlink server** removes it from the list. Threads and alerts already set up there keep working until you change them.
- **Use the SC Market server**: **Use Official Server** under **Discord Integration** sends your threads to the SC Market Discord instead of your own.
- **One shop elsewhere**: give a shop its own server and channel in Shop Settings › **Discord**, by adding the bot there or by entering the IDs. Leave both IDs empty to use the org's or your own channel again.
- **Find a server or channel ID**: in Discord, turn on **Developer Mode** (User Settings › Advanced). Then right-click the server icon and pick **Copy Server ID**, or right-click the channel and pick **Copy Channel ID**.

## What happens next

- Messages in the thread appear in the order chat on SC Market, and messages on the site appear in the thread.
- Status changes are posted to the thread, and the thread is archived when the order is fulfilled or cancelled.

[Get order alerts and claim orders](/guides/discord/order-alerts-and-claiming "cta")
