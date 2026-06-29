// Client-only entry used by the static Capacitor build. It does NOT hydrate
// SSR markup — it mounts the router fresh into an empty <div id="root">.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";

import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();
// getRouter constructs its own QueryClient and exposes it via context.
const queryClient = (router.options.context as { queryClient: import("@tanstack/react-query").QueryClient }).queryClient;

const container = document.getElementById("root");
if (!container) throw new Error("#root element not found");

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
