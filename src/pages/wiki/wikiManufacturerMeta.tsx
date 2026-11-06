import {
  RocketLaunchRounded,
  DirectionsCarRounded,
  SecurityRounded,
  BuildRounded,
  MemoryRounded,
  ShoppingBagRounded,
} from "@mui/icons-material"
import {
  blue,
  blueGrey,
  cyan,
  green,
  indigo,
  orange,
  purple,
  red,
  teal,
} from "@mui/material/colors"

// Accent color + known specialty metadata per manufacturer code
export const MFR_META: Record<
  string,
  { color: string; specialties: string[]; tagline?: string }
> = {
  "Roberts Space Industries": {
    color: cyan[600],
    specialties: ["Ships", "Armor", "Weapons"],
    tagline: "From the Earth to the Stars",
  },
  RSI: {
    color: cyan[600],
    specialties: ["Ships", "Armor", "Weapons"],
    tagline: "From the Earth to the Stars",
  },
  "Aegis Dynamics": {
    color: blue[700],
    specialties: ["Ships", "Weapons", "Armor"],
    tagline: "Prepared for the Worst",
  },
  Aegis: {
    color: blue[700],
    specialties: ["Ships", "Weapons", "Armor"],
    tagline: "Prepared for the Worst",
  },
  "Drake Interplanetary": {
    color: red[600],
    specialties: ["Ships", "Weapons"],
    tagline: "What You Do Is Your Business",
  },
  Drake: {
    color: red[600],
    specialties: ["Ships", "Weapons"],
    tagline: "What You Do Is Your Business",
  },
  "Anvil Aerospace": {
    color: orange[600],
    specialties: ["Ships", "Weapons", "Armor"],
    tagline: "Built to Last",
  },
  Anvil: {
    color: orange[600],
    specialties: ["Ships", "Weapons", "Armor"],
    tagline: "Built to Last",
  },
  "Origin Jumpworks": {
    color: purple[700],
    specialties: ["Ships", "Consumer"],
    tagline: "Luxury Redefined",
  },
  Origin: {
    color: purple[700],
    specialties: ["Ships", "Consumer"],
    tagline: "Luxury Redefined",
  },
  MISC: {
    color: green[700],
    specialties: ["Ships", "Components"],
    tagline: "Today, Tomorrow, Together",
  },
  "Greycat Industrial": {
    color: blueGrey[600],
    specialties: ["Vehicles", "Tools", "Equipment"],
    tagline: "Industrial Grade. Always.",
  },
  Greycat: {
    color: blueGrey[600],
    specialties: ["Vehicles", "Tools", "Equipment"],
    tagline: "Industrial Grade. Always.",
  },
  "Tumbril Land Systems": {
    color: red[800],
    specialties: ["Vehicles", "Weapons"],
    tagline: "Ground Dominance",
  },
  Tumbril: {
    color: red[800],
    specialties: ["Vehicles", "Weapons"],
    tagline: "Ground Dominance",
  },
  "Klaus & Werner": {
    color: indigo[400],
    specialties: ["Ship Weapons", "Turrets", "Components"],
    tagline: "Precision in Every Shot",
  },
  "Behring Applied Technology": {
    color: blueGrey[700],
    specialties: ["Weapons", "Components"],
    tagline: "Reliability When It Matters",
  },
  Behring: {
    color: blueGrey[700],
    specialties: ["Weapons", "Components"],
    tagline: "Reliability When It Matters",
  },
  "Gallenson Tactical Systems": {
    color: blueGrey[800],
    specialties: ["Weapons", "Armor"],
    tagline: "No Compromises",
  },
  Gallenson: { color: blueGrey[800], specialties: ["Weapons", "Armor"] },
  "Amon & Reese": {
    color: teal[300],
    specialties: ["Ship Weapons", "Components"],
  },
  "Aopoa (Xi'an)": {
    color: purple[700],
    specialties: ["Ships", "Hoverbikes"],
    tagline: "Xi'an Craftsmanship",
  },
  Aopoa: {
    color: purple[700],
    specialties: ["Ships", "Hoverbikes"],
    tagline: "Xi'an Craftsmanship",
  },
  "Crusader Industries": {
    color: blue[800],
    specialties: ["Ships", "Components"],
    tagline: "Your Home in the Stars",
  },
  Crusader: {
    color: blue[800],
    specialties: ["Ships", "Components"],
    tagline: "Your Home in the Stars",
  },
}

export function getMfrMeta(name: string) {
  return MFR_META[name] ?? { color: blueGrey[600], specialties: [] }
}

/** Specialty chip labels -> gameTaxonomyUi.manufacturerSpecialties keys */
export const SPECIALTY_KEYS: Record<string, string> = {
  Ships: "ships",
  Armor: "armor",
  Weapons: "weapons",
  Consumer: "consumer",
  Components: "components",
  Vehicles: "vehicles",
  Tools: "tools",
  Equipment: "equipment",
  "Ship Weapons": "shipWeapons",
  Turrets: "turrets",
  Hoverbikes: "hoverbikes",
}

export function getSpecialtyIcon(specialty: string) {
  if (specialty === "Ships")
    return <RocketLaunchRounded sx={{ fontSize: 11 }} />
  if (specialty === "Vehicles" || specialty === "Hoverbikes")
    return <DirectionsCarRounded sx={{ fontSize: 11 }} />
  if (specialty === "Armor") return <SecurityRounded sx={{ fontSize: 11 }} />
  if (specialty === "Weapons" || specialty.includes("Weapons"))
    return <BuildRounded sx={{ fontSize: 11 }} />
  if (specialty === "Components") return <MemoryRounded sx={{ fontSize: 11 }} />
  if (
    specialty === "Consumer" ||
    specialty === "Tools" ||
    specialty === "Equipment"
  )
    return <ShoppingBagRounded sx={{ fontSize: 11 }} />
  return null
}
