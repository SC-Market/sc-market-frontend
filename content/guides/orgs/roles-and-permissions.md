---
title: Org roles and permissions
description: Roles decide what each member of your org can do on SC Market. Create roles on the Roles and Members page, tick their permissions and rank them by position.
order: 30
updated: 2026-10-26
keywords: [org, organization, roles, permissions, members, owner, admin, rank, position, kick]
related: [orgs/invite-and-manage-members, selling/handle-orders-as-a-seller, discord/order-alerts-and-claiming]
howto: true
---

Each org member has one or more roles, and each role is a set of permissions. You manage them on your org's **Roles and Members** page, which needs the **Manage Roles** permission. Roles are ranked by position: you can only edit roles and members ranked below you.

## Before you start

- A role with **Manage Roles** in the org. New orgs start with **Owner** (position 0, every permission), **Admin** (position 1, every permission) and **Member** (position 10, only **Claim Orders**). New members get **Member**.

## The quick way

Most orgs only need the built-in roles: give trusted officers **Admin** in their **Roles** selector on the **Members** list, and leave everyone else on **Member**. Create your own roles, as below, when you need something in between, such as a trader who can list items but not manage roles.

## Steps

1. Open your org's manage area and select the **Roles and Members** tab.
2. Under **Add Role**, enter a **Role Name**, tick its permissions and click **Create**. New roles start at the bottom of the ranking.
3. To change a role, expand its row in **Roles**, edit the name, **Role Position** or permissions, and click **Save**. Lower numbers rank higher.
4. To give a member a role, pick it in their **Roles** selector in the **Members** list.

> [!WARNING]
> Members with **Manage Roles** can only hand out permissions they have themselves, when they create, edit or assign a role. They still control every role and member ranked below them, so only give it to people you trust.

## What each permission does

- **Manage Org Details**: edit the org's name, description, avatar, banner and language settings, read the audit log, and save [white-label](/guides/org-storefront/white-label) site settings.
- **Manage Roles**: create, edit and delete roles, and assign them to members.
- **Manage Orders**: view, accept, reject and manage all of the org's orders and offers, and review customers.
- **Manage Invites**: create and manage invite codes and links.
- **Manage Market**: create, edit and remove the org's listings and stock lots, and manage the org's shops, including their [webhooks](/guides/discord/webhooks).
- **Manage Stock**: shows **Stock** in an org shop's sidebar. Changing stock lots also needs **Manage Market**.
- **Manage Recruiting**: create and manage recruiting posts.
- **Manage Webhooks**: send the org's [order threads](/guides/discord/connect-the-discord-bot) to a Discord channel with `/setup threads`, and set up its [order alerts](/guides/discord/order-alerts-and-claiming). Shop webhooks need **Manage Market** instead.
- **Manage Blocklist**: block and unblock users for the org.
- **Claim Orders**: claim open orders and offers from [Discord alerts](/guides/discord/order-alerts-and-claiming).
- **Kick Members**: remove members ranked below you (not of the same rank).
- **Manage Theme**: edit the theme of the org's [white-label](/guides/org-storefront/white-label) site. The checkbox only shows for white-label orgs.

## The Owner role

The Owner role can't be deleted or removed from its member. To hand the org to someone else, the owner uses **Transfer Ownership** in [Settings](/settings) under **Contractors**. The new owner must already be a member, and you keep your other roles.

You also can't remove your own top role, or the last role that gives you **Manage Roles**.

## What happens next

Every change to roles and members is recorded on the org's **Audit Logs** tab, with filters for the action, who did it and the date. See [the org audit log](/guides/orgs/audit-logs).

[Handle orders as an org team](/guides/selling/handle-orders-as-a-seller "cta")
