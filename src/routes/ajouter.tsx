import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { HydrantForm, type HydrantFormValue } from "@/components/HydrantForm";
import { db } from "@/lib/db";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/ajouter")({
  head: () => ({
    meta: [
      { title: "Ajouter une borne — HydraNouaceur" },
      { name: "description", content: "Enregistrez une nouvelle borne d'incendie sur le terrain." },
    ],
  }),
  component: AddPage,
});

function AddPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  async function handleSave(v: HydrantFormValue) {
    if (v.lat == null || v.lng == null) return;
    setSaving(true);
    const inspector = await db.inspectors.toCollection().first();
    const now = Date.now();
    const id = await db.hydrants.add({
      code: v.code,
      lat: v.lat,
      lng: v.lng,
      district: v.district,
      hasWater: v.hasWater,
      pressure: v.pressure,
      physical: v.physical,
      photo: v.photo,
      notes: v.notes,
      inspector: inspector?.name ?? "Anonyme",
      createdAt: now,
      updatedAt: now,
    });
    navigate({ to: "/borne/$id", params: { id: String(id) } });
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <header className="flex items-center gap-2 border-b border-border bg-card px-3 py-3">
          <Link to="/carte" className="-ml-1 rounded-lg p-1.5 active:bg-accent">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-lg font-bold text-secondary">Nouvelle borne</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          <HydrantForm onSubmit={handleSave} submitting={saving} submitLabel="Enregistrer la borne" />
        </div>
      </div>
    </AppShell>
  );
}
