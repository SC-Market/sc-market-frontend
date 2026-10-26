---
title: "Sell items: open a shop, list items and manage stock"
description: Every listing belongs to a shop. Create your shop, list an item with a price in aUEC and a quantity, then keep your stock lots up to date.
order: 10
updated: 2026-10-26
keywords: [sell, listing, create listing, shop, stock, inventory, auction, price]
related: [selling/stock-lots-and-allocation, selling/auctions, buying/how-orders-work]
howto: true
---

To sell on SC Market you list items from a shop: create the shop once, then create a listing for each item with its price in aUEC and the quantity you have. Buyers send you offers, and you trade in game.

## Before you start

- A [verified account](/guides/getting-started/create-an-account). Unverified accounts can't create listings.

## Steps

1. Open [My Shops](/dashboard/shops) and click **Create Shop**. SC Market creates a personal shop named after you. Click **Manage** to rename it and fill in its settings.
2. Switch the sidebar to your shop and open **Create Listing**.
3. Under **About**, pick the game item with **Select Game Item**, then enter a **Title** and **Description**. You can add photos.
4. Under **Pricing & Quantity**, enter the **Price** in aUEC and the **Quantity** you have.
5. Click **Create Listing**. An **Active** listing is visible to buyers right away.

> [!TIP]
> Click **More options** for the **Sale Type** (**Fixed Price**, **Auction** or **Negotiable**), order limits, bulk discounts, the pickup method, and extra **Stock Lots** with their own quality, source and location. Choose **Inactive (Draft)** under **Listing Status** to save a listing without publishing it.

## Shops for organizations

To sell on behalf of an org, [create a shop](/shops/create) and choose **Organization shop**. You need the org's **Manage Market** permission. Org shops can also make a listing **Private (org members only)**.

## Run an auction

Choose **Auction** as the sale type and set an end time, a minimum bid increment and an optional reserve price. See [run and bid on auctions](/guides/selling/auctions).

## Manage listings and stock

- **Listings** in your shop's sidebar shows every listing. Use **Edit**, **Activate**, **Deactivate** or **Archive** to change one.
- **Stock** shows **All Stock Lots**: item, variant, quantity, location and the listing each lot belongs to. Edit a lot's quantity there when your inventory changes. See [manage stock lots](/guides/selling/stock-lots-and-allocation).

## Advanced: list and update many items at once

Your shop's **Listings** page works on several listings at a time:

- **Change many at once**: tick the listings' checkboxes, then click **Activate**, **Deactivate** or **Archive**. Archive asks you to confirm with **Archive permanently**: archived listings leave the market for good.
- **Quick listings**: click the plus icon (**Add Quick Listing**) to add a row, pick the item, set the price and quantity, and click the save icon. The row becomes an active listing titled after the item, without the full form. Edit it later to add a description and photos.
- **Edit in place**: click a row's edit icon to change its **Price**, **Quantity** or **Status**, then the save icon.
- **Import a catalog**: `/listing import` in Discord copies your sell listings from UEXCorp (see below).

## Advanced: manage listings from Discord

With the [SC Market bot](/guides/discord/connect-the-discord-bot) in your server and your Discord account linked, `/listing` does the common edits without opening the site. Set `owner` to **Me** or one of your orgs.

- `/listing create` opens a short form for a new listing (title, price, quantity, description).
- `/listing price` changes a listing's price, and `/listing stock` sets, adds to or subtracts from its quantity.
- `/listing view` shows your listings with their stock and price.
- `/listing import` copies your sell listings from UEXCorp, after you confirm.

## What happens next

Offers and orders for your shop appear under **Orders** in your shop's sidebar. Accept an offer to turn it into an order, then meet the buyer in game to hand over the item and collect the aUEC.

[How orders work](/guides/buying/how-orders-work "cta")
