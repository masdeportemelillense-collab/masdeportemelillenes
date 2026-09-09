import { n as getTeam } from "./map-DIqTEjwJ.mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as OpponentMark, g as Crest, y as cn } from "./router-DqZBZICO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/standings-table-DMeWreHv.js
var import_jsx_runtime = require_jsx_runtime();
function FormDots({ form }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "hidden items-center gap-0.5 sm:inline-flex",
		children: form.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("inline-flex size-4 items-center justify-center rounded-sm text-[9px] font-semibold", f === "W" && "bg-win/20 text-win", f === "D" && "bg-surface-2 text-muted", f === "L" && "bg-loss/20 text-loss"),
			children: f
		}, `${f}-${i}`))
	});
}
function StandingsTable({ rows, highlightId, scoring }) {
	const isBasket = scoring === "basket";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[520px] text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border text-left text-[11px] uppercase tracking-wider text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-3 font-medium",
						children: "#"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-2 py-3 font-medium",
						children: "Equipo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-2 py-3 text-right font-medium",
						children: "PJ"
					}),
					isBasket ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-2 py-3 text-right font-medium",
						children: "G"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-2 py-3 text-right font-medium",
						children: "P"
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-3 text-right font-medium",
							children: "G"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "hidden px-2 py-3 text-right font-medium sm:table-cell",
							children: "E"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-3 text-right font-medium",
							children: "P"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "hidden px-2 py-3 text-right font-medium md:table-cell",
						children: "GF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "hidden px-2 py-3 text-right font-medium md:table-cell",
						children: "GC"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-2 py-3 text-right font-medium",
						children: "DG"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-3 text-right font-medium",
						children: isBasket ? "Bal" : "Pts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "hidden px-3 py-3 font-medium sm:table-cell",
						children: "Forma"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => {
				const team = row.teamId ? getTeam(row.teamId) : void 0;
				const highlighted = Boolean(highlightId && row.teamId === highlightId);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: cn("border-b border-border last:border-0", highlighted && "bg-accent/10"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2.5 tabular-nums text-muted",
							children: row.pos
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2.5",
							children: team ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/equipo/$slug",
								params: { slug: team.id },
								className: "flex items-center gap-2 hover:text-accent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
									team,
									size: 28
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("truncate font-medium", highlighted && "text-accent"),
									children: row.name
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpponentMark, {
									short: row.short,
									name: row.name,
									size: 28
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate font-medium",
									children: row.name
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2.5 text-right tabular-nums",
							children: row.pj
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2.5 text-right tabular-nums",
							children: row.g
						}),
						!isBasket && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "hidden px-2 py-2.5 text-right tabular-nums sm:table-cell",
							children: row.e
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2.5 text-right tabular-nums",
							children: row.p
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "hidden px-2 py-2.5 text-right tabular-nums md:table-cell",
							children: row.gf
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "hidden px-2 py-2.5 text-right tabular-nums md:table-cell",
							children: row.gc
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2.5 text-right tabular-nums",
							children: row.gf - row.gc > 0 ? `+${row.gf - row.gc}` : row.gf - row.gc
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2.5 text-right font-medium tabular-nums",
							children: isBasket ? `${row.g}-${row.p}` : row.pts
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "hidden px-3 py-2.5 sm:table-cell",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormDots, { form: row.form })
						})
					]
				}, row.name);
			}) })]
		})
	});
}
//#endregion
export { StandingsTable as t };
