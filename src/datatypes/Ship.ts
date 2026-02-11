import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
export interface Ship {
  image: string
  name: ShipName
  size: "ground" | "snub" | "small" | "medium" | "large" | "capital"
  kind:
    | "combat"
    | "freight"
    | "refuel"
    | "repair"
    | "mining"
    | "transport"
    | "exploration"
  manufacturer: string
  condition: "flight-ready" | "in-repair" | "awaiting-repair" | "in-concept"
  // active: boolean
  ship_id: number
}

export type ShipName =
  | "Avenger Stalker"
  | "Avenger Titan"
  | "Avenger Titan Renegade"
  | "Avenger Warlock"
  | "Eclipse"
  | "Gladius"
  | "Gladius Valiant"
  | "Hammerhead"
  | "Hammerhead Best In Show Edition"
  | "Idris-M"
  | "Idris-P"
  | "Javelin"
  | "Nautilus"
  | "Nautilus Solstice Edition"
  | "Reclaimer"
  | "Reclaimer Best In Show Edition"
  | "Redeemer"
  | "Retaliator Base"
  | "Retaliator Bomber"
  | "Sabre"
  | "Sabre Comet"
  | "Sabre Raven"
  | "Vanguard Harbinger"
  | "Vanguard Hoplite"
  | "Vanguard Sentinel"
  | "Vanguard Warden"
  | "Vulcan"
  | "Arrow"
  | "Ballista"
  | "Ballista Dunestalker"
  | "Ballista Snowblind"
  | "C8 Pisces"
  | "Carrack"
  | "Crucible"
  | "F7C Hornet"
  | "F7C Hornet Wildfire"
  | "F7C-M Super Hornet"
  | "F7C-M Super Hornet Heartseeker"
  | "F7C-R Hornet Tracker"
  | "F7C-S Hornet Ghost"
  | "Gladiator"
  | "Hawk"
  | "Hurricane"
  | "Terrapin"
  | "Valkyrie"
  | "Valkyrie Liberator Edition"
  | "Khartu-al"
  | "Nox"
  | "Nox Kue"
  | "San tok.Yāi"
  | "Mole"
  | "Mole Carbon Edition"
  | "Mole Talus Edition"
  | "MPUV-1C"
  | "MPUV-1P"
  | "SRV"
  | "Defender"
  | "Merchantman"
  | "Mustang Alpha"
  | "Mustang Alpha Vindicator"
  | "Mustang Beta"
  | "Mustang Delta"
  | "Mustang Gamma"
  | "Mustang Omega"
  | "Nomad"
  | "Pioneer"
  | "A2 Hercules"
  | "Ares Inferno"
  | "Ares Ion"
  | "C2 Hercules"
  | "Genesis Starliner"
  | "M2 Hercules"
  | "Mercury Star Runner"
  | "Buccaneer"
  | "Caterpillar"
  | "Caterpillar Best In Show Edition"
  | "Caterpillar Pirate Edition"
  | "Corsair"
  | "Cutlass Black"
  | "Cutlass Black Best In Show Edition"
  | "Cutlass Blue"
  | "Cutlass Red"
  | "Dragonfly Black"
  | "Herald"
  | "Kraken"
  | "Kraken Privateer"
  | "Vulture"
  | "Blade"
  | "Glaive"
  | "Prowler"
  | "Talon"
  | "Talon Shrike"
  | "Railen"
  | "PTV"
  | "ROC"
  | "P-52 Merlin"
  | "P-72 Archimedes"
  | "P-72 Archimedes Emerald"
  | "Enveador"
  | "Freelancer"
  | "Freelancer DUR"
  | "Freelancer MAX"
  | "Freelancer MIS"
  | "Hull A"
  | "Hull B"
  | "Hull C"
  | "Hull D"
  | "Hull E"
  | "Prospector"
  | "Razor"
  | "Razor EX"
  | "Razor LX"
  | "Reliant Kore"
  | "Reliant Mako"
  | "Reliant Sen"
  | "Reliant Tana"
  | "Starfarer"
  | "Starfarer Gemini"
  | "100i"
  | "125a"
  | "135c"
  | "300i"
  | "315p"
  | "325a"
  | "350r"
  | "600i Explorer"
  | "600i Touring"
  | "85X"
  | "890 Jump"
  | "G12"
  | "G12-A"
  | "G12-R"
  | "M50"
  | "X1 Base"
  | "X1 Force"
  | "X1 Velocity"
  | "Apollo Medivac"
  | "Apollo Triage"
  | "Aurora CL"
  | "Aurora ES"
  | "Aurora LN"
  | "Aurora LX"
  | "Aurora MR"
  | "Constellation Andromeda"
  | "Constellation Aquila"
  | "Constellation Phoenix"
  | "Constellation Phoenix Emerald"
  | "Constellation Taurus"
  | "Mantis"
  | "Orion"
  | "Perseus"
  | "Polaris"
  | "Ursa Rover"
  | "Cyclone"
  | "Cyclone AA"
  | "Cyclone RC"
  | "Cyclone RN"
  | "Cyclone TR"
  | "Nova"
  | "Ranger CV"
  | "Ranger RC"
  | "Ranger TR"
  | "RAFT"
  | "Cutlass Steel"
  | "Quadette"
  | "Endeavor"

export const shipList: ShipName[] = [
  "Avenger Stalker",
  "Avenger Titan",
  "Avenger Titan Renegade",
  "Avenger Warlock",
  "Eclipse",
  "Gladius",
  "Gladius Valiant",
  "Hammerhead",
  "Hammerhead Best In Show Edition",
  "Idris-M",
  "Idris-P",
  "Javelin",
  "Nautilus",
  "Nautilus Solstice Edition",
  "Reclaimer",
  "Reclaimer Best In Show Edition",
  "Redeemer",
  "Retaliator Base",
  "Retaliator Bomber",
  "Sabre",
  "Sabre Comet",
  "Sabre Raven",
  "Vanguard Harbinger",
  "Vanguard Hoplite",
  "Vanguard Sentinel",
  "Vanguard Warden",
  "Vulcan",
  "Arrow",
  "Ballista",
  "Ballista Dunestalker",
  "Ballista Snowblind",
  "C8 Pisces",
  "Carrack",
  "Crucible",
  "F7C Hornet",
  "F7C Hornet Wildfire",
  "F7C-M Super Hornet",
  "F7C-M Super Hornet Heartseeker",
  "F7C-R Hornet Tracker",
  "F7C-S Hornet Ghost",
  "Gladiator",
  "Hawk",
  "Hurricane",
  "Terrapin",
  "Valkyrie",
  "Valkyrie Liberator Edition",
  "Khartu-al",
  "Nox",
  "Nox Kue",
  "San tok.Yāi",
  "Mole",
  "Mole Carbon Edition",
  "Mole Talus Edition",
  "MPUV-1C",
  "MPUV-1P",
  "SRV",
  "Defender",
  "Merchantman",
  "Mustang Alpha",
  "Mustang Alpha Vindicator",
  "Mustang Beta",
  "Mustang Delta",
  "Mustang Gamma",
  "Mustang Omega",
  "Nomad",
  "Pioneer",
  "A2 Hercules",
  "Ares Inferno",
  "Ares Ion",
  "C2 Hercules",
  "Genesis Starliner",
  "M2 Hercules",
  "Mercury Star Runner",
  "Buccaneer",
  "Caterpillar",
  "Caterpillar Best In Show Edition",
  "Caterpillar Pirate Edition",
  "Corsair",
  "Cutlass Black",
  "Cutlass Black Best In Show Edition",
  "Cutlass Blue",
  "Cutlass Red",
  "Dragonfly Black",
  "Herald",
  "Kraken",
  "Kraken Privateer",
  "Vulture",
  "Blade",
  "Glaive",
  "Prowler",
  "Talon",
  "Talon Shrike",
  "Railen",
  "PTV",
  "ROC",
  "P-52 Merlin",
  "P-72 Archimedes",
  "P-72 Archimedes Emerald",
  "Enveador",
  "Freelancer",
  "Freelancer DUR",
  "Freelancer MAX",
  "Freelancer MIS",
  "Hull A",
  "Hull B",
  "Hull C",
  "Hull D",
  "Hull E",
  "Prospector",
  "Razor",
  "Razor EX",
  "Razor LX",
  "Reliant Kore",
  "Reliant Mako",
  "Reliant Sen",
  "Reliant Tana",
  "Starfarer",
  "Starfarer Gemini",
  "100i",
  "125a",
  "135c",
  "300i",
  "315p",
  "325a",
  "350r",
  "600i Explorer",
  "600i Touring",
  "85X",
  "890 Jump",
  "G12",
  "G12-A",
  "G12-R",
  "M50",
  "X1 Base",
  "X1 Force",
  "X1 Velocity",
  "Apollo Medivac",
  "Apollo Triage",
  "Aurora CL",
  "Aurora ES",
  "Aurora LN",
  "Aurora LX",
  "Aurora MR",
  "Constellation Andromeda",
  "Constellation Aquila",
  "Constellation Phoenix",
  "Constellation Phoenix Emerald",
  "Constellation Taurus",
  "Mantis",
  "Orion",
  "Perseus",
  "Polaris",
  "Ursa Rover",
  "Cyclone",
  "Cyclone AA",
  "Cyclone RC",
  "Cyclone RN",
  "Cyclone TR",
  "Nova",
  "Ranger CV",
  "Ranger RC",
  "Ranger TR",
  "RAFT",
  "Cutlass Steel",
  "Quadette",
  "Endeavor",
]
