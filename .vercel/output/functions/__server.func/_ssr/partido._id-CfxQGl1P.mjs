import { n as getTeam } from "./map-DIqTEjwJ.mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link, z as notFound } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as OpponentMark, c as useFeed, d as resolveMatch, g as Crest, h as leagueById, m as matchById, n as Route, p as useNow, s as sportLabel, v as SportMark, y as cn } from "./router-DqZBZICO.mjs";
import { a as formatKickoff, r as competitionLine, t as Badge } from "./match-card-Acs5Zs0h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/partido._id-CfxQGl1P.js
var import_jsx_runtime = require_jsx_runtime();
function MatchPage() {
	const { id } = Route.useParams();
	const now = useNow();
	const feed = useFeed();
	const raw = matchById[id];
	const match = feed.byId[id] ?? (raw ? resolveMatch(raw, now) : void 0);
	if (!match) {
		if (!feed.fetchedAt) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-xl bg-surface px-4 py-16 text-center text-sm text-muted shadow-[var(--shadow-border)]",
			children: "Cargando marcador…"
		});
		throw notFound();
	}
	const league = leagueById[match.leagueId];
	const home = match.homeId ? getTeam(match.homeId) : void 0;
	const away = match.awayId ? getTeam(match.awayId) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs uppercase tracking-wider text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SportMark, { sport: match.sport }),
					sportLabel[match.sport],
					" · ",
					competitionLine(match)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-surface px-4 py-8 text-center shadow-[var(--shadow-border)] sm:px-8",
				children: [
					match.status === "live" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-live",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pulse-live size-1.5 rounded-full bg-live" }),
							match.source === "api" ? "Marcador oficial" : "En directo",
							" · ",
							match.period,
							" ·",
							" ",
							match.displayClock
						]
					}),
					match.status === "finished" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 text-xs font-medium uppercase tracking-wider text-muted",
						children: match.source === "api" ? "Final oficial" : "Finalizado"
					}),
					match.status === "scheduled" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 text-xs font-medium uppercase tracking-wider text-muted",
						children: formatKickoff(match.kickoff)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamBlock, {
								id: match.homeId,
								name: match.homeName,
								short: match.homeShort,
								team: home,
								badgeUrl: match.homeBadge
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-w-[7rem]",
								children: match.status === "scheduled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-5xl leading-none text-muted",
									children: "vs"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: cn("font-display text-6xl leading-none tabular-nums sm:text-7xl", match.status === "live" && "text-live"),
									children: [
										match.homeScore,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mx-1 text-3xl text-muted",
											children: "–"
										}),
										match.awayScore
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamBlock, {
								id: match.awayId,
								name: match.awayName,
								short: match.awayShort,
								team: away,
								badgeUrl: match.awayBadge
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-xs text-subtle",
						children: match.venue
					}),
					match.source === "api" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[11px] uppercase tracking-wider text-accent",
						children: "Actualización automática · TheSportsDB"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-3xl leading-none",
				children: "Cronología"
			}), match.happened.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-[var(--shadow-border)]",
				children: match.status === "scheduled" ? "El partido aún no ha comenzado." : match.source === "api" ? "Resultado oficial. Sin cronología detallada de este encuentro." : "Sin eventos registrados."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-1 rounded-xl bg-surface p-2 shadow-[var(--shadow-border)]",
				children: [...match.happened].reverse().map((ev, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventRow, {
					event: ev,
					match
				}, `${ev.minute}-${ev.player}-${i}`))
			})] }),
			league && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: league.name
			})
		]
	});
}
function TeamBlock({ id, name, short, team, badgeUrl }) {
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [team ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
		team,
		size: 56
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpponentMark, {
		short,
		name,
		size: 56,
		badgeUrl
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 max-w-[8rem] text-sm font-medium sm:max-w-none",
		children: name
	})] });
	if (!id) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-w-0 flex-1 flex-col items-center",
		children: inner
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/equipo/$slug",
		params: { slug: id },
		className: "flex min-w-0 flex-1 flex-col items-center hover:text-accent",
		children: inner
	});
}
function EventRow({ event, match }) {
	const kindLabel = {
		gol: "Gol",
		gol_pp: "Gol en propia",
		amarilla: "Amarilla",
		roja: "Roja",
		punto: "Anotación",
		set: "Set",
		periodo: "Parcial",
		tiempo: "Tiempo muerto"
	};
	const isHome = event.side === "home";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center gap-3 rounded-lg px-3 py-2.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "w-10 text-right text-xs tabular-nums text-muted",
				children: [event.minute, "'"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: event.kind === "gol" || event.kind === "set" || event.kind === "punto" ? "accent" : event.kind === "roja" ? "loss" : "default",
				children: kindLabel[event.kind] ?? event.kind
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1 truncate text-sm",
				children: [event.player, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted",
					children: [
						" ",
						"· ",
						isHome ? match.homeShort : match.awayShort
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-display text-lg leading-none tabular-nums",
				children: [
					event.homeScore,
					"–",
					event.awayScore
				]
			})
		]
	});
}
//#endregion
export { MatchPage as component };
