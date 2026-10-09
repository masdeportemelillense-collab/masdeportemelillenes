import { useQuery } from "@tanstack/react-query";
import { getGroup9 } from "@/lib/api/group9";

export function Group9Board() {
  const q = useQuery({ queryKey: ["group9"], queryFn: () => getGroup9(), refetchInterval: 60_000, staleTime: 30_000 });
  const data = q.data;
  if (!data?.matches.length) return null;
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <h2 className="font-display text-3xl leading-none">Jornada {data.jornada || ""} · Grupo 9</h2>
      <p className="mt-1 text-xs text-muted">Resultados de Tercera Federación, actualizados desde Futbolme.</p>
      <ul className="mt-3 divide-y divide-border">
        {data.matches.map((m) => (
          <li key={`${m.home}-${m.away}`} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 py-2 text-sm sm:grid-cols-[1fr_auto_1fr]">
            <span className="leading-snug [overflow-wrap:anywhere] sm:text-right">{m.home}</span>
            <span className={m.played ? "font-semibold tabular-nums text-fg" : "tabular-nums text-muted"}>{m.score}</span>
            <span className="col-span-2 leading-snug [overflow-wrap:anywhere] sm:col-span-1">{m.away}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
