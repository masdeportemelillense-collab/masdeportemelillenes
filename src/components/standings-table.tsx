import { Link } from "@tanstack/react-router";
import { Crest, OpponentMark } from "@/components/crest";
import { getTeam } from "@/data/teams";
import { leagueById } from "@/data/leagues";
import type { StandingRow } from "@/lib/types";
import { cn } from "@/lib/utils";

function FormDots({ form }: { form: StandingRow["form"] }) {
  return (
    <span className="hidden items-center gap-0.5 sm:inline-flex">
      {form.map((f, i) => (
        <span
          key={`${f}-${i}`}
          className={cn(
            "inline-flex size-4 items-center justify-center rounded-sm text-[9px] font-semibold",
            f === "W" && "bg-win/20 text-win",
            f === "D" && "bg-surface-2 text-muted",
            f === "L" && "bg-loss/20 text-loss",
          )}
        >
          {f}
        </span>
      ))}
    </span>
  );
}

export function StandingsTable({
  rows,
  highlightId,
  scoring,
}: {
  rows: StandingRow[];
  highlightId?: string;
  scoring: "football" | "basket" | "volley";
}) {
  const isBasket = scoring === "basket";
  return (
    <div className="overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted">
            <th className="px-3 py-3 font-medium">#</th>
            <th className="px-2 py-3 font-medium">Equipo</th>
            <th className="px-2 py-3 text-right font-medium">PJ</th>
            {isBasket ? (
              <>
                <th className="px-2 py-3 text-right font-medium">G</th>
                <th className="px-2 py-3 text-right font-medium">P</th>
              </>
            ) : (
              <>
                <th className="px-2 py-3 text-right font-medium">G</th>
                <th className="hidden px-2 py-3 text-right font-medium sm:table-cell">E</th>
                <th className="px-2 py-3 text-right font-medium">P</th>
              </>
            )}
            <th className="hidden px-2 py-3 text-right font-medium md:table-cell">GF</th>
            <th className="hidden px-2 py-3 text-right font-medium md:table-cell">GC</th>
            <th className="px-2 py-3 text-right font-medium">DG</th>
            <th className="px-3 py-3 text-right font-medium">{isBasket ? "Bal" : "Pts"}</th>
            <th className="hidden px-3 py-3 font-medium sm:table-cell">Forma</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const team = row.teamId ? getTeam(row.teamId) : undefined;
            const highlighted = Boolean(highlightId && row.teamId === highlightId);
            return (
              <tr
                key={row.name}
                className={cn(
                  "border-b border-border last:border-0",
                  highlighted && "bg-accent/10",
                )}
              >
                <td className="px-3 py-2.5 tabular-nums text-muted">{row.pos}</td>
                <td className="px-2 py-2.5">
                  {team ? (
                    <Link
                      to="/equipo/$slug"
                      params={{ slug: team.id }}
                      className="flex items-center gap-2 hover:text-accent"
                    >
                      <Crest team={team} size={28} />
                      <span className={cn("truncate font-medium", highlighted && "text-accent")}>
                        {row.name}
                      </span>
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2">
                      <OpponentMark short={row.short} name={row.name} size={28} />
                      <span className="truncate font-medium">{row.name}</span>
                    </span>
                  )}
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums">{row.pj}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{row.g}</td>
                {!isBasket && (
                  <td className="hidden px-2 py-2.5 text-right tabular-nums sm:table-cell">{row.e}</td>
                )}
                <td className="px-2 py-2.5 text-right tabular-nums">{row.p}</td>
                <td className="hidden px-2 py-2.5 text-right tabular-nums md:table-cell">{row.gf}</td>
                <td className="hidden px-2 py-2.5 text-right tabular-nums md:table-cell">{row.gc}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">
                  {row.gf - row.gc > 0 ? `+${row.gf - row.gc}` : row.gf - row.gc}
                </td>
                <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                  {isBasket ? `${row.g}-${row.p}` : row.pts}
                </td>
                <td className="hidden px-3 py-2.5 sm:table-cell">
                  <FormDots form={row.form} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function LeagueHeading({ leagueId }: { leagueId: string }) {
  const league = leagueById[leagueId];
  if (!league) return null;
  return <p className="text-sm text-muted">{league.name}</p>;
}
