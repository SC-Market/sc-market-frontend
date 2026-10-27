---
title: Choose your notifications
description: Pick where each kind of notification reaches you (in-app, push, email, Discord DM), per organization, and opt in to alerts for new public contracts.
order: 30
updated: 2026-10-27
keywords: [notifications, push, email, discord, discord dm, settings, unsubscribe, public contracts, contract alerts, webhook, notification settings, mute organization, new member]
related: [buying/price-alerts-watchlist, discord/order-alerts-and-claiming, discord/webhooks]
howto: true
---

SC Market tells you about orders, offers, messages, bids, reviews, invites, price alerts and announcements. In **Settings › Notifications** you choose where each one reaches you: on the site (in-app), as a push notification, by email, or as a Discord DM.

## Before you start

- **Push:** turn on push notifications for this browser or phone at the bottom of the same page. On iPhone, add SC Market to your Home Screen first.
- **Email:** add and verify an email address at the bottom of the same page. Email is off until you turn it on, except for organization invites (on unless you turn it off) and announcements (always sent).
- **Discord DM:** link your Discord account under **Settings › Discord**. DMs are off by default, except for price alerts.

## Steps

1. Open **Settings › Notifications**. The links in our emails open it directly.
2. Pick a tab: **Orders & offers**, **Messages**, **Market & watchlist**, **Orgs & contracts** or **Account**.
3. Each row has a pill per channel: **In-app**, **Push**, **Email** and **Discord DM**. Click a pill to turn that channel on or off. A filled pill is on.
4. A dashed pill means the events in that row are set differently. Click **Customise** under the row to set each one, for example push for fulfilled orders but not for cancelled ones.

Some pills can't be changed:
- **In-app** is always on, except for price alerts.
- **Announcements** from the SC Market team are always delivered: in-app, by push and by email.
- **Discord DM** is greyed out until you link Discord. For some order, offer and message notifications it isn't available yet.

## Organization notifications

Orders, offers, messages, bids, reviews, new members and public contracts that you get as a member of an organization have their own settings for each organization. Pick the organization under **Settings for** to change them.
- You only get an organization's notifications when your role allows the work: orders, offers and their messages need **Manage orders**, bids need **Manage market**, and **New member joined** needs **Manage invites**.
- Your personal settings don't apply to organization work, and the organization's settings don't apply to your personal orders. As a customer you always use your personal settings.
- Discord DM can be set per organization. Without an organization setting, your personal one applies.
- **Mute this org** (under **Settings for**, once you pick the organization) stops push, email and Discord DMs from that organization for 8 hours, a week, or until you turn it back on. Its notifications still appear on the site, and announcements still arrive.
- **New member joined** tells you, on the site only by default, when someone joins an organization where you can manage invites.

## Offers and public contracts

- When you accept, reject or withdraw an offer, the other side is told. You're told when they do it.
- When someone makes an offer on your public contract, you get **Offer on your contract**.
- To hear about **new public contracts** posted by others, open **Orgs & contracts** and, under **New public contract alerts**, turn on the switch for yourself or for an organization. Click contract kinds (for example **Escort** and **Transport**) to hear only about those; with none selected you hear about every kind. You never get an alert for your own contracts.

## Advanced

- **A channel feed in Discord:** in a Discord server, run `/setup contracts` (fill in `org` for your organization) to post every new public contract in that channel with its kind, payment, cost and a link. `/setup remove` turns it off. It needs the same permissions as [order alerts](/guides/discord/order-alerts-and-claiming).
- **A webhook:** in your shop's or organization's webhook settings, tick **New public contracts (site-wide)** to post them to a Discord webhook. See [webhooks](/guides/discord/webhooks).
- **Unsubscribing from email:** every notification email has an unsubscribe link, and **Manage preferences** in the email opens this page.
