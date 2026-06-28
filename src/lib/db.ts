import Dexie, { type Table } from "dexie";

export type WaterStatus = "oui" | "non";
export type Pressure = "fort" | "faible" | "nul" | "inconnu";
export type Physical = "intact" | "casse" | "entretien" | "couvert";

export interface Hydrant {
  id?: number;
  code: string; // short reference code
  lat: number;
  lng: number;
  district: string;
  hasWater: WaterStatus;
  pressure: Pressure;
  physical: Physical;
  photo?: string; // base64 data URL
  notes?: string;
  inspector: string;
  createdAt: number;
  updatedAt: number;
}

export interface Inspector {
  id?: number;
  name: string;
  matricule?: string;
  createdAt: number;
}

class HydraDB extends Dexie {
  hydrants!: Table<Hydrant, number>;
  inspectors!: Table<Inspector, number>;

  constructor() {
    super("hydra_nouaceur");
    this.version(1).stores({
      hydrants: "++id, district, hasWater, physical, createdAt, inspector",
      inspectors: "++id, name",
    });
  }
}

export const db = new HydraDB();

export function statusClass(h: Hydrant): "ok" | "warn" | "bad" {
  if (h.hasWater === "non" || h.physical === "casse") return "bad";
  if (h.physical === "entretien" || h.physical === "couvert" || h.pressure === "faible") return "warn";
  return "ok";
}

export function statusLabel(h: Hydrant): string {
  const s = statusClass(h);
  if (s === "ok") return "Opérationnel";
  if (s === "warn") return "À surveiller";
  return "Hors service";
}
