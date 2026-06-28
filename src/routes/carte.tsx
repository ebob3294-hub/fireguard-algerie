import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { HydrantMap } from "@/components/HydrantMap";
import { DISTRICTS } from "@/lib/districts";
import { Filter, Plus } from "lucide-react";

export const Route = createFileRoute("/carte")({
  head: () => ({
    meta: [
      { title: "Carte des bornes — HydraNouaceur" },
      { name: "description", content: "Visualisez toutes les bornes d'incendie répertoriées sur la carte de Nouaceur." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const [district, setDistrict] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "ok" | "warn" | "bad">("all");
  const [open, setOpen] = useState(false);

  return (
    <AppShell>
      <div className="relative h-full w-full">
        <HydrantMap filterDistrict={district === "all" ? undefined : district} filterStatus={status} />

        {/* Top bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[400] flex items-start justify-between p-3">
          <div className="pointer-events-auto rounded-xl bg-card/95 px-3 py-2 shadow-md backdrop-blur">
            <div className="font-display text-sm font-semibold text-secondary">Nouaceur</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Bornes d'incendie</div>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="pointer-events-auto flex items-center gap-1.5 rounded-xl bg-card/95 px-3 py-2.5 text-sm font-medium text-secondary shadow-md backdrop-blur active:scale-95"
          >
            <Filter className="h-4 w-4" />
            Filtres
          </button>
        </div>

        {/* Filter panel */}
        {open && (
          <div className="absolute inset-x-3 top-16 z-[400] rounded-2xl border border-border bg-card p-4 shadow-xl">
            <div className="mb-3">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Commune</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
              >
                <option value="all">Toutes les communes</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Statut</label>
              <div className="grid grid-cols-4 gap-1.5">
                {([
                  { v: "all", l: "Tous" },
                  { v: "ok", l: "OK" },
                  { v: "warn", l: "Alerte" },
                  { v: "bad", l: "HS" },
                ] as const).map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setStatus(o.v)}
                    className={`rounded-md border px-2 py-1.5 text-xs font-medium ${
                      status === o.v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex flex-col gap-1 rounded-xl bg-card/95 px-3 py-2 text-xs shadow-md backdrop-blur">
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-success" /> Opérationnel</div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-warning" /> À surveiller</div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-destructive" /> Hors service</div>
        </div>

        {/* FAB */}
        <Link
          to="/ajouter"
          className="absolute bottom-4 right-4 z-[400] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/40 active:scale-95"
          aria-label="Ajouter une borne"
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </Link>
      </div>
    </AppShell>
  );
}
