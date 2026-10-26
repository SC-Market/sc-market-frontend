---
title: Handle orders as a seller or org team
description: Incoming offers and orders for your shop are on its Orders page. Accept the offer, then move the order through Begin Work and Complete Order.
order: 50
updated: 2026-10-26
keywords: [seller, orders, offers, accept, assign, claim, begin work, complete order, org orders, team]
related: [buying/how-orders-work, orgs/roles-and-permissions, discord/order-alerts-and-claiming]
howto: true
---

As a seller, you handle each sale in two parts: accept the buyer's offer, which creates the order, then move the order along as you deliver. In an org, one member is assigned to each order and does the hand-off in game.

## Before you start

- A shop ([sell items](/guides/selling/sell-items)).
- In an org: the org's **Manage Orders** permission to accept offers and assign orders. Members with only **Claim Orders** can claim orders for themselves (see [roles and permissions](/guides/orgs/roles-and-permissions)).

## Steps

1. Switch the sidebar to your shop and open **Orders**. New offers are listed with the shop's orders. Use the filters, such as **Your turn**, to find the ones waiting for you.
2. Open an offer and choose **Accept**, **Counter Offer** or **Reject**. Accepting creates the order.
3. In an org, assign the order: click **Assign** next to **Assigned**, pick the member and click **Save**. A member can also click **Claim** to take an unassigned order.
4. When you start, click **Begin Work**. The order moves to **Being fulfilled** and is assigned to you.
5. Agree on the hand-off in the order chat, meet in game and trade.
6. Click **Complete Order**. The order is **Fulfilled** and closed.

> [!NOTE]
> Each status change posts a message in the order chat and notifies the buyer. **Cancel** is available to you and to the buyer until the order is complete.

## Where to find your work

- **Orders** in your shop's sidebar: the shop's offers and orders.
- **Org Orders** in the org's sidebar: every order of the org, for members with **Manage Orders**.
- [Assigned to Me](/dashboard): the orders assigned to you, across shops and orgs.

## Who can change an order

- Personal shop: the assigned seller moves the order forward.
- Org shop: the assigned member or anyone with **Manage Orders**.
- Buyers can only cancel. Fulfilled and cancelled orders can't change again.

## Advanced: work from Discord

With the [SC Market bot](/guides/discord/connect-the-discord-bot) set up and your Discord account linked, you can do the same steps without opening the site.

- **Claim**: if your org posts order alerts, members with **Claim Orders** click **Claim** on the alert to take a new order. See [order alerts and claiming](/guides/discord/order-alerts-and-claiming).
- **Update the status**: run `/order status` and pick `newstatus`: **In Progress**, **Fulfilled** or **Cancelled**. Inside an order's thread it updates that order; anywhere else, pick the order in `order` (it suggests your open orders). The same rules apply as on the site, and the buyer and the order thread are notified.

[How orders work](/guides/buying/how-orders-work "cta")
