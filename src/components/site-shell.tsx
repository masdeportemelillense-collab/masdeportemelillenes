import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { SportMark } from "@/components/sport-mark";
import { Crest } from "@/components/crest";
import { LiveTicker } from "@/components/live-ticker";
import { teams } from "@/data/teams";
import { POLL_MS, useFeed } from "@/lib/api/feed";
import { SPORTS } from "@/lib/sports";
import { cn } from "@/lib/utils";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-bg text-fg">
      <Header />
      <FeedBar />
      <LiveTicker />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Más deporte Melillense · Temporada 2026-27</p>
          <p>
            Calendario y clasificaciones de los equipos de Melilla. Fútbol: LaPreferente · Fútbol sala:
            Solo-FutSal.
          </p>
        </div>
      </footer>
    </div>
  );
}

function formatEta(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function FeedBar() {
  const { ok, isFetching, fetchedAt, officialCount, officialLive, nextPollIn } = useFeed();
  const stamp = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Europe/Madrid",
      })
    : "—";
  const progress = 1 - nextPollIn / POLL_MS;

  return (
    <div className="border-b border-border bg-surface-2/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5 text-[11px] uppercase tracking-wider text-muted sm:px-6">
        <p className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              ok ? "bg-win" : "bg-subtle",
              isFetching && "pulse-live",
            )}
          />
          <span className="truncate">
            {isFetching
              ? "Consultando marcadores…"
              : ok
                ? officialLive > 0
                  ? `Monitor 1 min · ${officialLive} en juego`
                  : `Monitor 1 min · ${officialCount} partido${officialCount === 1 ? "" : "s"}`
                : "Monitor 1 min · reintentando API"}
          </span>
        </p>
        <p className="shrink-0 tabular-nums">
          {isFetching ? "Act. ahora" : `Act. ${stamp} · ${formatEta(nextPollIn)}`}
        </p>
      </div>
      <div className="h-px bg-border">
        <div
          className="h-px origin-left bg-accent transition-transform duration-1000 ease-linear"
          style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress))})` }}
        />
      </div>
    </div>
  );
}

function Header() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    return teams
      .filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.short.toLowerCase().includes(term) ||
          t.nickname.toLowerCase().includes(term),
      )
      .slice(0, 6);
  }, [q]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/92 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img
            src="/logo-mdm.svg"
            alt="Más deporte Melillense"
            className="h-14 w-auto max-w-[200px] object-contain sm:h-16"
          />
        </Link>
        <nav className="ml-2 hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex">
          {SPORTS.map((s) => (
            <Link
              key={s.id}
              to="/deporte/$sport"
              params={{ sport: s.id }}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-accent"
            >
              <SportMark sport={s.id} />
              {s.label}
            </Link>
          ))}
        </nav>
        <div className="relative ml-auto w-[9.5rem] sm:w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar equipo"
            aria-label="Buscar equipo"
            className="h-11 w-full rounded-md border-0 bg-surface pr-3 pl-9 text-sm text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus:ring-2 focus:ring-accent/50"
          />
          {results.length > 0 && (
            <ul className="absolute top-[calc(100%+6px)] right-0 left-0 z-40 overflow-hidden rounded-xl bg-surface-2 shadow-[var(--shadow-border)]">
              {results.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-surface"
                    onClick={() => {
                      setQ("");
                      void navigate({ to: "/equipo/$slug", params: { slug: t.id } });
                    }}
                  >
                    <Crest team={t} size={28} />
                    <span className="min-w-0 truncate">{t.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-3 lg:hidden">
        {SPORTS.map((s) => (
          <Link
            key={s.id}
            to="/deporte/$sport"
            params={{ sport: s.id }}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-surface px-3 text-xs text-muted shadow-[var(--shadow-border)]",
            )}
          >
            <SportMark sport={s.id} />
            {s.short}
          </Link>
        ))}
      </nav>
    </header>
  );
}
