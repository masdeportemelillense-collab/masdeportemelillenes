import { l as teams } from "./map-DIqTEjwJ.mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link, z as notFound } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as useFeed, g as Crest, h as leagueById, i as Route$2, l as recentOf, o as SPORTS, s as sportLabel, u as upcomingOf, v as SportMark } from "./router-DqZBZICO.mjs";
import { n as MatchCard } from "./match-card-Acs5Zs0h.mjs";
import { t as StandingsTable } from "./standings-table-DMeWreHv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deporte._sport-bZnIKa-D.js
var import_jsx_runtime = require_jsx_runtime();
function isSport(value) {
	return SPORTS.some((s) => s.id === value);
}
function SportPage() {
	const { sport } = Route$2.useParams();
	if (!isSport(sport)) throw notFound();
	const { live, all, standings } = useFeed();
	const sportTeams = teams.filter((t) => t.sport === sport);
	const liveNow = live.filter((m) => m.sport === sport);
	const upcoming = upcomingOf(all.filter((m) => m.sport === sport), 8);
	const recent = recentOf(all.filter((m) => m.sport === sport), 8);
	const leagueIds = [...new Set(sportTeams.map((t) => t.leagueId))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-12 place-items-center rounded-xl bg-surface text-accent shadow-[var(--shadow-border)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SportMark, {
						sport,
						className: "size-5"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-5xl leading-none",
					children: sportLabel[sport]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						sportTeams.length,
						" ",
						sportTeams.length === 1 ? "equipo melillense" : "equipos melillenses"
					]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid grid-cols-1 gap-2 sm:grid-cols-2",
				children: sportTeams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/equipo/$slug",
					params: { slug: t.id },
					className: "flex items-center gap-3 rounded-xl bg-surface p-3.5 shadow-[var(--shadow-border)] transition-colors duration-150 hover:bg-surface-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
						team: t,
						size: 44
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate font-medium",
							children: t.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate text-xs text-muted",
							children: [
								t.category,
								" · ",
								t.gender === "f" ? "Femenino" : t.gender === "m" ? "Masculino" : "Mixto"
							]
						})]
					})]
				}, t.id))
			}),
			liveNow.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 font-display text-3xl leading-none",
				children: "En directo"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: liveNow.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, { match: m }, m.id))
			})] }),
			recent.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 font-display text-3xl leading-none",
				children: "Resultados"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: recent.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, { match: m }, m.id))
			})] }),
			upcoming.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 font-display text-3xl leading-none",
				children: "Calendario"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: upcoming.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, { match: m }, m.id))
			})] }),
			leagueIds.map((id) => {
				const league = leagueById[id];
				if (!league) return null;
				const highlight = sportTeams.find((t) => t.leagueId === id)?.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-1 font-display text-3xl leading-none",
						children: "Clasificación"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 text-sm text-muted",
						children: league.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StandingsTable, {
						rows: standings(id),
						highlightId: highlight,
						scoring: league.scoring
					})
				] }, id);
			})
		]
	});
}
//#endregion
export { SportPage as component };
