export type PenangArea =
  | "Georgetown"
  | "Gurney Drive"
  | "Bayan Lepas"
  | "Bayan Baru"
  | "Gelugor"
  | "Air Itam"
  | "Paya Terubong"
  | "Tanjung Bungah"
  | "Tanjung Tokong"
  | "Batu Ferringhi"
  | "Balik Pulau"
  | "Butterworth"
  | "Bukit Mertajam"
  | "Perai"
  | "Seberang Jaya"
  | "Simpang Ampat"
  | "Nibong Tebal"
  | "Kepala Batas";

export type ServiceType =
  | "normal_cleaning"
  | "chemical_cleaning"
  | "chemical_overhaul"
  | "gas_topup"
  | "water_leakage_repair"
  | "troubleshooting_repair"
  | "installation_relocation";

export type AcType = "wall_mounted" | "cassette" | "ceiling_exposed" | "ducted";

export type AcHorsepower = "1.0 HP" | "1.5 HP" | "2.0 HP" | "2.5 HP or above";

export interface Appointment {
  id: string;
  userId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  clientArea: PenangArea;
  serviceType: ServiceType;
  unitsCount: number;
  acType: AcType;
  acBrand: string;
  acHorsepower: AcHorsepower;
  serviceDate: string;
  serviceTimeSlot: "morning" | "afternoon" | "late_afternoon";
  userNotes?: string;
  estimatePrice: number;
  status: "pending" | "confirmed" | "assigned" | "completed" | "cancelled";
  technicianName?: string;
  photoBefore?: string;
  photoAfter?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface ServicePriceDef {
  title: string;
  basePrice: number; // in RM per unit
  description: string;
}
