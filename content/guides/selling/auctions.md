---
title: Run and bid on auctions
description: Sellers set an end time, a minimum bid increment and an optional reserve price. When the auction ends, the highest bidder gets an offer at their bid.
order: 30
updated: 2026-10-25
keywords: [auction, bid, bidding, reserve price, increment, highest bid, end time]
related: [buying/buy-an-item, orders/how-orders-work]
howto: true
---

An auction is a listing with **Auction** as its sale type. Buyers bid in aUEC until the end time, and the highest bid wins. The winner gets an offer at their bid, which the seller accepts like any other offer.

## Before you start

- A [verified account](/guides/getting-started/create-an-account), for sellers and bidders.
- Sellers: a shop ([sell items](/guides/selling/sell-items)).

## Steps

1. Create a listing and open **More options**.
2. Under **Sale Type**, choose **Auction**.
3. Set the **Auction End Time**. It must be in the future.
4. Set the **Min Bid Increment (aUEC)**, 1000 by default. Each bid must beat the current highest bid by at least this much.
5. Optionally set a **Reserve Price (optional)**: the auction won't sell below it.
6. Click **Create Listing**. You get a notification for every new bid.

## Bid on an auction

1. Open the auction listing. The bid panel shows the **Current Bid**, when it **Ends In**, and the **Bid History**.
2. Enter **Your Bid (aUEC)**: at least the current highest bid plus the increment.
3. Click **Place Bid**.

A new bid replaces your previous one, so you only ever have one bid on an auction. You can't bid on your own shop's auctions, or after the end time.

> [!NOTE]
> There's no outbid notification. Check back on the listing before it ends.

## When the auction ends

SC Market checks for ended auctions every few minutes.

- If the highest bid meets the reserve price, the winner gets an offer named "Auction Won" for that amount, and the listing is marked sold. The seller then accepts the offer, and the trade continues as in [how orders work](/guides/orders/how-orders-work).
- If nobody bid, or the reserve price wasn't met, the listing expires.

[How orders work](/guides/orders/how-orders-work "cta")
