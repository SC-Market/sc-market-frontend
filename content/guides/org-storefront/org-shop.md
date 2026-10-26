---
title: Sell as an org with an org shop
description: An org shop sells in your org's name. Members with Manage Market list items and edit shared stock; Manage Orders handles the orders.
order: 10
updated: 2026-10-26
keywords: [org shop, org storefront, organization shop, team selling, shared stock, org orders, manage market, private listing, reviews]
related: [selling/sell-items, selling/handle-orders-as-a-seller, orgs/roles-and-permissions]
howto: true
---

To sell as an org, create a shop owned by the org. Buyers see the org as the seller, the whole team shares its listings and stock, and each order is assigned to the member who delivers it. Your personal shop stays separate.

## Before you start

- The org's **Manage Market** permission (Owner and Admin have it).

## Steps

1. Open [Create Shop](/shops/create) and enter a **Shop Name**. The **Slug** is the shop's web address: at least 3 characters, lowercase letters, numbers and hyphens.
2. Under **Ownership**, choose **Organization shop** and pick the **Organization**.
3. Optionally pick **Tags** and **Supported Languages**, and turn on **Accept custom orders**.
4. Click **Create Shop**. The shop's **Settings** open, where you can change all of these later.
5. Switch the sidebar to the shop and open **Create Listing** to list your first item ([sell items](/guides/selling/sell-items)).

## Org shop or personal shop

- A **personal shop** belongs to you. Only you manage it, and its orders are yours.
- An **org shop** belongs to the org. Its listings show the org as the seller, and it appears on the **Store** tab of your org's page. Members with the right roles share the work.
- Org shops can make a listing **Private (org members only)**, for internal sales.

## Who can do what

Org roles decide what each member can do in the org's shops:

- **Every member** sees the shop in the sidebar's context switcher, with its **Orders**, **Listings** and **Services**.
- **Manage Market**: create and edit listings, change stock lots, and open the shop's **Settings** (including its blocked users and [webhooks](/guides/discord/webhooks)) and **Customers**.
- **Manage Stock**: shows **Stock** in the shop's sidebar. Changing stock lots also needs **Manage Market**.
- **Manage Orders**: accept offers, assign orders, and see every order of the org under **Org Orders** in the org's sidebar.
- **Claim Orders**: claim open orders from [Discord alerts](/guides/discord/order-alerts-and-claiming).

See [roles and permissions](/guides/orgs/roles-and-permissions) to set these up.

## Shared stock

The org shop has one set of stock lots for the whole team. When a member updates a lot's quantity, everyone sees the new number, and orders take stock from the same lots. See [manage stock lots](/guides/selling/stock-lots-and-allocation).

## Orders and reviews

Offers and orders come in on the shop's **Orders** page. Someone with **Manage Orders** accepts them and assigns each order to a member, or members claim them. See [handle orders as an org team](/guides/selling/handle-orders-as-a-seller).

Buyers can review the org after an order. Reviews show on the **Reviews** tab of your org's page, and players can sort the org directory by rating.

## Advanced

- **Move an existing shop to the org**: in that shop's **Settings**, under **Transfer Ownership**, set **Transfer to** to **An Organization**, pick the **Organization** and click **Transfer Ownership**. You need **Manage Market** in that org. Open order assignments held by non-members may be reset so the org can reassign them.
- **Several shops**: an org can own more than one shop, for example one per division. Each has its own listings, stock, Discord threads and webhooks.
- **Per-shop Discord**: a shop's **Discord** settings can send its order threads to a different server than the org's. See [connect the Discord bot](/guides/discord/connect-the-discord-bot), and [webhooks](/guides/discord/webhooks) for an event feed.

[Handle orders as an org team](/guides/selling/handle-orders-as-a-seller "cta")
