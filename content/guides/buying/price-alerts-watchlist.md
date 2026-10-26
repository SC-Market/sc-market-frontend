---
title: Get price alerts with the watchlist
description: Watch an item with a target price. When a public listing is at or below it, you get an alert on the site, by push, by email or as a Discord DM.
order: 20
updated: 2026-10-25
author: Khuzdul
keywords: [watchlist, price alert, watch price, target price, notify, alert, discord, /watchlist]
related: [buying/buy-an-item, discord/connect-the-discord-bot]
howto: true
---

To get a price alert, click **Watch price** on an item and set your target price. When someone lists that item at or below your price, SC Market alerts you, so you don't have to keep checking the market.

## Before you start

- An SC Market account. If you aren't logged in, **Watch price** takes you to the login page first.

## Steps

1. Open the item. **Watch price** is on every item page in the [Wiki](/wiki/items), and on market listings for a game item.
2. Click **Watch price**. The **Target price** starts at the current lowest price; change it to what you want to pay.
3. Click **Watch price** in the dialog. The button now reads **Watching ≤** and your price.
4. Wait for an alert. When a public listing hits your price, you get a notification with a link to the listing.

To change the price or stop watching, click **Watching ≤** on the item page, or open [Settings → Price Alerts](/settings?tab=price-alerts).

## Manage your watchlist

[Settings → Price Alerts](/settings?tab=price-alerts) lists everything you watch, with its target price, the **Current lowest** price and when you were **Last alerted**. Use **Add item** to watch an item without opening its page, the pencil to change a target price, and the bin to stop watching. You can also open it from **Price alerts** in your profile menu, or by searching "Price alerts" with Ctrl+K.

> [!NOTE]
> You can watch up to 50 items, and each item once. The target price must be a whole number above 1 aUEC.

## Advanced

- **Choose where alerts go.** Under **Alert channels** on the same tab, turn on **Site notification**, **Push notification**, **Email** and **Discord DM**. All are on except email, which you have to turn on. Push and email are the same switches as **Price Alerts** on the Push and Email tabs.
- **Use Discord.** With your Discord account linked ([connect the bot](/guides/discord/connect-the-discord-bot)), the bot manages the same watchlist:
  - `/watchlist add` with `query` and `max_price`. Pick an item from the list to watch exactly that item, or type words to watch listing titles.
  - `/watchlist list` shows your items, their target prices and the current lowest price.
  - `/watchlist remove` with `item`, picked from your list.
- **Cooldown.** Each item alerts at most once an hour, so a burst of cheap listings sends one alert.
- **How matching works.** Only public, active, listed listings count, and listings at 1 aUEC are ignored: those are "WTB" placeholders, not offers. An item watch matches listings of exactly that game item. A text watch from Discord matches listings whose title contains your words as a phrase, in order.
- **When alerts fire.** The check runs when a listing is created, repriced or made public. A listing that was already below your price when you started watching doesn't alert, so check **Current lowest** when you add an item.

[Buy an item](/guides/buying/buy-an-item "cta")
