import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { db } from "@/lib/db";
import { Flame } from "lucide-react";

function isClientReady() {
  return typeof window !== "undefined";
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HydraNouaceur — Connexion inspecteur" },
      { name: "description", content: "Connectez-vous pour gérer les bornes d'incendie de Nouaceur." },
    ],
  }),
  beforeLoad: async () => {
    if (!isClientReady()) return;
    const existing = await db.inspectors.toCollection().first();
    if (existing) throw redirect({ to: "/carte" });
  },
  component: WelcomePage,
});

function WelcomePage() {
  const [name, setName] = useState("");
  const [matricule, setMatricule] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await db.inspectors.add({
      name: name.trim(),
      matricule: matricule.trim() || undefined,
      createdAt: Date.now(),
    });
    window.location.href = "/carte";
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-secondary to-secondary/80 text-secondary-foreground">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/40">
          <Flame className="h-10 w-10 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <h1 className="font-display text-3xl font-bold">HydraNouaceur</h1>
        <p className="mt-2 max-w-xs text-center text-sm text-secondary-foreground/80">
          Recensement & inspection des bornes d'incendie de la province de Nouaceur
        </p>

        <form onSubmit={handleStart} className="mt-10 w-full max-w-sm space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-foreground/70">
              Nom de l'inspecteur *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Karim Benali"
              className="w-full rounded-lg border-0 bg-white/95 px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-foreground/70">
              Matricule (optionnel)
            </label>
            <input
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              placeholder="Ex: 1024"
              className="w-full rounded-lg border-0 bg-white/95 px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "…" : "Commencer l'inspection"}
          </button>
        </form>

        <p className="mt-8 max-w-xs text-center text-xs text-secondary-foreground/60">
          Les données sont stockées localement sur cet appareil. Fonctionne hors-ligne.
        </p>
      </div>
      <div className="bottom-safe px-6 text-center text-xs text-secondary-foreground/50">
        <Link to="/carte" className="underline">Continuer en mode visiteur</Link>
      </div>
    </div>
  );
}
