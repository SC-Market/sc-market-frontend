---
title: Get price alerts with the watchlist
description: Watch an item with a target price. When a public listing is at or below it, you get an alert on the site, by push, by email or as a Discord DM.
order: 20
updated: 2026-11-02
author: Khuzdul
keywords: [watchlist, price alert, watch price, target price, quality, pause, notify, alert, discord, /watchlist]
related: [buying/buy-an-item, getting-started/notification-settings, discord/connect-the-discord-bot]
howto: true
---

To get a price alert, click **Watch price** on an item and set your target price. When someone lists that item at or below your price, SC Market alerts you, so you don't have to keep checking the market.

## Before you start

- An SC Market account. If you aren't signed in, **Watch price** asks you to **Sign in** first and brings you back to the item.

## Steps

1. Open the item. **Watch price** is on every item page in the [Wiki](/wiki/items), on the market page for a game item, and on market listings for a game item.
2. Click **Watch price**. The **Target price** starts at the current lowest price; change it to what you want to pay.
3. For crafted items that come in quality tiers, you can also pick a **Minimum quality**, such as **Tier 3 or better**. Leave it at **Any quality** to be alerted for every listing.
4. Click **Watch price** in the dialog. The button now reads **Watching · Edit**.
5. Wait for an alert. When a public listing hits your price, you get a notification with a link to the listing.

To change the price or quality, or to stop watching, click **Watching · Edit** on the item page and use **Save** or **Stop watching**.

## Manage your watchlist

[Settings › Price Alerts](/settings?tab=price-alerts) lists everything you watch: the item, your target price (and minimum quality), the **Current lowest** price, whether it is **Active** or **Paused**, and when you were **Last alerted**.

- **Edit** with the pencil: change the target price or the minimum quality.
- **Pause** with the pause button: the watch stays on your list but sends no alerts. Press play to resume it. A paused item reads **Paused · Edit** on its page.
- **Remove** with the bin: you stop watching the item.
- **Add item** watches an item without opening its page.

You can also open the tab from **Price alerts** in your profile menu, or by searching "Price alerts" with Ctrl+K.

> [!NOTE]
> You can watch up to 50 items, and each item once. The target price must be a whole number above 1 aUEC. The limit is shared with Discord: watches added with the bot count too.

## Where alerts arrive

Price alerts follow your notification settings. By default you get a site notification, a push notification and a Discord DM; email is off until you turn it on. To change this, open [Notification settings](/settings?tab=notifications&group=market) and use the pills on the **Price alert** row under **Market & watchlist**. The **Where alerts arrive** section on the Price Alerts tab shows what is on now and links there.

## Advanced

- **Use Discord.** With your Discord account linked ([connect the bot](/guides/discord/connect-the-discord-bot)), the bot manages the same watchlist:
  - `/watchlist add` with `query` and `max_price`. Pick an item from the list to watch exactly that item, or type words to watch listing titles.
  - `/watchlist list` shows your items, their target prices, minimum quality, whether they are paused and the current lowest price.
  - `/watchlist remove` with `item`, picked from your list.
  - To pause a watch or set a minimum quality, use [Settings › Price Alerts](/settings?tab=price-alerts).
- **Cooldown.** Each item alerts at most once an hour, so a burst of cheap listings sends one alert.
- **How matching works.** Only public, active, listed listings count, and listings at 1 aUEC are ignored: those are "WTB" placeholders, not offers. An item watch matches listings of exactly that game item. With a minimum quality, only stock of that tier or better counts, at its own price. A text watch from Discord matches listings whose title contains your words as a phrase, in order.
- **When alerts fire.** The check runs when a listing is created, repriced or made public. A listing that was already below your price when you started watching doesn't alert, so check **Current lowest** when you add an item. Resuming a paused watch works the same way.

[Buy an item](/guides/buying/buy-an-item "cta")
