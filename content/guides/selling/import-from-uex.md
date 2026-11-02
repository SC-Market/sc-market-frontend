---
title: Import your listings from UEX
description: Copy your active UEXCorp sell listings into a shop in one go. Each one becomes an active listing with its price and a listed stock lot.
order: 25
updated: 2026-11-02
keywords: [uex, uexcorp, import, bulk import, move listings, copy listings, migrate]
related: [selling/stock-lots-and-allocation, selling/sell-items]
howto: true
---

If you already sell on UEXCorp, you can copy your active sell listings into an SC Market shop instead of creating each one by hand. You pick which ones to import, and each becomes an active listing at the same price, with its quantity as a listed stock lot.

## Before you start

- A [verified account](/guides/getting-started/create-an-account) and a shop ([sell items](/guides/selling/sell-items)).
- In an org shop: the org's **Manage Market** permission.
- Your UEXCorp username.

## Steps

1. Switch the sidebar to your shop and open **Listings**.
2. Click **Import from UEX**.
3. Enter your **UEX Username** and click **Fetch Listings**. The list shows your active UEX sell listings that aren't sold out, with their **Price**, **Qty** and **Source**.
4. Untick any you don't want. All of them start ticked.
5. Click **Import** (it shows how many are ticked). The dialog says how many were imported.

## What gets imported

- Each UEX listing becomes an **Active**, public, fixed-price listing in the shop, with the UEX title as its title and description.
- Its price is the UEX price per unit, in aUEC.
- Its quantity becomes one listed [stock lot](/guides/selling/stock-lots-and-allocation), with no location. A UEX quality becomes the lot's quality.
- When the title names exactly one game item, the listing is linked to that item, so it shows up under the item in the market.

Nothing changes on UEX: your listings there stay as they are, and stock you sell on SC Market isn't taken off UEX.

> [!WARNING]
> Importing the same listings again creates them a second time. Use **Import More** only for listings you haven't imported yet.

## Advanced

- **At most 100 per import**: the list shows up to 100 of your active sell listings. Create any others with **Create Listing**.
- **Fix up after importing**: add photos or a longer description with **Edit** on each listing. To split a quantity over several locations, add lots with **Add Lot** on the shop's **Stock** page.
- **Nothing found**: check the username is the one on your UEX profile, and that the listings are sell listings that aren't sold out.
- **Unlinked items**: a title that doesn't name exactly one game item imports without one, and a listing's game item can't be changed later. To link it, create the listing again with **Create Listing**, pick the item with **Select Game Item**, and archive the imported one.

[Manage stock lots](/guides/selling/stock-lots-and-allocation "cta")
