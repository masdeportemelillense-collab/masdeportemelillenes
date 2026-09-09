import { n as getTeam } from "./map-DIqTEjwJ.mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link, z as notFound } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as MapPin, n as Star } from "../_libs/lucide-react.mjs";
import { a as GENDER_LABEL, c as useFeed, g as Crest, h as leagueById, r as Route$1, s as sportLabel, v as SportMark, y as cn } from "./router-DqZBZICO.mjs";
import { i as formatDay, n as MatchCard } from "./match-card-Acs5Zs0h.mjs";
import { t as StandingsTable } from "./standings-table-DMeWreHv.mjs";
import { t as useFavorite } from "./favorites-BeuHIm-x.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/equipo._slug-n6xpXdYW.js
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
function TabsList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
		className: cn("flex w-full gap-1 rounded-xl bg-surface p-1 shadow-[var(--shadow-border)]", className),
		...props
	});
}
function TabsTrigger({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		className: cn("inline-flex h-11 flex-1 items-center justify-center rounded-lg px-3 text-sm font-medium text-muted transition-[color,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-fg data-[state=active]:bg-surface-2 data-[state=active]:text-fg", className),
		...props
	});
}
function TabsContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
		className: cn("mt-5 outline-none", className),
		...props
	});
}
function TeamPage() {
	const { slug } = Route$1.useParams();
	const team = getTeam(slug);
	if (!team) throw notFound();
	const feed = useFeed();
	const league = leagueById[team.leagueId];
	const all = feed.forTeam(team.id);
	const results = [...all].filter((m) => m.status === "finished").reverse();
	const calendar = all.filter((m) => m.status !== "finished");
	const live = all.filter((m) => m.status === "live");
	const next = feed.next(team.id);
	const form = feed.form(team.id);
	const table = feed.standings(team.leagueId);
	const pos = table.find((r) => r.teamId === team.id);
	const { fav, toggle } = useFavorite(team.id);
	const groupedCalendar = groupByDay(calendar.map((m) => ({
		...m,
		sort: m.kickoff
	})));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1.5",
						style: { background: team.primary }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
								team,
								size: 72
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-2 text-xs uppercase tracking-wider text-muted",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SportMark, {
												sport: team.sport,
												className: "size-3.5"
											}),
											sportLabel[team.sport],
											" · ",
											GENDER_LABEL[team.gender],
											" · ",
											team.category
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "mt-1 font-display text-5xl leading-none",
										children: team.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 max-w-2xl text-sm text-muted",
										children: team.summary
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 flex items-center gap-1.5 text-xs text-subtle",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }),
											team.venue,
											" · Fundado en ",
											team.founded
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => toggle(team.id),
								className: cn("inline-flex h-11 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-medium", fav ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: fav ? "size-4 fill-current" : "size-4" }), fav ? "Favorito" : "Seguir"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Liga",
								value: league?.shortName ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Puesto",
								value: pos ? `${pos.pos}º` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Forma",
								value: form.length ? form.join("  ") : "Sin partidos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Siguiente",
								value: next ? `${next.homeId === team.id ? next.awayShort : next.homeShort}` : "—"
							})
						]
					})
				]
			}),
			live.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, {
				match: m,
				highlightId: team.id
			}, m.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "resultados",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "resultados",
							children: "Resultados"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "calendario",
							children: "Calendario"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "clasificacion",
							children: "Clasificación"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "resultados",
						children: results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Aún no hay resultados oficiales de liga." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-3",
							children: results.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, {
								match: m,
								highlightId: team.id
							}, m.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "calendario",
						children: calendar.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No hay partidos programados." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-6",
							children: groupedCalendar.map(([day, list]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-2 text-xs font-medium uppercase tracking-wider text-muted",
								children: formatDay(list[0].kickoff)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3",
								children: list.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, {
									match: m,
									highlightId: team.id
								}, m.id))
							})] }, day))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "clasificacion",
						children: league ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-4 text-sm text-muted",
							children: league.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StandingsTable, {
							rows: table,
							highlightId: team.id,
							scoring: league.scoring
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Clasificación no disponible." })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/deporte/$sport",
					params: { sport: team.sport },
					className: "text-accent hover:underline",
					children: ["Ver todo ", sportLabel[team.sport].toLowerCase()]
				})
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-surface px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] uppercase tracking-wider text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-0.5 truncate text-sm font-medium",
			children: value
		})]
	});
}
function Empty({ text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted shadow-[var(--shadow-border)]",
		children: text
	});
}
function groupByDay(items) {
	const map = /* @__PURE__ */ new Map();
	for (const item of items) {
		const key = new Date(item.kickoff).toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
		const list = map.get(key) ?? [];
		list.push(item);
		map.set(key, list);
	}
	return [...map.entries()];
}
//#endregion
export { TeamPage as component };
