import { useState, type ChangeEvent } from "react";
import { DISTRICTS } from "@/lib/districts";
import type { Hydrant, Physical, Pressure, WaterStatus } from "@/lib/db";
import { Camera, MapPin, Loader2 } from "lucide-react";

export interface HydrantFormValue {
  code: string;
  lat: number | null;
  lng: number | null;
  district: string;
  hasWater: WaterStatus;
  pressure: Pressure;
  physical: Physical;
  photo?: string;
  notes?: string;
}

interface Props {
  initial?: Partial<Hydrant>;
  onSubmit: (value: HydrantFormValue) => Promise<void> | void;
  submitting?: boolean;
  submitLabel?: string;
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; tone?: "ok" | "warn" | "bad" | "neutral" }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {options.map((opt) => {
        const active = value === opt.value;
        const toneActive: Record<string, string> = {
          ok: "bg-success text-success-foreground border-success",
          warn: "bg-warning text-warning-foreground border-warning",
          bad: "bg-destructive text-destructive-foreground border-destructive",
          neutral: "bg-secondary text-secondary-foreground border-secondary",
        };
        const tone = opt.tone ?? "neutral";
        return (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all active:scale-95 ${
              active ? toneActive[tone] : "border-border bg-card text-foreground hover:border-muted-foreground/30"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function HydrantForm({ initial, onSubmit, submitting, submitLabel = "Enregistrer" }: Props) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [lat, setLat] = useState<number | null>(initial?.lat ?? null);
  const [lng, setLng] = useState<number | null>(initial?.lng ?? null);
  const [district, setDistrict] = useState(initial?.district ?? DISTRICTS[0]);
  const [hasWater, setHasWater] = useState<WaterStatus>(initial?.hasWater ?? "oui");
  const [pressure, setPressure] = useState<Pressure>(initial?.pressure ?? "inconnu");
  const [physical, setPhysical] = useState<Physical>(initial?.physical ?? "intact");
  const [photo, setPhoto] = useState<string | undefined>(initial?.photo);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  function capturePosition() {
    if (!navigator.geolocation) {
      setLocError("Géolocalisation non disponible");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setLocating(false);
      },
      (err) => {
        setLocError(err.message || "Impossible d'obtenir la position");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || lat == null || lng == null) return;
    onSubmit({
      code: code.trim(),
      lat,
      lng,
      district,
      hasWater,
      pressure,
      physical,
      photo,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Position */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-secondary">Position GPS</h3>
          <button
            type="button"
            onClick={capturePosition}
            disabled={locating}
            className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground active:scale-95 disabled:opacity-60"
          >
            {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
            {locating ? "Localisation…" : "Capturer ma position"}
          </button>
        </div>
        {lat != null && lng != null ? (
          <p className="font-mono text-sm text-foreground">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune position. Appuyez sur "Capturer".</p>
        )}
        {locError && <p className="mt-2 text-xs text-destructive">{locError}</p>}
      </section>

      {/* Identifiant */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Code / Référence *</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: BI-NOU-001"
          className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          required
        />
      </div>

      {/* District */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Commune / Quartier</label>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        >
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Eau */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Présence d'eau</label>
        <Segmented
          value={hasWater}
          onChange={setHasWater}
          options={[
            { value: "oui", label: "Oui", tone: "ok" },
            { value: "non", label: "Non", tone: "bad" },
          ]}
        />
      </div>

      {/* Pression */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Pression d'eau</label>
        <Segmented
          value={pressure}
          onChange={setPressure}
          options={[
            { value: "fort", label: "Forte", tone: "ok" },
            { value: "faible", label: "Faible", tone: "warn" },
            { value: "nul", label: "Nulle", tone: "bad" },
            { value: "inconnu", label: "Inconnue", tone: "neutral" },
          ]}
        />
      </div>

      {/* État physique */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">État physique</label>
        <Segmented
          value={physical}
          onChange={setPhysical}
          options={[
            { value: "intact", label: "Intact", tone: "ok" },
            { value: "entretien", label: "À entretenir", tone: "warn" },
            { value: "couvert", label: "Couvert", tone: "warn" },
            { value: "casse", label: "Cassé", tone: "bad" },
          ]}
        />
      </div>

      {/* Photo */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Photo</label>
        {photo ? (
          <div className="relative">
            <img src={photo} alt="Borne" className="h-48 w-full rounded-lg object-cover" />
            <button
              type="button"
              onClick={() => setPhoto(undefined)}
              className="absolute right-2 top-2 rounded-md bg-destructive/90 px-2 py-1 text-xs font-medium text-destructive-foreground"
            >
              Retirer
            </button>
          </div>
        ) : (
          <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted text-muted-foreground active:bg-accent">
            <Camera className="h-6 w-6" />
            <span className="text-sm font-medium">Prendre une photo</span>
            <input type="file" accept="image/*" capture="environment" onChange={onPhoto} className="hidden" />
          </label>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Observations, repères, accès…"
          className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !code.trim() || lat == null || lng == null}
        className="sticky bottom-2 w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {submitting ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
