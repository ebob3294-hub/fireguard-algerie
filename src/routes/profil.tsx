import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/AppShell";
import { db } from "@/lib/db";
import { User, LogOut, Download, Database } from "lucide-react";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil inspecteur — HydraNouaceur" },
      { name: "description", content: "Gérez votre profil d'inspecteur et exportez les données." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const inspector = useLiveQuery(() => db.inspectors.toCollection().first(), []);
  const count = useLiveQuery(() => db.hydrants.count(), []);
  const [name, setName] = useState("");
  const [matricule, setMatricule] = useState("");

  useEffect(() => {
    if (inspector) {
      setName(inspector.name);
      setMatricule(inspector.matricule ?? "");
    }
  }, [inspector]);

  async function save() {
    if (!inspector?.id) return;
    await db.inspectors.update(inspector.id, { name: name.trim(), matricule: matricule.trim() || undefined });
  }

  async function logout() {
    if (!confirm("Se déconnecter ? Les bornes restent enregistrées sur cet appareil.")) return;
    await db.inspectors.clear();
    navigate({ to: "/" });
  }

  async function exportJson() {
    const data = await db.hydrants.toArray();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bornes-nouaceur-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <header className="border-b border-border bg-card px-4 py-4">
          <h1 className="font-display text-xl font-bold text-secondary">Profil</h1>
        </header>
        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <User className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-lg font-semibold">{inspector?.name ?? "Visiteur"}</div>
              {inspector?.matricule && <div className="text-xs text-muted-foreground">Matricule {inspector.matricule}</div>}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-secondary p-4 text-secondary-foreground">
            <Database className="h-6 w-6" />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide opacity-70">Bornes enregistrées</div>
              <div className="font-display text-2xl font-bold">{count ?? 0}</div>
            </div>
          </div>

          {inspector && (
            <div className="space-y-3 rounded-xl border border-border bg-card p-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Nom</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={save}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Matricule</label>
                <input
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  onBlur={save}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          <button
            onClick={exportJson}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-secondary bg-card py-3 text-sm font-semibold text-secondary active:bg-accent"
          >
            <Download className="h-4 w-4" />
            Exporter les données (JSON)
          </button>

          {inspector && (
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-card py-3 text-sm font-semibold text-destructive active:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              Changer d'inspecteur
            </button>
          )}

          <p className="px-2 pt-2 text-center text-[11px] text-muted-foreground">
            Toutes les données sont stockées localement (IndexedDB) sur cet appareil. Aucun envoi vers un serveur.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
