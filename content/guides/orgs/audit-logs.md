---
title: Check your org's audit log
description: The Audit Logs tab records who changed what in your org, from new members and role changes to invites and settings. Filter by action, member or date.
order: 50
updated: 2026-10-26
keywords: [audit log, audit logs, org history, who changed, member removed, role assigned, invite, org security]
related: [orgs/manage-your-org, orgs/roles-and-permissions, orgs/invite-and-manage-members]
howto: true
---

Your org's **Audit Logs** tab lists every recorded change to the org, newest first, with who made it and when. Use it to see who joined, who changed a role, or who created an invite link.

## Before you start

- The org's **Manage Org Details** permission.

## Steps

1. Open [My Organizations](/my-orgs), click **Manage** on your org and select **Audit Logs**.
2. Read the list: each entry shows the action, the member who did it (or **System**), and the time.
3. Click an entry with details to expand its **Metadata**, such as the role or the invite involved.
4. To narrow the list, pick an action under **Filter by Action**, a member under **Filter by member**, or set a **Start Date** and **End Date**. Click **Clear Filters** to see everything again.

## What gets recorded

- **Members**: **Member Added**, **Member Removed**, **Role Assigned to Member**, **Role Removed from Member**.
- **Roles**: **Role Created**, **Role Updated**, **Role Deleted**.
- **Invites**: **Invite Created**, **Invite Deleted**, **Invite Accepted**.
- **The org**: **Organization Created**, **Organization Updated**, **Settings Updated**, **Discord Linked**, ownership transfers and **Organization Archived**.
- **Shops**: **Shop Transferred**, when the org's shop moves to another owner or a shop moves into the org. Only the org's owner can transfer an org shop.
- **Orders**: **Order Cancelled** and **Offer Rejected**.
- **White-label**: theme changes, for orgs with [white-label](/guides/org-storefront/white-label).

## Advanced

- **Filter by member**: start typing a username and pick the member. You can also type the full username of someone who has left the org.
- **Other actions**: **Filter by Action** also accepts a typed action name, for example `org.ownership_transferred` or `theme_updated`.
- **Large orgs**: the list is paged, and the summary under it shows how many entries match.

## What happens next

If you spot a change nobody should have made, check that member's roles on **Roles and Members** and remove permissions they don't need. See [roles and permissions](/guides/orgs/roles-and-permissions).

[Your org's manage pages](/guides/orgs/manage-your-org "cta")
