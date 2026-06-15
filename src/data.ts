import { PenangArea, ServiceType, ServicePriceDef } from "./types";

export const PENANG_AREAS: { value: PenangArea; label: string; zone: "Island" | "Mainland" }[] = [
  // Island
  { value: "Georgetown", label: "George Town (City Center)", zone: "Island" },
  { value: "Gurney Drive", label: "Gurney Drive / Kelawai", zone: "Island" },
  { value: "Bayan Lepas", label: "Bayan Lepas (FTZ & Airport Area)", zone: "Island" },
  { value: "Bayan Baru", label: "Bayan Baru", zone: "Island" },
  { value: "Gelugor", label: "Gelugor (USM Area)", zone: "Island" },
  { value: "Air Itam", label: "Air Itam (Penang Hill/Kek Lok Si)", zone: "Island" },
  { value: "Paya Terubong", label: "Paya Terubong", zone: "Island" },
  { value: "Tanjung Tokong", label: "Tanjung Tokong (Straits Quay)", zone: "Island" },
  { value: "Tanjung Bungah", label: "Tanjung Bungah", zone: "Island" },
  { value: "Batu Ferringhi", label: "Batu Ferringhi (Beach Area)", zone: "Island" },
  { value: "Balik Pulau", label: "Balik Pulau (Countryside)", zone: "Island" },
  // Mainland
  { value: "Butterworth", label: "Butterworth (Port & Raja Uda)", zone: "Mainland" },
  { value: "Bukit Mertajam", label: "Bukit Mertajam Area", zone: "Mainland" },
  { value: "Perai", label: "Perai (Industrial Zone)", zone: "Mainland" },
  { value: "Seberang Jaya", label: "Seberang Jaya", zone: "Mainland" },
  { value: "Simpang Ampat", label: "Simpang Ampat / Batu Kawan", zone: "Mainland" },
  { value: "Nibong Tebal", label: "Nibong Tebal", zone: "Mainland" },
  { value: "Kepala Batas", label: "Kepala Batas", zone: "Mainland" },
];

export const SERVICE_TYPES: Record<ServiceType, ServicePriceDef> = {
  normal_cleaning: {
    title: "Normal Servicing",
    basePrice: 80,
    description: "Standard filter vacuum, fan blower wash, drain pan flush, and 10-point check. Best for bi-annual maintenance.",
  },
  chemical_cleaning: {
    title: "Chemical Servicing",
    basePrice: 150,
    description: "Coil deep-clean with specialized chemical wash, prevents mold growth and unblocks stubborn dust buildup.",
  },
  chemical_overhaul: {
    title: "Chemical Overhaul",
    basePrice: 250,
    description: "Full dismantle of indoor unit, thorough coil chemical bath, check fan bearings, recommended for highly choked aircons.",
  },
  gas_topup: {
    title: "R32 / r410a Refrigerant Gas Top-up",
    basePrice: 90,
    description: "Pressure diagnostic check and replenishment of cooling gas (up to 30 PSI). Restores original icy breeze.",
  },
  water_leakage_repair: {
    title: "Water Leakage Clearing",
    basePrice: 100,
    description: "Unclogging of condensate drain pipe using high-pressure vacuuming and flushing. Solves annoying drips instantly.",
  },
  troubleshooting_repair: {
    title: "Diagnostic & Repair",
    basePrice: 60,
    description: "Diagnosis of general faults (no power, blinking light, noisy condenser). Checking fee is waived if repair is done.",
  },
  installation_relocation: {
    title: "Installation & Relocation",
    basePrice: 320,
    description: "Professional bracket mount, insulation, copper piping (up to 10ft), and neat casing. Starting price per unit.",
  },
};

export const POPULAR_BRANDS = [
  "Daikin",
  "Panasonic",
  "Mitsubishi Electric",
  "York",
  "Acson (Penang favorite!)",
  "Midea",
  "Sharp",
  "Samsung",
  "Hitachi",
  "Other / Not Sure",
];

export const MAINSTREAM_TECHNICIANS = [
  { name: "Anwar", rating: 4.9, completed: 342, specialties: ["Wall-mounted", "Daikin Expert", "Chemical Overhauls"] },
  { name: "Muthu", rating: 4.85, completed: 298, specialties: ["Cassette units", "Leakage Specialist", "York Expert"] },
  { name: "Mike", rating: 5.0, completed: 852, specialties: ["Troubleshooting Master", "Panasonic Inverters", "All-round Guru"] },
];

// Calculate live price based on selections
export function calculateEstimatedPrice(
  serviceType: ServiceType,
  unitsCount: number,
  horsepower: string
): number {
  const service = SERVICE_TYPES[serviceType];
  if (!service) return 0;

  let baseRate = service.basePrice;

  // Surcharge based on Horsepower since larger units require more labor/gas
  let hpMultiplier = 1.0;
  if (horsepower === "1.5 HP") {
    hpMultiplier = 1.15; // +15%
  } else if (horsepower === "2.0 HP") {
    hpMultiplier = 1.35; // +35%
  } else if (horsepower === "2.5 HP or above") {
    hpMultiplier = 1.6; // +60%
  }

  // Multiplier discount for bulk units to encourage bookings
  let discountMultiplier = 1.0;
  if (unitsCount >= 5) {
    discountMultiplier = 0.85; // 15% discount for 5+ units
  } else if (unitsCount >= 3) {
    discountMultiplier = 0.9; // 10% discount for 3-4 units
  } else if (unitsCount >= 2) {
    discountMultiplier = 0.95; // 5% discount for 2 units
  }

  return Math.round(baseRate * unitsCount * hpMultiplier * discountMultiplier);
}
