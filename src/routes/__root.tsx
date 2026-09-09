import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteShell } from "@/components/site-shell";
import { LiveFeedProvider } from "@/lib/api/feed";
import { getLiveSnapshot } from "@/lib/api/get-snapshot";
import type { LiveSnapshot } from "@/lib/api/types";
import appCss from "../styles.css?url";

const APP_NAME = "Melilla Directo";

export const Route = createRootRoute({
  loader: async (): Promise<LiveSnapshot | null> => {
    try {
      return await getLiveSnapshot();
    } catch {
      return null;
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0c0e12" },
      {
        name: "description",
        content:
          "Resultados en directo, calendario y clasificación de los equipos de Melilla: fútbol, baloncesto, voleibol, balonmano, fútbol sala y silla de ruedas.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      },
    ],
  }),
  component: Root,
});

function Root() {
  const initial = Route.useLoaderData();
  return (
    <html lang="es" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <AppQuery>
            <LiveFeedProvider initial={initial}>
              <SiteShell>
                <Outlet />
              </SiteShell>
            </LiveFeedProvider>
          </AppQuery>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

function AppQuery({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: true },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
