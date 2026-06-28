import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/AppShell";
import { db, statusClass, statusLabel } from "@/lib/db";
import { DISTRICTS } from "@/lib/districts";
import { Search, MapPin, Droplet } from "lucide-react";

export const Route = createFileRoute("/liste")({
  head: () => ({
    meta: [
      { title: "Liste des bornes — HydraNouaceur" },
      { name: "description", content: "Liste filtrable de toutes les bornes d'incendie inspectées." },
    ],
  }),
  component: ListPage,
});

function ListPage() {
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("all");
  const hydrants = useLiveQuery(() => db.hydrants.orderBy("updatedAt").reverse().toArray(), []);

  const filtered = useMemo(() => {
    if (!hydrants) return [];
    return hydrants.filter((h) => {
      if (district !== "all" && h.district !== district) return false;
      if (q && !`${h.code} ${h.notes ?? ""} ${h.district}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [hydrants, district, q]);

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card px-4 pb-3 pt-4">
          <h1 className="mb-3 font-display text-xl font-bold text-secondary">Bornes recensées</h1>
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher par code, quartier…"
              className="w-full rounded-lg border border-input bg-muted py-2.5 pl-9 pr-3 text-sm focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
          >
            <option value="all">Toutes les communes ({hydrants?.length ?? 0})</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Droplet className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">Aucune borne enregistrée.</p>
              <Link to="/ajouter" className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Ajouter la première
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((h) => {
                const cls = statusClass(h);
                const tone = cls === "ok" ? "bg-success" : cls === "warn" ? "bg-warning" : "bg-destructive";
                return (
                  <li key={h.id}>
                    <Link
                      to="/borne/$id"
                      params={{ id: String(h.id) }}
                      className="flex items-stretch gap-3 rounded-xl border border-border bg-card p-3 transition-colors active:bg-accent"
                    >
                      <span className={`w-1.5 rounded-full ${tone}`} />
                      {h.photo ? (
                        <img src={h.photo} alt="" className="h-16 w-16 flex-none rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 flex-none items-center justify-center rounded-lg bg-muted">
                          <Droplet className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-semibold text-foreground">{h.code}</span>
                          <span className={`flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ${tone}`}>
                            {statusLabel(h)}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{h.district}</span>
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          {new Date(h.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                          {" · "}{h.inspector}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
