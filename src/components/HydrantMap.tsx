import { useEffect, useRef } from "react";
import type * as LType from "leaflet";
import { useLiveQuery } from "dexie-react-hooks";
import { db, statusClass, statusLabel, type Hydrant } from "@/lib/db";
import { NOUACEUR_CENTER, NOUACEUR_ZOOM } from "@/lib/districts";
import { useNavigate } from "@tanstack/react-router";

interface Props {
  filterDistrict?: string;
  filterStatus?: "all" | "ok" | "warn" | "bad";
}

function pinIcon(L: typeof LType, kind: "ok" | "warn" | "bad") {
  return L.divIcon({
    className: "",
    html: `<div class="hydrant-pin ${kind}"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 30],
  });
}

export function HydrantMap({ filterDistrict, filterStatus = "all" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LType.Map | null>(null);
  const layerRef = useRef<LType.LayerGroup | null>(null);
  const LRef = useRef<typeof LType | null>(null);
  const navigate = useNavigate();

  const hydrants = useLiveQuery(() => db.hydrants.toArray(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === "undefined") return;
      const mod = await import("leaflet");
      const L = mod.default ?? mod;
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(containerRef.current, {
        center: NOUACEUR_CENTER,
        zoom: NOUACEUR_ZOOM,
        zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 14),
          () => {},
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const L = LRef.current;
    if (!L || !layerRef.current || !hydrants) return;
    layerRef.current.clearLayers();
    const filtered = hydrants.filter((h: Hydrant) => {
      if (filterDistrict && filterDistrict !== "all" && h.district !== filterDistrict) return false;
      if (filterStatus !== "all" && statusClass(h) !== filterStatus) return false;
      return true;
    });
    filtered.forEach((h) => {
      const marker = L.marker([h.lat, h.lng], { icon: pinIcon(L, statusClass(h)) });
      marker.bindPopup(
        `<div style="font-family:Inter,sans-serif;min-width:160px">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px">${h.code}</div>
          <div style="font-size:12px;color:#555;margin-bottom:2px">${h.district}</div>
          <div style="font-size:12px;margin-bottom:6px"><b>${statusLabel(h)}</b></div>
          <button id="open-${h.id}" style="background:#b3261e;color:white;border:0;padding:6px 10px;border-radius:6px;font-size:12px;cursor:pointer;width:100%">Détails</button>
        </div>`
      );
      marker.on("popupopen", () => {
        setTimeout(() => {
          const btn = document.getElementById(`open-${h.id}`);
          btn?.addEventListener("click", () => navigate({ to: "/borne/$id", params: { id: String(h.id) } }));
        }, 0);
      });
      layerRef.current!.addLayer(marker);
    });
  }, [hydrants, filterDistrict, filterStatus, navigate]);

  return <div ref={containerRef} className="h-full w-full" />;
}
