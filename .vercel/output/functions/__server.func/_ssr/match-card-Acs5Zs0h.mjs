import { n as getTeam } from "./map-DIqTEjwJ.mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { _ as OpponentMark, f as teamResult, g as Crest, h as leagueById, s as sportLabel, v as SportMark, y as cn } from "./router-DqZBZICO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/match-card-Acs5Zs0h.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase", {
	variants: { variant: {
		default: "bg-surface-2 text-muted",
		live: "bg-live/15 text-live",
		win: "bg-win/15 text-win",
		loss: "bg-loss/15 text-loss",
		draw: "bg-surface-2 text-muted",
		accent: "bg-accent/15 text-accent"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({
			variant,
			className
		})),
		...props
	});
}
function Side({ id, name, short, align, badgeUrl }) {
	const team = id ? getTeam(id) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-w-0 flex-1 items-center gap-2.5", align === "right" && "flex-row-reverse text-right"),
		children: [team ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
			team,
			size: 36
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpponentMark, {
			short,
			name,
			size: 36,
			badgeUrl
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-sm font-medium text-fg",
				children: name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-xs text-muted",
				children: short
			})]
		})]
	});
}
function StatusChip({ match }) {
	if (match.status === "live") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-live",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pulse-live size-1.5 rounded-full bg-live" }),
			match.source === "api" ? "Oficial" : "En directo",
			" · ",
			match.displayClock
		]
	});
	if (match.status === "finished") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-[11px] font-medium uppercase tracking-wider text-muted",
		children: match.source === "api" ? "Final oficial" : "Final"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-[11px] font-medium uppercase tracking-wider text-muted",
		children: formatKickoff(match.kickoff)
	});
}
function competitionLine(match) {
	const league = leagueById[match.leagueId];
	const name = league?.shortName ?? match.competition ?? match.leagueId;
	if (match.isCup || league?.format === "cup") return name;
	if (match.jornada > 0) return `${name} · J${match.jornada}`;
	return `${name} · Amistoso`;
}
function formatKickoff(iso) {
	return new Date(iso).toLocaleString("es-ES", {
		weekday: "short",
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Europe/Madrid"
	});
}
function formatDay(iso) {
	return new Date(iso).toLocaleDateString("es-ES", {
		weekday: "long",
		day: "numeric",
		month: "long",
		timeZone: "Europe/Madrid"
	});
}
function MatchCard({ match, highlightId }) {
	const result = highlightId ? teamResult(match, highlightId) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/partido/$id",
		params: { id: match.id },
		className: "block rounded-xl bg-surface p-3.5 shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-surface-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-2 text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SportMark, { sport: match.sport }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "truncate text-xs",
						children: [
							sportLabel[match.sport],
							" · ",
							competitionLine(match)
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						result === "W" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "win",
							children: "Victoria"
						}),
						result === "D" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "draw",
							children: "Empate"
						}),
						result === "L" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "loss",
							children: "Derrota"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { match })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Side, {
						id: match.homeId,
						name: match.homeName,
						short: match.homeShort,
						align: "left",
						badgeUrl: match.homeBadge
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-16 shrink-0 text-center sm:w-[5.5rem]",
						children: match.status === "scheduled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xl leading-none text-muted tabular-nums sm:text-2xl",
							children: new Date(match.kickoff).toLocaleTimeString("es-ES", {
								hour: "2-digit",
								minute: "2-digit",
								timeZone: "Europe/Madrid"
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: cn("font-display text-[1.65rem] leading-none tabular-nums sm:text-[2rem]", match.status === "live" && "text-live"),
							children: [
								match.homeScore,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mx-1 text-muted",
									children: "–"
								}),
								match.awayScore
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Side, {
						id: match.awayId,
						name: match.awayName,
						short: match.awayShort,
						align: "right",
						badgeUrl: match.awayBadge
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 truncate text-xs text-subtle",
				children: match.venue
			})
		]
	});
}
//#endregion
export { formatKickoff as a, formatDay as i, MatchCard as n, competitionLine as r, Badge as t };
