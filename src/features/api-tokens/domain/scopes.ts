/**
 * Scope categories and their available scopes
 */
export const SCOPE_CATEGORIES = {
  profile: {
    label: "Profile",
    scopes: [
      { value: "profile:read", label: "Read Profile" },
      { value: "profile:write", label: "Write Profile" },
    ],
  },
  market: {
    label: "Market",
    scopes: [
      { value: "market:read", label: "Read Market" },
      { value: "market:write", label: "Write Market" },
      { value: "market:purchase", label: "Purchase Items" },
      { value: "market:photos", label: "Manage Photos" },
    ],
  },
  orders: {
    label: "Orders",
    scopes: [
      { value: "orders:read", label: "Read Orders" },
      { value: "orders:write", label: "Write Orders" },
      { value: "orders:reviews", label: "Write Reviews" },
    ],
  },
  contractors: {
    label: "Organizations",
    scopes: [
      { value: "contractors:read", label: "Read Organizations" },
      { value: "contractors:write", label: "Write Organizations" },
      { value: "contractors:members", label: "Manage Members" },
      { value: "contractors:webhooks", label: "Manage Webhooks" },
      { value: "contractors:blocklist", label: "Manage Blocklist" },
      { value: "orgs:read", label: "Read Org Settings" },
      { value: "orgs:write", label: "Write Org Settings" },
      { value: "orgs:manage", label: "Manage Org" },
    ],
  },
  services: {
    label: "Services",
    scopes: [
      { value: "services:read", label: "Read Services" },
      { value: "services:write", label: "Write Services" },
      { value: "services:photos", label: "Manage Photos" },
    ],
  },
  offers: {
    label: "Offers",
    scopes: [
      { value: "offers:read", label: "Read Offers" },
      { value: "offers:write", label: "Write Offers" },
    ],
  },
  chats: {
    label: "Chats",
    scopes: [
      { value: "chats:read", label: "Read Chats" },
      { value: "chats:write", label: "Write Chats" },
    ],
  },
  notifications: {
    label: "Notifications",
    scopes: [
      { value: "notifications:read", label: "Read Notifications" },
      { value: "notifications:write", label: "Write Notifications" },
    ],
  },
  recruiting: {
    label: "Recruiting",
    scopes: [
      { value: "recruiting:read", label: "Read Recruiting Posts" },
      { value: "recruiting:write", label: "Write Recruiting Posts" },
    ],
  },
  comments: {
    label: "Comments",
    scopes: [
      { value: "comments:read", label: "Read Comments" },
      { value: "comments:write", label: "Write Comments" },
    ],
  },
  moderation: {
    label: "Moderation",
    scopes: [
      { value: "moderation:read", label: "Read Reports" },
      { value: "moderation:write", label: "Submit Reports" },
    ],
  },
  admin: {
    label: "Admin",
    scopes: [
      { value: "admin:read", label: "Read Admin Data" },
      { value: "admin:write", label: "Write Admin Data" },
      { value: "admin:spectrum", label: "Spectrum Migration" },
      { value: "admin:stats", label: "View Statistics" },
      { value: "admin", label: "Full Admin Access" },
    ],
  },
  special: {
    label: "Special",
    scopes: [
      { value: "readonly", label: "Read Only (All Read Scopes)" },
      { value: "full", label: "Full Access (All Scopes)" },
    ],
  },
} as const
