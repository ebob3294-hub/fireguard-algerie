import { QueryClient } from "@tanstack/react-query";
import { createRouter, createHashHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Detect Capacitor / file:// / Android WebView at runtime. On those origins
// the SSR server is unreachable, so we must drive routing through the URL hash
// (e.g. file:///android_asset/public/index.html#/carte). On the regular web
// deploy we keep the default history so SSR, deep-links and SEO keep working.
function shouldUseHashHistory(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.protocol === "file:") return true;
  // @ts-expect-error — Capacitor injects this global on native shells.
  if (typeof window.Capacitor !== "undefined") return true;
  if (/Android.*wv\)/.test(window.navigator.userAgent)) return true;
  return false;
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    history: shouldUseHashHistory() ? createHashHistory() : undefined,
  });

  return router;
};
