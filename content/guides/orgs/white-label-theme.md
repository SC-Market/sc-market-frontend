---
title: Customize your white-label theme
description: On the Theme & White Label tab, load a preset or set each color, style and corner radius for dark and light mode, then click Save Theme.
order: 55
updated: 2026-10-25
keywords: [white label, theme, theme editor, colors, palette, preset, favicon, border radius, branding, homepage]
related: [orgs/white-label, orgs/manage-your-org]
howto: true
---

Your org's theme sets the colors and style of your white-label site. Start from a preset, adjust what you like, and save. The theme only shows on your white-label address, not on sc-market.space.

## Before you start

- White-label turned on for your org ([request it](/guides/orgs/white-label)).
- The org's **Manage Theme** permission.

## Steps

1. Open [My Organizations](/my-orgs), click **Manage** on your org and select **Theme & White Label**.
2. Pick **Dark Mode** or **Light Mode** at the top. You set each mode separately.
3. Under **Load Preset**, click a color swatch. Hover a swatch to see its name. A preset replaces everything you set for that mode, so load it before you fine-tune.
4. Check the **Preview** next to the editor, then switch to the other mode and pick a preset for it too.
5. Click **Save Theme**. Both modes are saved together.

Visitors see dark or light mode depending on their own theme setting. Changes show on their next page load.

> [!TIP]
> To start over, click **Reset to Default** and confirm. This deletes your saved theme for both modes and can't be undone.

## Advanced: the full theme editor

Every setting applies to the mode you're editing.

### Colors

Each color has a picker and a text field for a hex value:

- **Primary** and **Secondary**: the main accent colors, for example on buttons and links.
- **Button Text**: text on primary buttons.
- **Primary hover (filled buttons)**: the color of filled primary buttons on hover.
- **Background**, **Paper**, **Sidebar** and **Navbar**: the page, card and panel surfaces. In dark mode, listing thumbnails fade toward the **Sidebar** color.
- **Text** and **Text Secondary**: main and muted text.
- **Border Color**: outlines and input borders.
- **Menu & list hover**: hovered sidebar rows, menus and lists, and loading placeholders.

### Style

- **Paper Style** and **Card Style**: **Outlined** or **Elevation**. With **Elevation**, an **Elevation Level** slider from 0 to 24 sets the shadow depth.
- **Nav Style**: **Outlined** or **Elevation** for the navigation.

### Border Radius

Pick a **Unit** (px, rem, em or %), then set the rounding for **Cards**, **Buttons**, **Chips** and **Images**. In px the sliders go up to 32, in % up to 50, and in rem or em up to 3.

### Favicon

Enter the full URL of the icon shown in the browser tab. It must start with `https://`.

## Advanced: site settings

Below the theme editor are two more sections. Saving them also needs **Manage Org Details**.

**Site Settings** (click **Save Settings**):

- Access: **Public — anyone can browse**, or **Internal — login required**.
- **Require org membership to access**: with **Internal**, only your org's members get in. Others see a message with a link back to SC Market. It has no effect in **Public** mode.
- **Homepage path**: the page visitors land on, such as `/market`. It must start with `/`. Leave it blank for your org's page, or the **Assigned to Me** page in **Internal** mode.

**Sidebar Tabs** (click **Save Sidebar**):

- The eye icons hide or show **Player Market**, **Services**, **Contracts**, **Recruiting** and **Organizations**.
- **Custom Tabs** add your own links: choose an icon, enter a **Label** and a **Path or URL**, and click **Add**. Links to other sites must start with `https://` and open in a new tab.

> [!NOTE]
> Right now only the mobile bottom bar applies these sidebar settings: hidden tabs disappear from it. The desktop sidebar doesn't show the changes or your custom tabs yet.

[White-label storefronts for orgs](/guides/orgs/white-label "cta")
