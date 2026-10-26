---
title: Your org's manage pages
description: The Manage Org area holds your org's profile, roles, invites, Discord, settings, audit log and theme. Each tab shows only if your roles allow it.
order: 40
updated: 2026-10-26
keywords: [manage org, org settings, org admin, about, roles, invites, discord integration, audit logs, transfer ownership, archive org]
related: [orgs/register-an-org, orgs/roles-and-permissions, orgs/invite-and-manage-members]
---

Everything about running your org is in its **Manage Org** area. Open [My Organizations](/my-orgs) and click **Manage** on the org, or switch the sidebar to the org and click **Manage**. You see the tabs your roles allow.

## Who can open it

You need at least one of **Manage Org Details**, **Manage Roles**, **Manage Invites**, **Manage Webhooks** or **Manage Theme**. See [roles and permissions](/guides/orgs/roles-and-permissions).

## About

The org's name, Markdown description, **Org Tags**, logo and banner. Needs **Manage Org Details**. See [register your org](/guides/orgs/register-an-org#set-up-the-org-profile).

## Roles and Members

Create and rank roles, tick their permissions, give members roles, and kick members. Needs **Manage Roles**. See [roles and permissions](/guides/orgs/roles-and-permissions).

## Invites

Invite players by username and create invite links. Needs **Manage Invites**. See [invite and manage members](/guides/orgs/invite-and-manage-members).

## Discord Integration

Shows the org's **Integrated Channel** for order threads, and a **Use Official Server** button to run order threads in the SC Market Discord instead of your own. To use your own server, run `/setup threads` with `org` set to your Spectrum ID in the channel that should hold them. Both need **Manage Webhooks**. See [connect the Discord bot](/guides/discord/connect-the-discord-bot).

## Settings

- **Language**: the org's main language.
- **Supported Languages**: every language your members speak. Click **Save Languages**. Players filter orgs and recruiting posts by these.

Needs **Manage Org Details**.

## Audit Logs

A history of changes to the org: members, roles, invites, settings and more. See [the org audit log](/guides/orgs/audit-logs).

## Market, Blocked Users and Customers

These tabs now only point you to your shops. Listings, market settings, blocked users and customers are managed per shop, in each shop's **Settings** and **Customers** pages. See [sell as an org](/guides/org-storefront/org-shop).

## Theme & White Label

Only for orgs with [white-label](/guides/org-storefront/white-label), and members with **Manage Theme**. See [customize your white-label theme](/guides/org-storefront/white-label-theme).

## Owner actions

The owner handles these in [Settings](/settings), under **Contractors**:

- **Transfer Ownership**: pick a current member as the new owner. You lose the Owner role but keep your other roles. This can't be undone.
- **Archive Organization**: removes all members, cancels open orders and hides the org. You can add a reason. This can't be undone.

Other members see **Leave Organization** there instead.

## Advanced

- **Org Orders** in the org's sidebar lists every order of the org, for members with **Manage Orders**. See [handle orders as an org team](/guides/selling/handle-orders-as-a-seller).
- Some org settings only work on sc-market.space, not on a white-label address: roles, ownership transfer and webhooks.

[Org roles and permissions](/guides/orgs/roles-and-permissions "cta")
