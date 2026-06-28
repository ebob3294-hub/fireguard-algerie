import { createFileRoute, useNavigate, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/AppShell";
import { HydrantForm, type HydrantFormValue } from "@/components/HydrantForm";
import { db, statusClass, statusLabel } from "@/lib/db";
import { ChevronLeft, Trash2, Pencil, MapPin, User, Calendar } from "lucide-react";

export const Route = createFileRoute("/borne/$id")({
  head: () => ({
    meta: [
      { title: "Détail borne — HydraNouaceur" },
      { name: "description", content: "Détails et modification d'une borne d'incendie." },
    ],
  }),
  component: DetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-dvh items-center justify-center p-6 text-center">
      <div>
        <p className="text-muted-foreground">Borne introuvable.</p>
        <Link to="/liste" className="mt-3 inline-block text-sm text-primary underline">Retour à la liste</Link>
      </div>
    </div>
  ),
});

function DetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const numId = Number(id);
  const hydrant = useLiveQuery(() => db.hydrants.get(numId), [numId]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  if (hydrant === undefined) {
    return <AppShell><div className="p-6 text-sm text-muted-foreground">Chargement…</div></AppShell>;
  }
  if (hydrant === null || !hydrant) {
    throw notFound();
  }

  async function handleSave(v: HydrantFormValue) {
    if (v.lat == null || v.lng == null) return;
    setSaving(true);
    await db.hydrants.update(numId, {
      code: v.code,
      lat: v.lat,
      lng: v.lng,
      district: v.district,
      hasWater: v.hasWater,
      pressure: v.pressure,
      physical: v.physical,
      photo: v.photo,
      notes: v.notes,
      updatedAt: Date.now(),
    });
    setSaving(false);
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm("Supprimer définitivement cette borne ?")) return;
    await db.hydrants.delete(numId);
    navigate({ to: "/liste" });
  }

  const cls = statusClass(hydrant);
  const tone = cls === "ok" ? "bg-success" : cls === "warn" ? "bg-warning" : "bg-destructive";

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-border bg-card px-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link to="/liste" className="-ml-1 rounded-lg p-1.5 active:bg-accent">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="truncate font-display text-lg font-bold text-secondary">{hydrant.code}</h1>
          </div>
          {!editing && (
            <div className="flex gap-1">
              <button onClick={() => setEditing(true)} className="rounded-lg p-2 text-secondary active:bg-accent">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={handleDelete} className="rounded-lg p-2 text-destructive active:bg-accent">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          {editing ? (
            <div className="p-4">
              <HydrantForm initial={hydrant} onSubmit={handleSave} submitting={saving} submitLabel="Mettre à jour" />
              <button onClick={() => setEditing(false)} className="mt-3 w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground">
                Annuler
              </button>
            </div>
          ) : (
            <div className="p-4">
              {hydrant.photo && (
                <img src={hydrant.photo} alt={hydrant.code} className="mb-4 h-56 w-full rounded-xl object-cover" />
              )}
              <div className={`mb-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white ${tone}`}>
                {statusLabel(hydrant)}
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                <Row label="Commune / Quartier" value={hydrant.district} icon={<MapPin className="h-4 w-4" />} />
                <Row label="Coordonnées" value={`${hydrant.lat.toFixed(6)}, ${hydrant.lng.toFixed(6)}`} mono />
                <Row label="Présence d'eau" value={hydrant.hasWater === "oui" ? "Oui" : "Non"} />
                <Row label="Pression" value={
                  ({ fort: "Forte", faible: "Faible", nul: "Nulle", inconnu: "Inconnue" } as const)[hydrant.pressure]
                } />
                <Row label="État physique" value={
                  ({ intact: "Intact", casse: "Cassé", entretien: "À entretenir", couvert: "Couvert" } as const)[hydrant.physical]
                } />
                {hydrant.notes && <Row label="Notes" value={hydrant.notes} />}
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{hydrant.inspector}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />
                  {new Date(hydrant.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>

              <a
                href={`https://www.openstreetmap.org/?mlat=${hydrant.lat}&mlon=${hydrant.lng}#map=19/${hydrant.lat}/${hydrant.lng}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block w-full rounded-xl border border-secondary py-3 text-center text-sm font-semibold text-secondary active:bg-accent"
              >
                Ouvrir dans une carte externe
              </a>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value, icon, mono }: { label: string; value: string; icon?: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}{label}
      </div>
      <div className={`mt-0.5 text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
