---
title: Manage stock lots
description: Your stock is kept in lots. Change a listing's quantity on your shop's Listings page, or edit the lots on its Stock page. Sold stock comes out when you accept.
order: 20
updated: 2026-11-02
keywords: [stock, stock lots, inventory, my stock, quantity, location, allocation, allocated, listed, personal, manage stock, stock subtraction timing, unlimited supply]
related: [selling/sell-items, selling/handle-orders-as-a-seller, selling/import-from-uex]
howto: true
---

Stock on SC Market is kept in lots: a quantity of one item variant, with an optional location and quality. A listing sells from its lots, so buyers can only order what the lots hold. For most listings you just change the quantity on your shop's **Listings** page; the **Stock** page manages the lots themselves.

## Before you start

- A shop with at least one listing ([sell items](/guides/selling/sell-items)).
- In an org shop: the org's **Manage Market** permission, or **Manage Stock** to change lots only (see [permissions for an org shop](/guides/orgs/roles-and-permissions#permissions-for-an-org-shop)).

## Quantity or lots?

- **The simple way: one quantity.** A listing created with a **Quantity** has one lot. Change the quantity on the **Listings** page and you never have to think about lots.
- **The detailed way: several lots.** Give a listing more lots when the same item sits at different locations or comes in different qualities. Each lot has its own quantity, and the listing's quantity is the total of its listed lots.

## Steps

The quick way, for a listing with one lot: change the listing's quantity.

1. Switch the sidebar to your shop and open **Listings**.
2. Click the edit icon (**Edit**) on the listing's row.
3. Change the **Quantity** and click the save icon (**Save**). The difference is added to or taken from the listing's newest listed lot. If that lot can't cover a decrease, change the lots on the **Stock** page instead.

## Advanced: work with the lots

Use the **Stock** page when a listing has several lots, or to change a lot's location.

1. Switch the sidebar to your shop and open **Stock**.
2. Find the lot in **All Stock Lots**. Use **Search lots...** or the **Listing** filter to narrow the list.
3. Edit the lot's **Quantity**, **Location (optional)** or **Status** in the grid: double-click it (or use the pencil), then press Enter to save.
4. To add stock, click **Add Lot**, pick the **Listing**, enter the **Quantity** and the lot's quality, and click **Create Lot**.
5. To remove a lot you no longer have, click its delete icon.

> [!TIP]
> To give a new listing several lots, for example the same item at two locations or in two qualities, add them under **More options** › **Stock Lots** › **Add Stock Lot** when you create it.

## Listed and Personal lots

Each lot's **Status** is **Listed** or **Personal**. Listed stock counts toward what buyers can order. Personal stock is yours but isn't for sale.

## What happens when you sell

By default, when you accept an offer the ordered quantity comes out of a listed lot, so buyers can't order stock you've already sold. **Buy now** purchases and filled buy orders take it at once. If the order is cancelled, the quantity goes back to the lot. **Allocated Stock** on the Stock page lists lots that have stock reserved for open orders. Your shop's stock settings, below, can change when this happens.

## Stock settings

Your shop's **Settings** › **Stock Management** has two settings. **Stock subtraction timing** decides when an order takes units out of your listed stock:

- **When you accept the order (default)**: a cart order takes its units when you accept it. **Buy now** and buy-order sales take them at once.
- **As soon as the order arrives, before you accept it**: a cart order holds its units while you decide. They go back if you reject it or the buyer withdraws it, and a counter offer holds the new quantity instead.
- **Never (unlimited supply)**: listed quantities never go down. A single order still can't be for more than you list.

**Allocation mode** decides which lots an order takes stock from:

- **Automatic (FIFO)**, the default: an order takes its quantity from the listing's listed lots, oldest lot first.
- **Manual selection**: nothing is taken by itself. You pick the lots for each order in its **Stock Allocation** tab.
- **None (legacy)**: orders don't reserve stock from your lots.

The timing only takes stock by itself with **Automatic (FIFO)**. With **Manual selection**, you still pick the lots for each order.

## My Stock: your personal lots

[My Stock](/inventory) lists every lot you own, across your shops. Use **Add Lot** there to track items you aren't selling yet: new lots start unlisted. **Unlink from listing** takes a lot off its listing without deleting it.

[Handle orders as a seller](/guides/selling/handle-orders-as-a-seller "cta")
