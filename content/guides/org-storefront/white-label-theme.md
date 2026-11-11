---
title: Customize your white-label theme
description: On the Theme & White Label tab, load a preset or set each color, style and corner radius for dark and light mode, then click Save Theme.
order: 40
updated: 2026-11-10
keywords: [white label, theme, theme editor, colors, palette, preset, favicon, border radius, branding, homepage, contrast, accessibility, WCAG]
related: [org-storefront/white-label, orgs/manage-your-org]
howto: true
---

Your org's theme sets the colors and style of your white-label site. Start from a preset, adjust what you like, and save. The theme only shows on your white-label address, not on sc-market.space.

## Before you start

- Branding unlocked for your org. The **Storefront** tab shows whether it is, and what's missing if not (see [what branding unlocks](/guides/org-storefront/white-label#what-branding-unlocks)).
- The org's **Manage Theme** permission.

## Steps

1. Open [My Organizations](/my-orgs), click **Manage** on your org and select **Theme & White Label**.
2. Pick **Dark Mode** or **Light Mode** at the top. You set each mode separately.
3. Under **Load Preset**, click a color swatch. Hover a swatch to see its name. A preset replaces everything you set for that mode, so load it before you fine-tune.
4. Check the **Preview** next to the editor, then switch to the other mode and pick a preset for it too.
5. Check the **Contrast (WCAG 2.2 AA)** panel under the colors for both modes, and click **Auto-fix** on any pair that fails.
6. Click **Save Theme**. Both modes are saved together.

If a color pair still fails in either mode, **Save Theme** first shows **Some colours fail WCAG AA** with the failing pairs. Click **Keep editing** to fix them, or **Save anyway** to save as it is.

Visitors see dark or light mode depending on their own theme setting. Changes show on their next page load.

> [!TIP]
> To start over, click **Reset to Default** and confirm. This deletes your saved theme for both modes and can't be undone.

## Advanced: the full theme editor

Every setting applies to the mode you're editing.

### Colors

Each color has a picker and a text field for a hex value. Some fields can be left empty: SC Market then picks a color from your others that's easy to read, and the note under the field says how.

- **Primary**: your brand color, on filled buttons.
- **Button Text**: text on filled **Primary** buttons. Empty: white or dark, whichever reads better.
- **Accent text & links**: links and accent icons on the page. Empty: **Primary**, lightened or darkened just enough to read on your backgrounds.
- **Selected background**: behind selected rows, menu items, toggles and table rows. Empty: a light tint of **Accent text & links**.
- **Selected text & indicator**: the label and the edge bar or underline of a selected row, active tab or toggled chip. Empty: **Accent text & links**, adjusted to read on **Selected background** and to stand out from **Menu & list hover**, so a selected row never looks like a hovered one.
- **Disabled text**: labels and icons of controls that are switched off. Empty: **Body text**, faded but still legible.
- **Focus ring**: the outline around the control a keyboard user is on. Empty: **Primary**, adjusted to stand out.
- **Primary hover (filled buttons)**: filled primary buttons on hover.
- **Secondary**: the buy side and premium: buy order prices, top bids, the bid side of the price chart, and premium and supporter badges.
- **Background**, **Paper**, **Sidebar** and **Navbar**: the page, card and panel surfaces. In dark mode, listing thumbnails fade toward the **Sidebar** color.
- **Body text**: descriptions, captions and supporting copy.
- **Headings & emphasis text**: headings, names, prices, stats and most labels.
- **Border Color**: card edges and dividers.
- **Control borders**: text fields and outlined buttons and chips. Empty: **Border Color**, adjusted to stand out.
- **Menu & list hover**: hovered sidebar rows, menus and lists, and loading placeholders.

Status colors, such as the green and red for success and errors, and the tag colors aren't in the editor, so they keep their meaning on every theme. Tags are only lightened or darkened to stay readable on your backgrounds.

### Contrast

The **Contrast (WCAG 2.2 AA)** panel checks the mode you're editing, as visitors will see it, including the colors you left empty:

- Text needs 4.5:1 against what it sits on: **Headings & emphasis text**, **Body text** and **Accent text & links** on the page and **Paper**, **Button Text** on **Primary**, **Secondary**, sidebar and menu text on **Menu & list hover**, and **Selected text & indicator** on **Selected background**.
- The **Focus ring**, **Control borders** and the selected indicator against **Menu & list hover** need 3:1.
- **Disabled text** needs 3:1 to stay legible, though AA doesn't require it.

Each pair shows its ratio and **Passes AA** or **Fails AA** (**Legible** or **Too faint** for disabled text), and **Auto** when the color is one you left empty. **Auto-fix** on a failing pair sets the nearest color that passes.

### Style

- **Paper Style** and **Card Style**: **Outlined** or **Elevation**. With **Elevation**, an **Elevation Level** slider from 0 to 24 sets the shadow depth.
- **Nav Style**: **Outlined** or **Elevation** for the navigation.

### Border Radius

Pick a **Unit** (px, rem, em or %), then set the rounding for **Cards**, **Buttons**, **Chips** and **Images**. In px the sliders go up to 32, in % up to 50, and in rem or em up to 3.

### Favicon

Enter the full URL of the icon shown in the browser tab. It must start with `https://`.

## Advanced: site settings

Below the theme editor are two more sections, for members with **Manage Org Details**. A member with only **Manage Theme** sees just the theme editor, and one with only **Manage Org Details** just these sections.

**Site Settings** (click **Save Settings**):

- Access: **Public (anyone can browse)**, or **Internal (login required)**.
- **Require org membership to access**: shows once you pick **Internal**. Only your org's members get in; others see a message with a link back to SC Market.
- **Homepage path**: the page visitors land on, such as `/market`. It must start with `/`. Leave it blank for your org's page, or the **Assigned to Me** page in **Internal** mode.

**Sidebar Tabs** (click **Save Sidebar**):

- The eye icons turn **Player Market**, **Services**, **Contracts**, **Recruiting** and **Organizations** on or off. **Player Market**, **Services** and **Contracts** are on until you turn them off. **Recruiting** and **Organizations** show every org's recruiting posts and SC Market's whole org directory, so they're off until you turn them on.
- A tab you turn off disappears from the sidebar, the mobile bottom bar and the Ctrl+K search, and visitors who open one of its pages on your subdomain go to the same page on sc-market.space. Your org's own listings and pages and checkout always stay on your subdomain.
- **Custom Tabs** add your own links: choose an icon, enter a **Label** and a **Path or URL**, and click **Add**. A page of the site starts with `/`; a link to another site must start with `https://` (not `http://`) and opens in a new tab.

Both the sidebar and the mobile bottom bar follow these settings. Custom tabs show in the sidebar under your org's name.

[White-label storefronts for orgs](/guides/org-storefront/white-label "cta")
