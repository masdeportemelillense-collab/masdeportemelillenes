import { l as teams } from "./map-DIqTEjwJ.mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ChevronRight, n as Star } from "../_libs/lucide-react.mjs";
import { c as useFeed, g as Crest, o as SPORTS, s as sportLabel, v as SportMark } from "./router-DqZBZICO.mjs";
import { n as MatchCard } from "./match-card-Acs5Zs0h.mjs";
import { n as useFavoriteIds, t as useFavorite } from "./favorites-BeuHIm-x.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CX0_fiiB.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { live, upcoming, recent, today } = useFeed();
	const favIds = useFavoriteIds();
	const favs = teams.filter((t) => favIds.includes(t.id));
	const todayRest = today.filter((m) => m.status !== "live");
	const restUpcoming = upcoming.filter((m) => !today.some((t) => t.id === m.id)).slice(0, 6);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative overflow-hidden rounded-2xl bg-surface px-5 py-8 sm:px-8 sm:py-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_80%_-10%,color-mix(in_oklab,var(--color-accent)_16%,transparent),transparent)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium uppercase tracking-[0.22em] text-accent",
							children: "Temporada 2026-27 · Ciudad Autónoma"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-3 font-display text-5xl leading-[0.9] sm:text-6xl",
							children: "El deporte de Melilla, en directo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-lg text-sm text-muted sm:text-base",
							children: "Marcadores oficiales en tiempo real de UD Melilla y Melilla Baloncesto, más calendario y clasificación del resto de equipos de la ciudad."
						})
					]
				})]
			}),
			live.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
				title: "En directo ahora",
				hint: `${live.length} en juego`
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: live.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, { match: m }, m.id))
			})] }),
			todayRest.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
				title: "Hoy",
				hint: "Hora de Madrid"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: todayRest.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, { match: m }, m.id))
			})] }),
			favs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, { title: "Tus equipos" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: favs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/equipo/$slug",
					params: { slug: t.id },
					className: "flex items-center gap-3 rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] transition-colors duration-150 hover:bg-surface-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
						team: t,
						size: 36
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm font-medium",
							children: t.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-xs text-muted",
							children: t.category
						})]
					})]
				}, t.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, { title: "Deportes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6",
				children: SPORTS.map((s) => {
					const count = teams.filter((t) => t.sport === s.id).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/deporte/$sport",
						params: { sport: s.id },
						className: "group rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] transition-colors duration-150 hover:bg-surface-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SportMark, {
								sport: s.id,
								className: "size-5 text-accent"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 font-medium",
								children: s.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									count,
									" ",
									count === 1 ? "equipo" : "equipos"
								]
							})
						]
					}, s.id);
				})
			})] }),
			restUpcoming.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, { title: "Próximos partidos" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: restUpcoming.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, { match: m }, m.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, { title: "Últimos resultados" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: recent.slice(0, 6).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, { match: m }, m.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, { title: "Todos los equipos" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3",
				children: teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamChip, { id: t.id }, t.id))
			})] })
		]
	});
}
function SectionHead({ title, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4 flex items-end justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-3xl leading-none",
			children: title
		}), hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-wider text-muted",
			children: hint
		})]
	});
}
function TeamChip({ id }) {
	const team = teams.find((t) => t.id === id);
	const { fav, toggle } = useFavorite(id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 rounded-xl bg-surface py-2 pr-2 pl-3 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/equipo/$slug",
			params: { slug: team.id },
			className: "flex min-w-0 flex-1 items-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
					team,
					size: 36
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate text-sm font-medium",
						children: team.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5 text-xs text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SportMark, {
								sport: team.sport,
								className: "size-3"
							}),
							sportLabel[team.sport],
							" · ",
							team.category
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 shrink-0 text-subtle" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": fav ? "Quitar de favoritos" : "Añadir a favoritos",
			onClick: () => toggle(id),
			className: "grid size-11 place-items-center rounded-md text-muted hover:text-fg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: fav ? "size-4 fill-accent text-accent" : "size-4" })
		})]
	});
}
//#endregion
export { Home as component };
