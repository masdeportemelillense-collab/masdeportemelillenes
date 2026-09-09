import { i as __toESM } from "../_runtime.mjs";
import { c as teamById, i as normName, l as teams, t as API_TRACKED_SLUGS } from "./map-DIqTEjwJ.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link, f as createRouter, g as createRootRoute, h as createFileRoute, l as Scripts, m as lazyRouteComponent, p as Outlet, u as HeadContent, v as useNavigate, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { r as Search, t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { n as QueryClientProvider, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DqZBZICO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Svg({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "1.6",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		className: cn("size-4", className),
		"aria-hidden": "true",
		children
	});
}
function SportMark({ sport, className }) {
	switch (sport) {
		case "futbol": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Svg, {
			className,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "12",
					cy: "12",
					r: "9"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 3v3M12 18v3M3 12h3M18 12h3" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 8.5 12 7l4 1.5L14.5 12 16 16.5 12 17l-4-1.5L9.5 12Z" })
			]
		});
		case "baloncesto": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Svg, {
			className,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "9"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 3c3 3 3 15 0 18M3 12c3-3 15-3 18 0" })]
		});
		case "voleibol": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Svg, {
			className,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "9"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M7 5c3 4 3 10 0 14M17 5c-3 4-3 10 0 14M4 14c5-1 11-1 16 0" })]
		});
		case "balonmano": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Svg, {
			className,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "9"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 6c2 3 6 3 8 0M8 18c2-3 6-3 8 0M5 12h14" })]
		});
		case "futsal": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Svg, {
			className,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "4",
				y: "4",
				width: "16",
				height: "16",
				rx: "3"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "3.5"
			})]
		});
		case "bsr": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Svg, {
			className,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "12",
					cy: "13",
					r: "7"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "12",
					cy: "13",
					r: "3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9 5h6" })
			]
		});
	}
}
/** Auto-generated crest map. Official files in /public/badges, SVG fallbacks for the rest. */
var BY_ID = {
	"ud-melilla": "/badges/ud-melilla.png",
	"melilla-baloncesto": "/badges/melilla-baloncesto.png",
	"la-salle-fem": "/badges/la-salle-tw.png",
	"la-salle-b": "/badges/la-salle-tw.png",
	"cv-melilla-m": "/badges/cv-melilla-tw.png",
	"cv-melilla-f": "/badges/cv-melilla-tw.png",
	"melilla-city": "/badges/city-tw.png",
	"melistar": "/badges/melistar-tw.png",
	"Motril": "/badges/motril-tw.png",
	"Unicaja": "/badges/unicaja.png",
	"Estudiantes": "/badges/estudiantes.png",
	"Guaguas": "/badges/guaguas.png",
	"conil": "/badges/conil-tw.png",
	"CON": "/badges/conqueridorvalencia.svg",
	"marbelli": "/badges/marbelli-tw.png",
	"MRB": "/badges/marbellajuvenil.svg",
	"san-pedro": "/badges/san-pedro-tw.png",
	"SPE": "/badges/san-pedro-tw.png",
	"CAL": "/badges/calavera-tw.png",
	"MOS": "/badges/opticlassraicesmostoles.svg",
	"SFX": "/badges/san-felix-tw.png",
	"CEU": "/badges/estudiantesceuta.svg",
	"ZAB": "/badges/zabal-tw.png",
	"atletico-melilla-dh": "/badges/atletico-melilla-dh.svg",
	"ATMJ": "/badges/atletico-melilla-dh.svg",
	"atm-melilla": "/badges/atm-melilla.svg",
	"ATM": "/badges/atm-melilla.svg",
	"enrique-soler": "/badges/enrique-soler.svg",
	"SOLER": "/badges/enrique-soler.svg",
	"maritimo": "/badges/maritimo.svg",
	"RCMM": "/badges/maritimo.svg",
	"virgen-victoria": "/badges/virgen-victoria.svg",
	"VDV": "/badges/virgen-victoria.svg",
	"t-maravillas": "/badges/t-maravillas.svg",
	"TMA": "/badges/t-maravillas.svg",
	"T-Maravillas": "/badges/t-maravillas.svg",
	"torreblanca": "/badges/torreblanca.svg",
	"TBN": "/badges/torreblanca.svg",
	"Torreblanca": "/badges/torreblanca.svg",
	"torreblanca-b": "/badges/torreblanca-b.svg",
	"TBNB": "/badges/torreblanca-b.svg",
	"nueva-era": "/badges/nueva-era.svg",
	"NERA": "/badges/nueva-era.svg",
	"rusadir-fs-dh": "/badges/rusadir-fs-dh.svg",
	"RUS": "/badges/rusadir-fs-dh.svg",
	"pena-rm-fs": "/badges/pena-rm-fs.svg",
	"PRM": "/badges/pena-rm-fs.svg",
	"melilla-bsr": "/badges/melilla-bsr.svg",
	"MBSR": "/badges/melilla-bsr.svg",
	"torremar": "/badges/torremar.svg",
	"TDM": "/badges/torremar.svg",
	"malagajuniors": "/badges/malagajuniors.svg",
	"MJF": "/badges/malagajuniors.svg",
	"alhaurino": "/badges/alhaurino.svg",
	"ALH": "/badges/alhamajuvenil.svg",
	"atleticoporcuna": "/badges/atleticoporcuna.svg",
	"POR": "/badges/atleticoporcuna.svg",
	"atleticomarbella": "/badges/atleticomarbella.svg",
	"AMB": "/badges/atleticomarbella.svg",
	"cantoria2017": "/badges/cantoria2017.svg",
	"CAN": "/badges/cantoria2017.svg",
	"linaresdeportivo": "/badges/linaresdeportivo.svg",
	"LIN": "/badges/linaresdeportivo.svg",
	"tomares": "/badges/tomares.svg",
	"TOM": "/badges/tomares.svg",
	"utrera": "/badges/utrera.svg",
	"UTR": "/badges/utrera.svg",
	"rincon": "/badges/rincon.svg",
	"RIN": "/badges/rinconfertilidadmalagab.svg",
	"atleticomalaguenob": "/badges/atleticomalaguenob.svg",
	"MLB": "/badges/atleticomalaguenob.svg",
	"esteponajuvenil": "/badges/esteponajuvenil.svg",
	"EST": "/badges/cabestepona.svg",
	"marbellajuvenil": "/badges/marbellajuvenil.svg",
	"velez": "/badges/velez.svg",
	"VEL": "/badges/velezfemenino.svg",
	"palojuvenil": "/badges/palojuvenil.svg",
	"PAL": "/badges/palo.svg",
	"huercaljuvenil": "/badges/huercaljuvenil.svg",
	"HUE": "/badges/estudianteshuercalalmeria.svg",
	"alhaurintorre": "/badges/alhaurintorre.svg",
	"ADT": "/badges/alhaurintorre.svg",
	"fuengirolajuvenil": "/badges/fuengirolajuvenil.svg",
	"FUE": "/badges/fuengirolajuvenil.svg",
	"torremolinosjuvenil": "/badges/torremolinosjuvenil.svg",
	"TOR": "/badges/atleticotorcal.svg",
	"jaenfemenino": "/badges/jaenfemenino.svg",
	"JAE": "/badges/jaenjuvenil.svg",
	"ubedaviva": "/badges/ubedaviva.svg",
	"UBV": "/badges/ubedaviva.svg",
	"atleticojiennense": "/badges/atleticojiennense.svg",
	"AJN": "/badges/atleticojiennense.svg",
	"mvrgi": "/badges/mvrgi.svg",
	"MVR": "/badges/mvrgi.svg",
	"udcpavia": "/badges/udcpavia.svg",
	"PAV": "/badges/udcpavia.svg",
	"ejidofemenino": "/badges/ejidofemenino.svg",
	"EJI": "/badges/ejido.svg",
	"velezfemenino": "/badges/velezfemenino.svg",
	"bosonitunibasket": "/badges/bosonitunibasket.svg",
	"UNI": "/badges/bosonitunibasket.svg",
	"mcrlimahortabarcelona": "/badges/mcrlimahortabarcelona.svg",
	"LHB": "/badges/mcrlimahortabarcelona.svg",
	"recoletaszamora": "/badges/recoletaszamora.svg",
	"ZAM": "/badges/recoletaszamora.svg",
	"cajasolbaloncestosevilla": "/badges/cajasolbaloncestosevilla.svg",
	"SEV": "/badges/cajasolbaloncestosevilla.svg",
	"valenciabasket": "/badges/valenciabasket.svg",
	"VBC": "/badges/valenciabasket.svg",
	"sparkingtruthmaristas": "/badges/sparkingtruthmaristas.svg",
	"MAR": "/badges/sala5martorell.svg",
	"osesconstruccion": "/badges/osesconstruccion.svg",
	"OSE": "/badges/osesconstruccion.svg",
	"fustecmanbfcastello": "/badges/fustecmanbfcastello.svg",
	"CAS": "/badges/castro.svg",
	"alterenersunalqazeresextrema": "/badges/alterenersunalqazeresextrema.svg",
	"AQZ": "/badges/alterenersunalqazeresextrema.svg",
	"domusateknikisb": "/badges/domusateknikisb.svg",
	"ISB": "/badges/domusateknikisb.svg",
	"spargrancanaria": "/badges/spargrancanaria.svg",
	"GCA": "/badges/grancanaria.svg",
	"lagunatoyotaadareva": "/badges/lagunatoyotaadareva.svg",
	"ADA": "/badges/lagunatoyotaadareva.svg",
	"mipelletymasbfleon": "/badges/mipelletymasbfleon.svg",
	"LEO": "/badges/mipelletymasbfleon.svg",
	"joventutbadalona": "/badges/joventutbadalona.svg",
	"JOV": "/badges/joventutbadalona.svg",
	"hispaniaagustinos": "/badges/hispaniaagustinos.svg",
	"AGU": "/badges/hispaniaagustinos.svg",
	"salliverfuengirola": "/badges/salliverfuengirola.svg",
	"SAL": "/badges/salesianospuertollano.svg",
	"ebgmalaga": "/badges/ebgmalaga.svg",
	"EBG": "/badges/ebgmalaga.svg",
	"jaen": "/badges/jaen.svg",
	"fundaciongranada": "/badges/fundaciongranada.svg",
	"GRA": "/badges/granadaporbaloncesto.svg",
	"cabestepona": "/badges/cabestepona.svg",
	"presentacion": "/badges/presentacion.svg",
	"PRE": "/badges/presentacion.svg",
	"palo": "/badges/palo.svg",
	"toyo": "/badges/toyo.svg",
	"TOY": "/badges/toyo.svg",
	"roquetasbc": "/badges/roquetasbc.svg",
	"ROQ": "/badges/roquetas.svg",
	"plantelgmasb": "/badges/plantelgmasb.svg",
	"GMA": "/badges/pcboxgmasb.svg",
	"mojonera": "/badges/mojonera.svg",
	"MOJ": "/badges/mojonera.svg",
	"destinovera": "/badges/destinovera.svg",
	"VER": "/badges/destinoveraciudadvera.svg",
	"cabatarfe": "/badges/cabatarfe.svg",
	"ATA": "/badges/cabatarfe.svg",
	"santafe": "/badges/santafe.svg",
	"SFE": "/badges/eigragruposantafe.svg",
	"estudianteshuercal": "/badges/estudianteshuercal.svg",
	"adra2012": "/badges/adra2012.svg",
	"ADR": "/badges/adra2012.svg",
	"pinkbearbaza": "/badges/pinkbearbaza.svg",
	"BAZ": "/badges/pinkbearbaza.svg",
	"pcboxgmasb": "/badges/pcboxgmasb.svg",
	"huelvaluz": "/badges/huelvaluz.svg",
	"cacerespatrimoniob": "/badges/cacerespatrimoniob.svg",
	"CAC": "/badges/cacerespatrimoniohumanidad.svg",
	"ciudadponferrada": "/badges/ciudadponferrada.svg",
	"PON": "/badges/clinicaponferradasdp.svg",
	"chantada": "/badges/chantada.svg",
	"CHA": "/badges/chantada.svg",
	"ublebrija": "/badges/ublebrija.svg",
	"LEB": "/badges/ublebrija.svg",
	"martos": "/badges/martos.svg",
	"jajerez": "/badges/jajerez.svg",
	"JER": "/badges/jerez.svg",
	"zubia": "/badges/zubia.svg",
	"ZUB": "/badges/zubia.svg",
	"udeaalgeciras": "/badges/udeaalgeciras.svg",
	"UDE": "/badges/udeaalgeciras.svg",
	"benahavis": "/badges/benahavis.svg",
	"BEN": "/badges/playasbenidorm.svg",
	"novaschool": "/badges/novaschool.svg",
	"NOV": "/badges/novaschool.svg",
	"uemcbaloncestovalladolid": "/badges/uemcbaloncestovalladolid.svg",
	"VLL": "/badges/uemcbaloncestovalladolid.svg",
	"clinicaponferradasdp": "/badges/clinicaponferradasdp.svg",
	"culturalydeportivaleonesa": "/badges/culturalydeportivaleonesa.svg",
	"CUL": "/badges/culturalydeportivaleonesa.svg",
	"trescantos": "/badges/trescantos.svg",
	"TCS": "/badges/trescantos.svg",
	"starlabsmoron": "/badges/starlabsmoron.svg",
	"MOR": "/badges/starlabsmoron.svg",
	"spanishbasketballacademy": "/badges/spanishbasketballacademy.svg",
	"SBA": "/badges/spanishbasketballacademy.svg",
	"baloncestotoledobasket": "/badges/baloncestotoledobasket.svg",
	"TOL": "/badges/baloncestotoledobasket.svg",
	"getafe": "/badges/getafe.svg",
	"GET": "/badges/getafe.svg",
	"bcbadajoz": "/badges/bcbadajoz.svg",
	"BDJ": "/badges/bcbadajoz.svg",
	"cacerespatrimoniohumanidad": "/badges/cacerespatrimoniohumanidad.svg",
	"algeciras": "/badges/algeciras.svg",
	"ALG": "/badges/algeciras.svg",
	"jaenparaisointerior": "/badges/jaenparaisointerior.svg",
	"ourensebaloncesto": "/badges/ourensebaloncesto.svg",
	"COB": "/badges/ourensebaloncesto.svg",
	"rioduerosoria": "/badges/rioduerosoria.svg",
	"RDS": "/badges/rioduerosoria.svg",
	"unicajacostaalmeria": "/badges/unicajacostaalmeria.svg",
	"UAL": "/badges/unicajacostaalmeria.svg",
	"teruel": "/badges/teruel.svg",
	"TER": "/badges/teruel.svg",
	"conqueridorvalencia": "/badges/conqueridorvalencia.svg",
	"manacor": "/badges/manacor.svg",
	"MAN": "/badges/manacor.svg",
	"cisneroslaguna": "/badges/cisneroslaguna.svg",
	"CIS": "/badges/cisneroslaguna.svg",
	"playasbenidorm": "/badges/playasbenidorm.svg",
	"sansadurnino": "/badges/sansadurnino.svg",
	"SAD": "/badges/sansadurnino.svg",
	"leganes": "/badges/leganes.svg",
	"LEG": "/badges/cdeleganes.svg",
	"suaccanarias": "/badges/suaccanarias.svg",
	"SUA": "/badges/suaccanarias.svg",
	"avarcamenorca": "/badges/avarcamenorca.svg",
	"AVA": "/badges/avarcamenorca.svg",
	"heidelbergvolkswagen": "/badges/heidelbergvolkswagen.svg",
	"HEI": "/badges/heidelbergvolkswagen.svg",
	"cavesquimo": "/badges/cavesquimo.svg",
	"ESQ": "/badges/cavesquimo.svg",
	"grancanaria": "/badges/grancanaria.svg",
	"santcugat": "/badges/santcugat.svg",
	"SCU": "/badges/santcugat.svg",
	"haroriojavoley": "/badges/haroriojavoley.svg",
	"HAR": "/badges/haroriojavoley.svg",
	"laguna": "/badges/laguna.svg",
	"LAG": "/badges/laguna.svg",
	"sayremayser": "/badges/sayremayser.svg",
	"SAY": "/badges/sayremayser.svg",
	"emevelugo": "/badges/emevelugo.svg",
	"EME": "/badges/emevelugo.svg",
	"kielesocuellamos": "/badges/kielesocuellamos.svg",
	"KIE": "/badges/kielesocuellamos.svg",
	"alcobendas": "/badges/alcobendas.svg",
	"ALC": "/badges/alchoyano.svg",
	"canterasuralmeria": "/badges/canterasuralmeria.svg",
	"CSA": "/badges/canterasuralmeria.svg",
	"bolanos": "/badges/bolanos.svg",
	"BOL": "/badges/bolanos.svg",
	"helvetiamontequinto": "/badges/helvetiamontequinto.svg",
	"MON": "/badges/helvetiamontequinto.svg",
	"roquetas": "/badges/roquetas.svg",
	"maracena": "/badges/maracena.svg",
	"ciudadgranada": "/badges/ciudadgranada.svg",
	"almunecar": "/badges/almunecar.svg",
	"ALM": "/badges/almagro.svg",
	"antequera": "/badges/antequera.svg",
	"ANT": "/badges/antequera.svg",
	"estudiantesceuta": "/badges/estudiantesceuta.svg",
	"malagacostasolb": "/badges/malagacostasolb.svg",
	"MLG": "/badges/malagajuvenil.svg",
	"rinconfertilidadmalagab": "/badges/rinconfertilidadmalagab.svg",
	"jerez": "/badges/jerez.svg",
	"huelva": "/badges/huelva.svg",
	"burela": "/badges/burela.svg",
	"BUR": "/badges/burelajuvenil.svg",
	"futsiatletico": "/badges/futsiatletico.svg",
	"FUT": "/badges/futsiatletico.svg",
	"ourenseenvialia": "/badges/ourenseenvialia.svg",
	"OUR": "/badges/ourenseenvialia.svg",
	"aepenyaesplugues": "/badges/aepenyaesplugues.svg",
	"ESP": "/badges/aepenyaesplugues.svg",
	"castro": "/badges/castro.svg",
	"roldan": "/badges/roldan.svg",
	"ROL": "/badges/roldan.svg",
	"atleticotorcal": "/badges/atleticotorcal.svg",
	"alcantarilla": "/badges/alcantarilla.svg",
	"adalcorcon": "/badges/adalcorcon.svg",
	"ALC2": "/badges/adalcorcon.svg",
	"guadalcacin": "/badges/guadalcacin.svg",
	"GUA": "/badges/guadalcacin.svg",
	"poio": "/badges/poio.svg",
	"POI": "/badges/poio.svg",
	"salazaragoza": "/badges/salazaragoza.svg",
	"ZGZ": "/badges/salazaragoza.svg",
	"univalicante": "/badges/univalicante.svg",
	"ALI": "/badges/univalicante.svg",
	"majadahonda": "/badges/majadahonda.svg",
	"MAJ": "/badges/majadahondafsfafar4.svg",
	"majadahondafsfafar4": "/badges/majadahondafsfafar4.svg",
	"ramonycajalfeminas": "/badges/ramonycajalfeminas.svg",
	"RYC": "/badges/ramonycajalfeminas.svg",
	"garrovilla": "/badges/garrovilla.svg",
	"GAR": "/badges/garrovilla.svg",
	"almagro": "/badges/almagro.svg",
	"udafafanion": "/badges/udafafanion.svg",
	"AFA": "/badges/udafafanion.svg",
	"iesluiscamoens": "/badges/iesluiscamoens.svg",
	"CAM": "/badges/iesluiscamoens.svg",
	"cdeleganes": "/badges/cdeleganes.svg",
	"cfsfemeninosanfernando": "/badges/cfsfemeninosanfernando.svg",
	"fundacionuapogranada": "/badges/fundacionuapogranada.svg",
	"salesianospuertollano": "/badges/salesianospuertollano.svg",
	"doshermanas": "/badges/doshermanas.svg",
	"DSH": "/badges/doshermanas.svg",
	"globalcajaalbacete": "/badges/globalcajaalbacete.svg",
	"ALB": "/badges/globalcajaalbacete.svg",
	"arrivaadalcorcon": "/badges/arrivaadalcorcon.svg",
	"atleticonavalcarnero": "/badges/atleticonavalcarnero.svg",
	"NAV": "/badges/atleticonavalcarnero.svg",
	"martosjaenparaisointerior": "/badges/martosjaenparaisointerior.svg",
	"cfspinatar": "/badges/cfspinatar.svg",
	"PIN": "/badges/zambupinatarb.svg",
	"aliancamataro": "/badges/aliancamataro.svg",
	"MAT": "/badges/aliancamataro.svg",
	"colocolozaragoza": "/badges/colocolozaragoza.svg",
	"CCZ": "/badges/colocolozaragoza.svg",
	"sala5martorell": "/badges/sala5martorell.svg",
	"avanzajaen": "/badges/avanzajaen.svg",
	"ibiza": "/badges/ibiza.svg",
	"IBI": "/badges/ibiza.svg",
	"ejido": "/badges/ejido.svg",
	"tafa": "/badges/tafa.svg",
	"TAF": "/badges/tafa.svg",
	"riosrenovables": "/badges/riosrenovables.svg",
	"RIO": "/badges/riosrenovables.svg",
	"noiaportusapostoli": "/badges/noiaportusapostoli.svg",
	"NOI": "/badges/noiaportusapostoli.svg",
	"burelab": "/badges/burelab.svg",
	"oparruloferrol": "/badges/oparruloferrol.svg",
	"PAR": "/badges/oparruloferrol.svg",
	"xerez": "/badges/xerez.svg",
	"XER": "/badges/xereztoyota.svg",
	"cordobapatrimonio": "/badges/cordobapatrimonio.svg",
	"COR": "/badges/cordobajuvenil.svg",
	"elpozomurciab": "/badges/elpozomurciab.svg",
	"EPO": "/badges/elpozomurciajuvenil.svg",
	"blanca": "/badges/blanca.svg",
	"BLA": "/badges/blanca.svg",
	"cfsjumilla": "/badges/cfsjumilla.svg",
	"JUM": "/badges/cfsjumilla.svg",
	"bujalance": "/badges/bujalance.svg",
	"BUJ": "/badges/bujalance.svg",
	"xereztoyota": "/badges/xereztoyota.svg",
	"cordobapatrimoniob": "/badges/cordobapatrimoniob.svg",
	"virgilicadiz": "/badges/virgilicadiz.svg",
	"CAD": "/badges/cdabahiacadiz.svg",
	"oleoinnovamengibar": "/badges/oleoinnovamengibar.svg",
	"MEN": "/badges/oleoinnovamengibar.svg",
	"malacitanofutsal": "/badges/malacitanofutsal.svg",
	"MAL": "/badges/malacitanofutsal.svg",
	"simagranada": "/badges/simagranada.svg",
	"SIM": "/badges/simagranada.svg",
	"malagaciudadredondab": "/badges/malagaciudadredondab.svg",
	"MCR": "/badges/malagaciudadredondab.svg",
	"alchoyano": "/badges/alchoyano.svg",
	"Alchoyano": "/badges/alchoyano.svg",
	"imperiorosales": "/badges/imperiorosales.svg",
	"IMP": "/badges/imperiorosales.svg",
	"zambupinatarb": "/badges/zambupinatarb.svg",
	"universidadmalagab": "/badges/universidadmalagab.svg",
	"UMA": "/badges/universidadmalagab.svg",
	"elpozomurciajuvenil": "/badges/elpozomurciajuvenil.svg",
	"cartagenajuvenil": "/badges/cartagenajuvenil.svg",
	"CAR": "/badges/cartagenajuvenil.svg",
	"intermovistarjuvenil": "/badges/intermovistarjuvenil.svg",
	"INT": "/badges/intermovistarjuvenil.svg",
	"barcajuvenil": "/badges/barcajuvenil.svg",
	"FCB": "/badges/barcajuvenil.svg",
	"jaenjuvenil": "/badges/jaenjuvenil.svg",
	"cordobajuvenil": "/badges/cordobajuvenil.svg",
	"malagajuvenil": "/badges/malagajuvenil.svg",
	"alhamajuvenil": "/badges/alhamajuvenil.svg",
	"burelajuvenil": "/badges/burelajuvenil.svg",
	"valdepenasjuvenil": "/badges/valdepenasjuvenil.svg",
	"VAL": "/badges/valdepenasjuvenil.svg",
	"opticlassraicesmostoles": "/badges/opticlassraicesmostoles.svg",
	"cdabahiacadiz": "/badges/cdabahiacadiz.svg",
	"coviranchurriana": "/badges/coviranchurriana.svg",
	"CHU": "/badges/coviranchurriana.svg",
	"bsrfortunamurcia": "/badges/bsrfortunamurcia.svg",
	"FOR": "/badges/bsrfortunamurcia.svg",
	"gimnasticomelilla": "/badges/gimnasticomelilla.svg",
	"GIM": "/badges/gimnasticomelilla.svg",
	"destinoveraciudadvera": "/badges/destinoveraciudadvera.svg",
	"granadaporbaloncesto": "/badges/granadaporbaloncesto.svg",
	"eigragruposantafe": "/badges/eigragruposantafe.svg",
	"estudianteshuercalalmeria": "/badges/estudianteshuercalalmeria.svg"
};
var BY_NAME = {
	"udmelilla": "/badges/ud-melilla.png",
	"melillabaloncesto": "/badges/melilla-baloncesto.png",
	"melillaciudaddeporte": "/badges/melilla-baloncesto.png",
	"melillaciudaddeldeporte": "/badges/melilla-baloncesto.png",
	"clubmelillabaloncesto": "/badges/melilla-baloncesto.png",
	"sallefem": "/badges/la-salle-tw.png",
	"salleb": "/badges/la-salle-tw.png",
	"sallemelilla": "/badges/la-salle-tw.png",
	"lasallemelilla": "/badges/la-salle-tw.png",
	"lasalleb": "/badges/la-salle-tw.png",
	"mcdsalle": "/badges/la-salle-tw.png",
	"mcdlasalle": "/badges/la-salle-tw.png",
	"melillaciudaddeportesalle": "/badges/la-salle-tw.png",
	"melillaciudaddeldeportelasalle": "/badges/la-salle-tw.png",
	"melillam": "/badges/cv-melilla-tw.png",
	"melillaf": "/badges/cv-melilla-tw.png",
	"cvmelilla": "/badges/cv-melilla-tw.png",
	"voleibolmelilla": "/badges/cv-melilla-tw.png",
	"clubvoleibolmelilla": "/badges/cv-melilla-tw.png",
	"melillacity": "/badges/city-tw.png",
	"melillacitycf": "/badges/city-tw.png",
	"melistar": "/badges/melistar-tw.png",
	"melistarfs": "/badges/melistar-tw.png",
	"cdmelistar": "/badges/melistar-tw.png",
	"huetorvega": "/badges/huetor-tw.png",
	"cdhuetorvega": "/badges/huetor-tw.png",
	"almeria": "/badges/almeria-tw.png",
	"udalmeria": "/badges/almeria-tw.png",
	"almeriab": "/badges/almeria-tw.png",
	"udalmeriab": "/badges/almeria-tw.png",
	"almeriabjuvenil": "/badges/almeria-tw.png",
	"almeriafemenino": "/badges/almeria-tw.png",
	"motril": "/badges/motril-tw.png",
	"cfmotril": "/badges/motril-tw.png",
	"motriljuvenil": "/badges/motril-tw.png",
	"motrilfemenino": "/badges/motril-tw.png",
	"sevilla": "/badges/sevilla.png",
	"sevillafc": "/badges/sevilla.png",
	"betis": "/badges/betis.png",
	"realbetis": "/badges/betis.png",
	"malaga": "/badges/malaga.png",
	"malagacf": "/badges/malaga.png",
	"atleticomalagueno": "/badges/malaga.png",
	"malagac": "/badges/malaga.png",
	"malagafemeninob": "/badges/malaga.png",
	"malagab": "/badges/malaga.png",
	"malagacfb": "/badges/malaga.png",
	"granada": "/badges/granada.png",
	"granadacf": "/badges/granada.png",
	"recreativogranada": "/badges/granada.png",
	"granadac": "/badges/granada.png",
	"granadacfemenino": "/badges/granada.png",
	"cadiz": "/badges/cadiz.png",
	"cadizcf": "/badges/cadiz.png",
	"cordoba": "/badges/cordoba.png",
	"cordobacf": "/badges/cordoba.png",
	"arenasarmilla": "/badges/arenas-armilla.png",
	"arenasdearmilla": "/badges/arenas-armilla.png",
	"atleticomancha": "/badges/mancha-real.png",
	"atleticomanchareal": "/badges/mancha-real.png",
	"churrianavega": "/badges/churriana.png",
	"churrianadelavega": "/badges/churriana.png",
	"ciudadtorredonjimeno": "/badges/torredonjimeno.png",
	"ciudaddetorredonjimeno": "/badges/torredonjimeno.png",
	"unicaja": "/badges/unicaja.png",
	"unicajamijas": "/badges/unicaja.png",
	"unicajasd": "/badges/unicaja.png",
	"baloncestomalaga": "/badges/unicaja.png",
	"estudiantes": "/badges/estudiantes.png",
	"movistarestudiantes": "/badges/estudiantes.png",
	"guaguas": "/badges/guaguas.png",
	"cvguaguas": "/badges/guaguas.png",
	"conil": "/badges/conil-tw.png",
	"conilcf": "/badges/conil-tw.png",
	"con": "/badges/conqueridorvalencia.svg",
	"marbelli": "/badges/marbelli-tw.png",
	"fcmarbelli": "/badges/marbelli-tw.png",
	"mrb": "/badges/marbellajuvenil.svg",
	"sanpedro": "/badges/san-pedro-tw.png",
	"udsanpedro": "/badges/san-pedro-tw.png",
	"sanpedrojuvenil": "/badges/san-pedro-tw.png",
	"udsanpedrojuvenil": "/badges/san-pedro-tw.png",
	"spe": "/badges/san-pedro-tw.png",
	"calavera": "/badges/calavera-tw.png",
	"calaveracf": "/badges/calavera-tw.png",
	"cal": "/badges/calavera-tw.png",
	"mosquito": "/badges/mosquito-tw.png",
	"cdmosquito": "/badges/mosquito-tw.png",
	"mos": "/badges/opticlassraicesmostoles.svg",
	"sanfelix": "/badges/san-felix-tw.png",
	"sanfelixcd": "/badges/san-felix-tw.png",
	"sfx": "/badges/san-felix-tw.png",
	"atleticoceuta": "/badges/ceuta-juv-tw.png",
	"sportingatleticoceuta": "/badges/ceuta-juv-tw.png",
	"atletico": "/badges/ceuta-juv-tw.png",
	"sportingatletico": "/badges/ceuta-juv-tw.png",
	"ceu": "/badges/estudiantesceuta.svg",
	"atleticozabal": "/badges/zabal-tw.png",
	"zab": "/badges/zabal-tw.png",
	"atleticomelilladh": "/badges/atletico-melilla-dh.svg",
	"atmj": "/badges/atletico-melilla-dh.svg",
	"atleticomelilla": "/badges/atletico-melilla-dh.svg",
	"atmmelilla": "/badges/atm-melilla.svg",
	"atm": "/badges/atm-melilla.svg",
	"enriquesoler": "/badges/enrique-soler.svg",
	"soler": "/badges/enrique-soler.svg",
	"maritimo": "/badges/maritimo.svg",
	"rcmm": "/badges/maritimo.svg",
	"rcmaritimomelilla": "/badges/maritimo.svg",
	"virgenvictoria": "/badges/virgen-victoria.svg",
	"vdv": "/badges/virgen-victoria.svg",
	"virgendelavictoria": "/badges/virgen-victoria.svg",
	"tmaravillas": "/badges/t-maravillas.svg",
	"tma": "/badges/t-maravillas.svg",
	"torreblanca": "/badges/torreblanca.svg",
	"tbn": "/badges/torreblanca.svg",
	"torreblancab": "/badges/torreblanca-b.svg",
	"tbnb": "/badges/torreblanca-b.svg",
	"nuevaera": "/badges/nueva-era.svg",
	"nera": "/badges/nueva-era.svg",
	"nuevaeramelilla": "/badges/nueva-era.svg",
	"rusadirdh": "/badges/rusadir-fs-dh.svg",
	"rus": "/badges/rusadir-fs-dh.svg",
	"rusadirjuvenil": "/badges/rusadir-fs-dh.svg",
	"rusadircfjuvenil": "/badges/rusadir-fs-dh.svg",
	"penarm": "/badges/pena-rm-fs.svg",
	"prm": "/badges/pena-rm-fs.svg",
	"penamadrid": "/badges/pena-rm-fs.svg",
	"penarealmadrid": "/badges/pena-rm-fs.svg",
	"melillabsr": "/badges/melilla-bsr.svg",
	"mbsr": "/badges/melilla-bsr.svg",
	"melillabaloncestobsr": "/badges/melilla-bsr.svg",
	"torremar": "/badges/torremar.svg",
	"udtorredelmar": "/badges/torremar.svg",
	"tdm": "/badges/torremar.svg",
	"malagajuniors": "/badges/malagajuniors.svg",
	"mjf": "/badges/malagajuniors.svg",
	"alhaurino": "/badges/alhaurino.svg",
	"cdalhaurino": "/badges/alhaurino.svg",
	"alh": "/badges/alhamajuvenil.svg",
	"atleticoporcuna": "/badges/atleticoporcuna.svg",
	"por": "/badges/atleticoporcuna.svg",
	"atleticomarbella": "/badges/atleticomarbella.svg",
	"atleticodemarbella": "/badges/atleticomarbella.svg",
	"amb": "/badges/atleticomarbella.svg",
	"cantoria2017": "/badges/cantoria2017.svg",
	"can": "/badges/cantoria2017.svg",
	"linaresdeportivo": "/badges/linaresdeportivo.svg",
	"lin": "/badges/linaresdeportivo.svg",
	"tomares": "/badges/tomares.svg",
	"tomaresud": "/badges/tomares.svg",
	"tom": "/badges/tomares.svg",
	"utrera": "/badges/utrera.svg",
	"udutrera": "/badges/utrera.svg",
	"utr": "/badges/utrera.svg",
	"rincon": "/badges/rincon.svg",
	"cdrincon": "/badges/rincon.svg",
	"rin": "/badges/rinconfertilidadmalagab.svg",
	"atleticomalaguenob": "/badges/atleticomalaguenob.svg",
	"mlb": "/badges/atleticomalaguenob.svg",
	"esteponajuvenil": "/badges/esteponajuvenil.svg",
	"est": "/badges/cabestepona.svg",
	"marbellajuvenil": "/badges/marbellajuvenil.svg",
	"velez": "/badges/velez.svg",
	"velezcf": "/badges/velez.svg",
	"vel": "/badges/velezfemenino.svg",
	"palojuvenil": "/badges/palojuvenil.svg",
	"elpalojuvenil": "/badges/palojuvenil.svg",
	"pal": "/badges/palo.svg",
	"huercaljuvenil": "/badges/huercaljuvenil.svg",
	"hue": "/badges/estudianteshuercalalmeria.svg",
	"alhaurintorre": "/badges/alhaurintorre.svg",
	"alhaurindelatorre": "/badges/alhaurintorre.svg",
	"adt": "/badges/alhaurintorre.svg",
	"fuengirolajuvenil": "/badges/fuengirolajuvenil.svg",
	"fue": "/badges/fuengirolajuvenil.svg",
	"torremolinosjuvenil": "/badges/torremolinosjuvenil.svg",
	"tor": "/badges/atleticotorcal.svg",
	"jaenfemenino": "/badges/jaenfemenino.svg",
	"realjaenfemenino": "/badges/jaenfemenino.svg",
	"jae": "/badges/jaenjuvenil.svg",
	"ubedaviva": "/badges/ubedaviva.svg",
	"ubv": "/badges/ubedaviva.svg",
	"atleticojiennense": "/badges/atleticojiennense.svg",
	"ajn": "/badges/atleticojiennense.svg",
	"mvrgi": "/badges/mvrgi.svg",
	"cfmvrgi": "/badges/mvrgi.svg",
	"mvr": "/badges/mvrgi.svg",
	"udcpavia": "/badges/udcpavia.svg",
	"pav": "/badges/udcpavia.svg",
	"ejidofemenino": "/badges/ejidofemenino.svg",
	"elejidofemenino": "/badges/ejidofemenino.svg",
	"eji": "/badges/ejido.svg",
	"velezfemenino": "/badges/velezfemenino.svg",
	"bosonitunibasket": "/badges/bosonitunibasket.svg",
	"uni": "/badges/bosonitunibasket.svg",
	"mcrlimahortabarcelona": "/badges/mcrlimahortabarcelona.svg",
	"lhb": "/badges/mcrlimahortabarcelona.svg",
	"recoletaszamora": "/badges/recoletaszamora.svg",
	"zam": "/badges/recoletaszamora.svg",
	"cajasolbaloncestosevilla": "/badges/cajasolbaloncestosevilla.svg",
	"sev": "/badges/cajasolbaloncestosevilla.svg",
	"valenciabasket": "/badges/valenciabasket.svg",
	"vbc": "/badges/valenciabasket.svg",
	"sparkingtruthmaristas": "/badges/sparkingtruthmaristas.svg",
	"mar": "/badges/sala5martorell.svg",
	"osesconstruccion": "/badges/osesconstruccion.svg",
	"ose": "/badges/osesconstruccion.svg",
	"fustecmanbfcastello": "/badges/fustecmanbfcastello.svg",
	"cas": "/badges/castro.svg",
	"alterenersunalqazeresextrema": "/badges/alterenersunalqazeresextrema.svg",
	"alterenersunalqazeresextremadura": "/badges/alterenersunalqazeresextrema.svg",
	"aqz": "/badges/alterenersunalqazeresextrema.svg",
	"domusateknikisb": "/badges/domusateknikisb.svg",
	"isb": "/badges/domusateknikisb.svg",
	"spargrancanaria": "/badges/spargrancanaria.svg",
	"gca": "/badges/grancanaria.svg",
	"lagunatoyotaadareva": "/badges/lagunatoyotaadareva.svg",
	"lalagunatoyotaadareva": "/badges/lagunatoyotaadareva.svg",
	"ada": "/badges/lagunatoyotaadareva.svg",
	"mipelletymasbfleon": "/badges/mipelletymasbfleon.svg",
	"leo": "/badges/mipelletymasbfleon.svg",
	"joventutbadalona": "/badges/joventutbadalona.svg",
	"clubjoventutbadalona": "/badges/joventutbadalona.svg",
	"jov": "/badges/joventutbadalona.svg",
	"hispaniaagustinos": "/badges/hispaniaagustinos.svg",
	"agu": "/badges/hispaniaagustinos.svg",
	"salliverfuengirola": "/badges/salliverfuengirola.svg",
	"cbsalliverfuengirola": "/badges/salliverfuengirola.svg",
	"sal": "/badges/salesianospuertollano.svg",
	"ebgmalaga": "/badges/ebgmalaga.svg",
	"ebg": "/badges/ebgmalaga.svg",
	"jaen": "/badges/jaen.svg",
	"jaencb": "/badges/jaen.svg",
	"fundaciongranada": "/badges/fundaciongranada.svg",
	"fundacioncbgranada": "/badges/fundaciongranada.svg",
	"gra": "/badges/granadaporbaloncesto.svg",
	"cabestepona": "/badges/cabestepona.svg",
	"presentacion": "/badges/presentacion.svg",
	"cdpresentacion": "/badges/presentacion.svg",
	"pre": "/badges/presentacion.svg",
	"palo": "/badges/palo.svg",
	"cbelpalo": "/badges/palo.svg",
	"toyo": "/badges/toyo.svg",
	"eltoyo": "/badges/toyo.svg",
	"toy": "/badges/toyo.svg",
	"roquetasbc": "/badges/roquetasbc.svg",
	"cdroquetasbc": "/badges/roquetasbc.svg",
	"roq": "/badges/roquetas.svg",
	"plantelgmasb": "/badges/plantelgmasb.svg",
	"elplantelgmasb": "/badges/plantelgmasb.svg",
	"gma": "/badges/pcboxgmasb.svg",
	"mojonera": "/badges/mojonera.svg",
	"cblamojonera": "/badges/mojonera.svg",
	"moj": "/badges/mojonera.svg",
	"destinovera": "/badges/destinovera.svg",
	"ver": "/badges/destinoveraciudadvera.svg",
	"cabatarfe": "/badges/cabatarfe.svg",
	"ata": "/badges/cabatarfe.svg",
	"santafe": "/badges/santafe.svg",
	"cbsantafe": "/badges/santafe.svg",
	"sfe": "/badges/eigragruposantafe.svg",
	"estudianteshuercal": "/badges/estudianteshuercal.svg",
	"adra2012": "/badges/adra2012.svg",
	"cdadra2012": "/badges/adra2012.svg",
	"adr": "/badges/adra2012.svg",
	"pinkbearbaza": "/badges/pinkbearbaza.svg",
	"baz": "/badges/pinkbearbaza.svg",
	"pcboxgmasb": "/badges/pcboxgmasb.svg",
	"huelvaluz": "/badges/huelvaluz.svg",
	"cbhuelvalaluz": "/badges/huelvaluz.svg",
	"cacerespatrimoniob": "/badges/cacerespatrimoniob.svg",
	"cac": "/badges/cacerespatrimoniohumanidad.svg",
	"ciudadponferrada": "/badges/ciudadponferrada.svg",
	"cbciudaddeponferrada": "/badges/ciudadponferrada.svg",
	"pon": "/badges/clinicaponferradasdp.svg",
	"chantada": "/badges/chantada.svg",
	"cbchantada": "/badges/chantada.svg",
	"cha": "/badges/chantada.svg",
	"ublebrija": "/badges/ublebrija.svg",
	"leb": "/badges/ublebrija.svg",
	"martos": "/badges/martos.svg",
	"cbmartos": "/badges/martos.svg",
	"jajerez": "/badges/jajerez.svg",
	"jer": "/badges/jerez.svg",
	"zubia": "/badges/zubia.svg",
	"cblazubia": "/badges/zubia.svg",
	"zub": "/badges/zubia.svg",
	"udeaalgeciras": "/badges/udeaalgeciras.svg",
	"ude": "/badges/udeaalgeciras.svg",
	"benahavis": "/badges/benahavis.svg",
	"cbbenahavis": "/badges/benahavis.svg",
	"ben": "/badges/playasbenidorm.svg",
	"novaschool": "/badges/novaschool.svg",
	"cbnovaschool": "/badges/novaschool.svg",
	"nov": "/badges/novaschool.svg",
	"uemcbaloncestovalladolid": "/badges/uemcbaloncestovalladolid.svg",
	"vll": "/badges/uemcbaloncestovalladolid.svg",
	"clinicaponferradasdp": "/badges/clinicaponferradasdp.svg",
	"culturalydeportivaleonesa": "/badges/culturalydeportivaleonesa.svg",
	"cul": "/badges/culturalydeportivaleonesa.svg",
	"trescantos": "/badges/trescantos.svg",
	"cbtrescantos": "/badges/trescantos.svg",
	"tcs": "/badges/trescantos.svg",
	"starlabsmoron": "/badges/starlabsmoron.svg",
	"cbstarlabsmoron": "/badges/starlabsmoron.svg",
	"mor": "/badges/starlabsmoron.svg",
	"spanishbasketballacademy": "/badges/spanishbasketballacademy.svg",
	"sba": "/badges/spanishbasketballacademy.svg",
	"baloncestotoledobasket": "/badges/baloncestotoledobasket.svg",
	"clubbaloncestotoledobasket": "/badges/baloncestotoledobasket.svg",
	"tol": "/badges/baloncestotoledobasket.svg",
	"getafe": "/badges/getafe.svg",
	"cbgetafe": "/badges/getafe.svg",
	"get": "/badges/getafe.svg",
	"bcbadajoz": "/badges/bcbadajoz.svg",
	"bdj": "/badges/bcbadajoz.svg",
	"cacerespatrimoniohumanidad": "/badges/cacerespatrimoniohumanidad.svg",
	"cacerespatrimoniodelahumanidad": "/badges/cacerespatrimoniohumanidad.svg",
	"algeciras": "/badges/algeciras.svg",
	"cbalgeciras": "/badges/algeciras.svg",
	"alg": "/badges/algeciras.svg",
	"jaenparaisointerior": "/badges/jaenparaisointerior.svg",
	"jaenparaisointeriorfs": "/badges/jaenparaisointerior.svg",
	"ourensebaloncesto": "/badges/ourensebaloncesto.svg",
	"clubourensebaloncesto": "/badges/ourensebaloncesto.svg",
	"cob": "/badges/ourensebaloncesto.svg",
	"rioduerosoria": "/badges/rioduerosoria.svg",
	"rds": "/badges/rioduerosoria.svg",
	"unicajacostaalmeria": "/badges/unicajacostaalmeria.svg",
	"unicajacostadealmeria": "/badges/unicajacostaalmeria.svg",
	"ual": "/badges/unicajacostaalmeria.svg",
	"teruel": "/badges/teruel.svg",
	"cvteruel": "/badges/teruel.svg",
	"ter": "/badges/teruel.svg",
	"conqueridorvalencia": "/badges/conqueridorvalencia.svg",
	"manacor": "/badges/manacor.svg",
	"cvmanacor": "/badges/manacor.svg",
	"man": "/badges/manacor.svg",
	"cisneroslaguna": "/badges/cisneroslaguna.svg",
	"cisneroslalaguna": "/badges/cisneroslaguna.svg",
	"cis": "/badges/cisneroslaguna.svg",
	"playasbenidorm": "/badges/playasbenidorm.svg",
	"playasdebenidorm": "/badges/playasbenidorm.svg",
	"sansadurnino": "/badges/sansadurnino.svg",
	"sad": "/badges/sansadurnino.svg",
	"leganes": "/badges/leganes.svg",
	"cvleganes": "/badges/leganes.svg",
	"leg": "/badges/cdeleganes.svg",
	"suaccanarias": "/badges/suaccanarias.svg",
	"sua": "/badges/suaccanarias.svg",
	"avarcamenorca": "/badges/avarcamenorca.svg",
	"avarcademenorca": "/badges/avarcamenorca.svg",
	"ava": "/badges/avarcamenorca.svg",
	"heidelbergvolkswagen": "/badges/heidelbergvolkswagen.svg",
	"hei": "/badges/heidelbergvolkswagen.svg",
	"cavesquimo": "/badges/cavesquimo.svg",
	"esq": "/badges/cavesquimo.svg",
	"grancanaria": "/badges/grancanaria.svg",
	"cvgrancanaria": "/badges/grancanaria.svg",
	"santcugat": "/badges/santcugat.svg",
	"scu": "/badges/santcugat.svg",
	"haroriojavoley": "/badges/haroriojavoley.svg",
	"har": "/badges/haroriojavoley.svg",
	"laguna": "/badges/laguna.svg",
	"cvlalaguna": "/badges/laguna.svg",
	"lag": "/badges/laguna.svg",
	"sayremayser": "/badges/sayremayser.svg",
	"say": "/badges/sayremayser.svg",
	"emevelugo": "/badges/emevelugo.svg",
	"eme": "/badges/emevelugo.svg",
	"kielesocuellamos": "/badges/kielesocuellamos.svg",
	"kie": "/badges/kielesocuellamos.svg",
	"alcobendas": "/badges/alcobendas.svg",
	"cvalcobendas": "/badges/alcobendas.svg",
	"alc": "/badges/alchoyano.svg",
	"canterasuralmeria": "/badges/canterasuralmeria.svg",
	"csa": "/badges/canterasuralmeria.svg",
	"bolanos": "/badges/bolanos.svg",
	"bmbolanos": "/badges/bolanos.svg",
	"bol": "/badges/bolanos.svg",
	"helvetiamontequinto": "/badges/helvetiamontequinto.svg",
	"mon": "/badges/helvetiamontequinto.svg",
	"roquetas": "/badges/roquetas.svg",
	"bmroquetas": "/badges/roquetas.svg",
	"maracena": "/badges/maracena.svg",
	"bmmaracena": "/badges/maracena.svg",
	"ciudadgranada": "/badges/ciudadgranada.svg",
	"bmciudaddegranada": "/badges/ciudadgranada.svg",
	"almunecar": "/badges/almunecar.svg",
	"bmalmunecar": "/badges/almunecar.svg",
	"alm": "/badges/almagro.svg",
	"antequera": "/badges/antequera.svg",
	"bmantequera": "/badges/antequera.svg",
	"ant": "/badges/antequera.svg",
	"estudiantesceuta": "/badges/estudiantesceuta.svg",
	"malagacostasolb": "/badges/malagacostasolb.svg",
	"bmmalagacostadelsolb": "/badges/malagacostasolb.svg",
	"mlg": "/badges/malagajuvenil.svg",
	"rinconfertilidadmalagab": "/badges/rinconfertilidadmalagab.svg",
	"jerez": "/badges/jerez.svg",
	"bmjerez": "/badges/jerez.svg",
	"huelva": "/badges/huelva.svg",
	"bmhuelva": "/badges/huelva.svg",
	"burela": "/badges/burela.svg",
	"burelafs": "/badges/burela.svg",
	"bur": "/badges/burelajuvenil.svg",
	"futsiatletico": "/badges/futsiatletico.svg",
	"fut": "/badges/futsiatletico.svg",
	"ourenseenvialia": "/badges/ourenseenvialia.svg",
	"our": "/badges/ourenseenvialia.svg",
	"aepenyaesplugues": "/badges/aepenyaesplugues.svg",
	"esp": "/badges/aepenyaesplugues.svg",
	"castro": "/badges/castro.svg",
	"fsfcastro": "/badges/castro.svg",
	"roldan": "/badges/roldan.svg",
	"roldanfsf": "/badges/roldan.svg",
	"rol": "/badges/roldan.svg",
	"atleticotorcal": "/badges/atleticotorcal.svg",
	"alcantarilla": "/badges/alcantarilla.svg",
	"alcantarillafs": "/badges/alcantarilla.svg",
	"adalcorcon": "/badges/adalcorcon.svg",
	"alc2": "/badges/adalcorcon.svg",
	"guadalcacin": "/badges/guadalcacin.svg",
	"guadalcacinfs": "/badges/guadalcacin.svg",
	"gua": "/badges/guadalcacin.svg",
	"poio": "/badges/poio.svg",
	"poiofs": "/badges/poio.svg",
	"poi": "/badges/poio.svg",
	"salazaragoza": "/badges/salazaragoza.svg",
	"zgz": "/badges/salazaragoza.svg",
	"univalicante": "/badges/univalicante.svg",
	"ali": "/badges/univalicante.svg",
	"majadahonda": "/badges/majadahonda.svg",
	"majadahondafsf": "/badges/majadahonda.svg",
	"maj": "/badges/majadahondafsfafar4.svg",
	"majadahondafsfafar4": "/badges/majadahondafsfafar4.svg",
	"ramonycajalfeminas": "/badges/ramonycajalfeminas.svg",
	"ryc": "/badges/ramonycajalfeminas.svg",
	"garrovilla": "/badges/garrovilla.svg",
	"sportingclubgarrovilla": "/badges/garrovilla.svg",
	"gar": "/badges/garrovilla.svg",
	"almagro": "/badges/almagro.svg",
	"almagrofsf": "/badges/almagro.svg",
	"udafafanion": "/badges/udafafanion.svg",
	"afa": "/badges/udafafanion.svg",
	"iesluiscamoens": "/badges/iesluiscamoens.svg",
	"iesluisdecamoens": "/badges/iesluiscamoens.svg",
	"cam": "/badges/iesluiscamoens.svg",
	"cdeleganes": "/badges/cdeleganes.svg",
	"cdeleganesfs": "/badges/cdeleganes.svg",
	"cfsfemeninosanfernando": "/badges/cfsfemeninosanfernando.svg",
	"fundacionuapogranada": "/badges/fundacionuapogranada.svg",
	"fundacionuapogranadafs": "/badges/fundacionuapogranada.svg",
	"salesianospuertollano": "/badges/salesianospuertollano.svg",
	"cdsalesianospuertollano": "/badges/salesianospuertollano.svg",
	"doshermanas": "/badges/doshermanas.svg",
	"doshermanasfs": "/badges/doshermanas.svg",
	"dsh": "/badges/doshermanas.svg",
	"globalcajaalbacete": "/badges/globalcajaalbacete.svg",
	"globalcajaalbacetefs": "/badges/globalcajaalbacete.svg",
	"alb": "/badges/globalcajaalbacete.svg",
	"arrivaadalcorcon": "/badges/arrivaadalcorcon.svg",
	"arrivaadalcorconfsf": "/badges/arrivaadalcorcon.svg",
	"atleticonavalcarnero": "/badges/atleticonavalcarnero.svg",
	"nav": "/badges/atleticonavalcarnero.svg",
	"martosjaenparaisointerior": "/badges/martosjaenparaisointerior.svg",
	"martosfsjaenparaisointerior": "/badges/martosjaenparaisointerior.svg",
	"cfspinatar": "/badges/cfspinatar.svg",
	"pin": "/badges/zambupinatarb.svg",
	"aliancamataro": "/badges/aliancamataro.svg",
	"mat": "/badges/aliancamataro.svg",
	"colocolozaragoza": "/badges/colocolozaragoza.svg",
	"ccz": "/badges/colocolozaragoza.svg",
	"sala5martorell": "/badges/sala5martorell.svg",
	"avanzajaen": "/badges/avanzajaen.svg",
	"ibiza": "/badges/ibiza.svg",
	"udibizafs": "/badges/ibiza.svg",
	"ibi": "/badges/ibiza.svg",
	"ejido": "/badges/ejido.svg",
	"ejidofs": "/badges/ejido.svg",
	"tafa": "/badges/tafa.svg",
	"tafafs": "/badges/tafa.svg",
	"taf": "/badges/tafa.svg",
	"riosrenovables": "/badges/riosrenovables.svg",
	"rio": "/badges/riosrenovables.svg",
	"noiaportusapostoli": "/badges/noiaportusapostoli.svg",
	"noi": "/badges/noiaportusapostoli.svg",
	"burelab": "/badges/burelab.svg",
	"burelafsb": "/badges/burelab.svg",
	"oparruloferrol": "/badges/oparruloferrol.svg",
	"par": "/badges/oparruloferrol.svg",
	"xerez": "/badges/xerez.svg",
	"xerezfs": "/badges/xerez.svg",
	"xer": "/badges/xereztoyota.svg",
	"cordobapatrimonio": "/badges/cordobapatrimonio.svg",
	"cor": "/badges/cordobajuvenil.svg",
	"elpozomurciab": "/badges/elpozomurciab.svg",
	"epo": "/badges/elpozomurciajuvenil.svg",
	"blanca": "/badges/blanca.svg",
	"blancafs": "/badges/blanca.svg",
	"bla": "/badges/blanca.svg",
	"cfsjumilla": "/badges/cfsjumilla.svg",
	"jum": "/badges/cfsjumilla.svg",
	"bujalance": "/badges/bujalance.svg",
	"cdbujalance": "/badges/bujalance.svg",
	"buj": "/badges/bujalance.svg",
	"xereztoyota": "/badges/xereztoyota.svg",
	"cordobapatrimoniob": "/badges/cordobapatrimoniob.svg",
	"virgilicadiz": "/badges/virgilicadiz.svg",
	"cdvirgilicadiz": "/badges/virgilicadiz.svg",
	"cad": "/badges/cdabahiacadiz.svg",
	"oleoinnovamengibar": "/badges/oleoinnovamengibar.svg",
	"men": "/badges/oleoinnovamengibar.svg",
	"malacitanofutsal": "/badges/malacitanofutsal.svg",
	"mal": "/badges/malacitanofutsal.svg",
	"simagranada": "/badges/simagranada.svg",
	"sim": "/badges/simagranada.svg",
	"malagaciudadredondab": "/badges/malagaciudadredondab.svg",
	"mcr": "/badges/malagaciudadredondab.svg",
	"alchoyano": "/badges/alchoyano.svg",
	"imperiorosales": "/badges/imperiorosales.svg",
	"imperiolosrosales": "/badges/imperiorosales.svg",
	"imp": "/badges/imperiorosales.svg",
	"zambupinatarb": "/badges/zambupinatarb.svg",
	"universidadmalagab": "/badges/universidadmalagab.svg",
	"uma": "/badges/universidadmalagab.svg",
	"elpozomurciajuvenil": "/badges/elpozomurciajuvenil.svg",
	"cartagenajuvenil": "/badges/cartagenajuvenil.svg",
	"cartagenafsjuvenil": "/badges/cartagenajuvenil.svg",
	"car": "/badges/cartagenajuvenil.svg",
	"intermovistarjuvenil": "/badges/intermovistarjuvenil.svg",
	"int": "/badges/intermovistarjuvenil.svg",
	"barcajuvenil": "/badges/barcajuvenil.svg",
	"barcafsjuvenil": "/badges/barcajuvenil.svg",
	"fcb": "/badges/barcajuvenil.svg",
	"jaenjuvenil": "/badges/jaenjuvenil.svg",
	"jaenfsjuvenil": "/badges/jaenjuvenil.svg",
	"cordobajuvenil": "/badges/cordobajuvenil.svg",
	"cordobafsjuvenil": "/badges/cordobajuvenil.svg",
	"malagajuvenil": "/badges/malagajuvenil.svg",
	"malagafsjuvenil": "/badges/malagajuvenil.svg",
	"alhamajuvenil": "/badges/alhamajuvenil.svg",
	"alhamafsjuvenil": "/badges/alhamajuvenil.svg",
	"burelajuvenil": "/badges/burelajuvenil.svg",
	"valdepenasjuvenil": "/badges/valdepenasjuvenil.svg",
	"val": "/badges/valdepenasjuvenil.svg",
	"opticlassraicesmostoles": "/badges/opticlassraicesmostoles.svg",
	"cdabahiacadiz": "/badges/cdabahiacadiz.svg",
	"cdabahiadecadiz": "/badges/cdabahiacadiz.svg",
	"coviranchurriana": "/badges/coviranchurriana.svg",
	"chu": "/badges/coviranchurriana.svg",
	"bsrfortunamurcia": "/badges/bsrfortunamurcia.svg",
	"for": "/badges/bsrfortunamurcia.svg",
	"gimnasticomelilla": "/badges/gimnasticomelilla.svg",
	"gim": "/badges/gimnasticomelilla.svg",
	"destinoveraciudadvera": "/badges/destinoveraciudadvera.svg",
	"destinoveraciudaddevera": "/badges/destinoveraciudadvera.svg",
	"granadaporbaloncesto": "/badges/granadaporbaloncesto.svg",
	"cdgranadaporelbaloncesto": "/badges/granadaporbaloncesto.svg",
	"eigragruposantafe": "/badges/eigragruposantafe.svg",
	"eigragrupocbsantafe": "/badges/eigragruposantafe.svg",
	"estudianteshuercalalmeria": "/badges/estudianteshuercalalmeria.svg",
	"estudianteshuercaldealmeria": "/badges/estudianteshuercalalmeria.svg"
};
function normBadgeKey(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\b(ud|cd|cf|fc|bm|cv|cb|fs|fsf|club|de|del|la|el|las|los|real|sporting)\b/g, "").replace(/[^a-z0-9]+/g, "");
}
function badgeFor(id, name) {
	if (id && BY_ID[id]) return BY_ID[id];
	if (name) {
		const n = normBadgeKey(name);
		if (BY_NAME[n]) return BY_NAME[n];
		if (BY_ID[n]) return BY_ID[n];
	}
}
var PALETTE = [
	["#15233a", "#e8e6dc"],
	["#1c3d6e", "#f2f0ea"],
	["#8b1e1e", "#f0ebe3"],
	["#1a4a5c", "#e4d7b8"],
	["#16324f", "#d6d2c8"],
	["#3d2a28", "#e8e2d6"],
	["#2e3d32", "#e8e6dc"],
	["#1b3c6e", "#f0eee6"]
];
function paletteOf(seed) {
	let h = 0;
	for (let i = 0; i < seed.length; i++) h = h * 31 + seed.charCodeAt(i) >>> 0;
	return PALETTE[h % PALETTE.length];
}
function TeamBadge({ id, name, short, primary, secondary, size = 40, className }) {
	const src = badgeFor(id, name);
	if (src) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt: "",
		width: size,
		height: size,
		className: cn("shrink-0 rounded-md bg-surface-2 object-contain p-0.5", className)
	});
	const [p, s] = primary && secondary ? [primary, secondary] : paletteOf(name || short);
	const label = short.replace(/\s+/g, "").slice(0, 4).toUpperCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 48 48",
		width: size,
		height: size,
		className: cn("shrink-0", className),
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M24 3 L43 10 V24 C43 36 33 43 24 45 C15 43 5 36 5 24 V10 Z",
				fill: p
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M24 6 L40 12 V24 C40 34 32 41 24 43 C16 41 8 34 8 24 V12 Z",
				fill: "none",
				stroke: s,
				strokeOpacity: "0.45",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "24",
				cy: "14",
				r: "1.6",
				fill: s
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "24",
				y: "30",
				textAnchor: "middle",
				fill: s,
				fontFamily: "Georgia, serif",
				fontSize: label.length > 3 ? 8 : 10,
				fontWeight: "700",
				children: label
			})
		]
	});
}
function Crest({ team, size = 40, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamBadge, {
		id: team.id,
		name: team.name,
		short: team.short,
		primary: team.primary,
		secondary: team.secondary,
		size,
		className
	});
}
function OpponentMark({ short, name, size = 40, badgeUrl }) {
	if (badgeUrl) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: badgeUrl,
		alt: "",
		width: size,
		height: size,
		className: "shrink-0 rounded-md bg-surface-2 object-contain p-0.5"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamBadge, {
		name,
		short,
		size
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getLiveSnapshot = createServerFn({ method: "GET" }).handler(createSsrRpc("7ef13e79095abd923abbf3e201d16e7e368a20b9d90fc541064e956cfc3fb71c"));
var t = (name, short, id) => ({
	name,
	short,
	id
});
var leagues = [
	{
		id: "tercera-g9",
		name: "Tercera Federación · Grupo 9",
		shortName: "3ª RFEF Gr. 9",
		sport: "futbol",
		scoring: "football",
		teams: [
			t("UD Melilla", "UDM", "ud-melilla"),
			t("CD Huétor Vega", "HUV"),
			t("UD Torre del Mar", "TDM"),
			t("Málaga Juniors", "MJF"),
			t("Ciudad de Torredonjimeno", "TDJ"),
			t("CF Motril", "MOT"),
			t("Arenas de Armilla", "ARM"),
			t("FC Marbellí", "MRB"),
			t("Atlético Malagueño", "MLG"),
			t("UD Almería B", "ALM"),
			t("CD Alhaurino", "ALH"),
			t("Atlético Porcuna", "POR"),
			t("Atlético Mancha Real", "AMR"),
			t("Recreativo Granada", "RGR"),
			t("UD San Pedro", "SPE"),
			t("Churriana de la Vega", "CHV"),
			t("Atlético de Marbella", "AMB"),
			t("Cantoria 2017", "CAN")
		]
	},
	{
		id: "copa-federacion",
		name: "Copa Federación",
		shortName: "Copa RFEF",
		sport: "futbol",
		scoring: "football",
		format: "cup",
		teams: [t("UD Melilla", "UDM", "ud-melilla"), t("Conil CF", "CON")]
	},
	{
		id: "segunda-rfef-g4",
		name: "Segunda Federación · Grupo 4",
		shortName: "2ª RFEF Gr. 4",
		sport: "futbol",
		scoring: "football",
		teams: [t("UD Melilla", "UDM", "ud-melilla"), t("Linares Deportivo", "LIN")]
	},
	{
		id: "dh-juvenil-g4",
		name: "División de Honor Juvenil · Grupo 4",
		shortName: "DH Juvenil Gr. 4",
		sport: "futbol",
		scoring: "football",
		teams: [
			t("Atlético Melilla", "ATMJ", "atletico-melilla-dh"),
			t("Sevilla FC", "SEV"),
			t("Real Betis", "BET"),
			t("Málaga CF", "MLG"),
			t("Granada CF", "GRA"),
			t("Cádiz CF", "CAD"),
			t("UD Almería", "ALM"),
			t("Córdoba CF", "COR"),
			t("Sporting Atlético Ceuta", "CEU"),
			t("Arenas de Armilla", "ARM"),
			t("San Félix CD", "SFX"),
			t("Calavera CF", "CAL"),
			t("Tomares UD", "TOM"),
			t("CD Mosquito", "MOS"),
			t("Atlético Zabal", "ZAB"),
			t("UD Utrera", "UTR")
		]
	},
	{
		id: "lnj-g13",
		name: "Liga Nacional Juvenil · Grupo 13",
		shortName: "LNJ Gr. 13",
		sport: "futbol",
		scoring: "football",
		teams: [
			t("Melilla City CF", "CITY", "melilla-city"),
			t("Almería B Juvenil", "ALM"),
			t("Granada C", "GRA"),
			t("Málaga C", "MLG"),
			t("CD Rincón", "RIN"),
			t("Atlético Malagueño B", "MLB"),
			t("UD San Pedro Juvenil", "SPE"),
			t("Motril Juvenil", "MOT"),
			t("Estepona Juvenil", "EST"),
			t("Marbella Juvenil", "MRB"),
			t("Vélez CF", "VEL"),
			t("El Palo Juvenil", "PAL"),
			t("Huércal Juvenil", "HUE"),
			t("Alhaurín de la Torre", "ADT"),
			t("Fuengirola Juvenil", "FUE"),
			t("Torremolinos Juvenil", "TOR")
		]
	},
	{
		id: "tercera-fem",
		name: "Tercera Federación Femenina",
		shortName: "3ª ERFEF Fem.",
		sport: "futbol",
		scoring: "football",
		teams: [
			t("ATM Melilla", "ATM", "atm-melilla"),
			t("Málaga Femenino B", "MLG"),
			t("Real Jaén Femenino", "JAE"),
			t("Granada C Femenino", "GRA"),
			t("Almería Femenino", "ALM"),
			t("Úbeda Viva", "UBV"),
			t("Atlético Jiennense", "AJN"),
			t("CF Mvrgi", "MVR"),
			t("UDC Pavía", "PAV"),
			t("El Ejido Femenino", "EJI"),
			t("Motril Femenino", "MOT"),
			t("Vélez Femenino", "VEL")
		]
	},
	{
		id: "lf-challenge",
		name: "Liga Femenina Challenge",
		shortName: "LF Challenge",
		sport: "baloncesto",
		scoring: "basket",
		teams: [
			t("La Salle Melilla", "SALLE", "la-salle-fem"),
			t("Bosonit Unibasket", "UNI"),
			t("MCR Lima-Horta Barcelona", "LHB"),
			t("Recoletas Zamora", "ZAM"),
			t("Cajasol Baloncesto Sevilla", "SEV"),
			t("Valencia Basket", "VBC"),
			t("Sparking Truth Maristas", "MAR"),
			t("Osés Construcción", "OSE"),
			t("Fustecma NBF Castelló", "CAS"),
			t("Alter Enersun Al-Qázeres Extremadura", "AQZ"),
			t("Domusa Teknik ISB", "ISB"),
			t("SPAR Gran Canaria", "GCA"),
			t("La Laguna Toyota Adareva", "ADA"),
			t("Unicaja Mijas", "MIJ"),
			t("MipelletyMas B.F. León", "LEO"),
			t("Club Joventut Badalona", "JOV")
		]
	},
	{
		id: "n1-fem-b",
		name: "Primera Nacional Femenina · Grupo B",
		shortName: "N1 Fem. Gr. B",
		sport: "baloncesto",
		scoring: "basket",
		teams: [
			t("La Salle B", "SALLE B", "la-salle-b"),
			t("Hispania Agustinos", "AGU"),
			t("CB Salliver Fuengirola", "SAL"),
			t("EBG Málaga", "EBG"),
			t("Jaén CB", "JAE"),
			t("Fundación CB Granada", "GRA"),
			t("CAB Estepona", "EST"),
			t("CD Presentación", "PRE"),
			t("CB El Palo", "PAL"),
			t("Unicaja SD", "UNI"),
			t("El Toyo", "TOY"),
			t("CD Roquetas BC", "ROQ"),
			t("El Plantel GMASB", "GMA"),
			t("CB La Mojonera", "MOJ")
		]
	},
	{
		id: "n1-masc-d",
		name: "Primera Nacional Masculina · Grupo D",
		shortName: "N1 Masc. Gr. D",
		sport: "baloncesto",
		scoring: "basket",
		teams: [
			t("RC Marítimo Melilla", "RCMM", "maritimo"),
			t("CB Almería", "ALM"),
			t("Destino Vera", "VER"),
			t("CAB Atarfe", "ATA"),
			t("CB Santa Fe", "SFE"),
			t("CB La Mojonera", "MOJ"),
			t("Estudiantes Huércal", "HUE"),
			t("CD Adra 2012", "ADR"),
			t("Pinkbear Baza", "BAZ"),
			t("PC Box GMASB", "GMA"),
			t("CD Roquetas BC", "ROQ"),
			t("CD Granada", "GRA")
		]
	},
	{
		id: "tercera-feb",
		name: "Tercera FEB · Grupo A",
		shortName: "3ª FEB",
		sport: "baloncesto",
		scoring: "basket",
		teams: [
			t("Enrique Soler", "SOLER", "enrique-soler"),
			t("CB Huelva La Luz", "HUE"),
			t("Cáceres Patrimonio B", "CAC"),
			t("CB Ciudad de Ponferrada", "PON"),
			t("CB Chantada", "CHA"),
			t("UB Lebrija", "LEB"),
			t("CB Martos", "MAR"),
			t("JA Jerez", "JER"),
			t("CB La Zubia", "ZUB"),
			t("UDEA Algeciras", "UDE"),
			t("CB Benahavís", "BEN"),
			t("CB Novaschool", "NOV")
		]
	},
	{
		id: "segunda-feb",
		name: "Segunda FEB",
		shortName: "2ª FEB",
		sport: "baloncesto",
		scoring: "basket",
		teams: [
			t("Melilla Baloncesto", "MELB", "melilla-baloncesto"),
			t("UEMC Baloncesto Valladolid", "VLL"),
			t("Clínica Ponferrada SDP", "PON"),
			t("Cultural y Deportiva Leonesa", "CUL"),
			t("CB Tres Cantos", "TCS"),
			t("Movistar Estudiantes", "EST"),
			t("CB Starlabs Morón", "MOR"),
			t("Spanish Basketball Academy", "SBA"),
			t("Club Baloncesto Toledo Basket", "TOL"),
			t("CB Getafe", "GET"),
			t("BC Badajoz", "BDJ"),
			t("Cáceres Patrimonio de la Humanidad", "CAC"),
			t("CB Algeciras", "ALG"),
			t("Jaén Paraíso Interior FS", "JAE")
		]
	},
	{
		id: "primera-feb",
		name: "Primera FEB",
		shortName: "1ª FEB",
		sport: "baloncesto",
		scoring: "basket",
		teams: [t("Melilla Baloncesto", "MELB", "melilla-baloncesto"), t("Club Ourense Baloncesto", "COB")]
	},
	{
		id: "superliga-m",
		name: "Superliga Masculina",
		shortName: "Superliga",
		sport: "voleibol",
		scoring: "volley",
		teams: [
			t("CV Melilla", "CVM", "cv-melilla-m"),
			t("CV Guaguas", "GUA"),
			t("Río Duero Soria", "RDS"),
			t("Unicaja Costa de Almería", "UAL"),
			t("CV Teruel", "TER"),
			t("Conqueridor Valencia", "CON"),
			t("CV Manacor", "MAN"),
			t("Cisneros La Laguna", "CIS"),
			t("Playas de Benidorm", "BEN"),
			t("San Sadurniño", "SAD"),
			t("CV Leganés", "LEG"),
			t("SUAC Canarias", "SUA")
		]
	},
	{
		id: "superliga-f",
		name: "Superliga Femenina",
		shortName: "Superliga Fem.",
		sport: "voleibol",
		scoring: "volley",
		teams: [
			t("CV Melilla", "CVM", "cv-melilla-f"),
			t("Avarca de Menorca", "AVA"),
			t("Heidelberg Volkswagen", "HEI"),
			t("CAV Esquimo", "ESQ"),
			t("CV Gran Canaria", "GCA"),
			t("Sant Cugat", "SCU"),
			t("Haro Rioja Voley", "HAR"),
			t("CV La Laguna", "LAG"),
			t("Sayre Mayser", "SAY"),
			t("Emevé Lugo", "EME"),
			t("Kiele Socuéllamos", "KIE"),
			t("CV Alcobendas", "ALC")
		]
	},
	{
		id: "bm-primera-f",
		name: "Primera División Balonmano · Grupo F",
		shortName: "1ª BM Gr. F",
		sport: "balonmano",
		scoring: "football",
		teams: [
			t("Virgen de la Victoria", "VDV", "virgen-victoria"),
			t("Cantera Sur Almería", "CSA"),
			t("BM Bolaños", "BOL"),
			t("Helvetia Montequinto", "MON"),
			t("BM Roquetas", "ROQ"),
			t("BM Málaga", "MLG"),
			t("BM Maracena", "MAR"),
			t("BM Ciudad de Granada", "GRA"),
			t("BM Almuñécar", "ALM"),
			t("BM Jaén", "JAE"),
			t("BM Antequera", "ANT"),
			t("BM Motril", "MOT")
		]
	},
	{
		id: "bm-dh-plata",
		name: "División de Honor Plata Femenina",
		shortName: "DH Plata Fem.",
		sport: "balonmano",
		scoring: "football",
		teams: [
			t("T-Maravillas", "TMA", "t-maravillas"),
			t("Estudiantes Ceuta", "CEU"),
			t("BM Roquetas", "ROQ"),
			t("BM Málaga Costa del Sol B", "MLG"),
			t("Rincón Fertilidad Málaga B", "RIN"),
			t("BM Almería", "ALM"),
			t("BM Cádiz", "CAD"),
			t("BM Jerez", "JER"),
			t("BM Sevilla", "SEV"),
			t("BM Córdoba", "COR"),
			t("BM Huelva", "HUE"),
			t("BM Jaén", "JAE")
		]
	},
	{
		id: "fs-primera-f",
		name: "Primera División Femenina FS",
		shortName: "1ª FS Fem.",
		sport: "futsal",
		scoring: "football",
		teams: [
			t("Torreblanca", "TBN", "torreblanca"),
			t("Burela FS", "BUR"),
			t("Futsi Atlético", "FUT"),
			t("Ourense Envialia", "OUR"),
			t("AE Penya Esplugues", "ESP"),
			t("FSF Castro", "CAS"),
			t("Roldán FSF", "ROL"),
			t("Atlético Torcal", "TOR"),
			t("Alcantarilla FS", "ALC"),
			t("AD Alcorcón", "ALC2"),
			t("Guadalcacín FS", "GUA"),
			t("Poio FS", "POI"),
			t("Sala Zaragoza", "ZGZ"),
			t("CD Leganés FS", "LEG"),
			t("Univ. Alicante", "ALI"),
			t("Majadahonda FSF", "MAJ")
		]
	},
	{
		id: "fs-segunda-f",
		name: "Segunda División Femenina FS · Grupo 3",
		shortName: "2ª FS Fem. Gr. 3",
		sport: "futsal",
		scoring: "football",
		teams: [
			t("Torreblanca B", "TBN B", "torreblanca-b"),
			t("Majadahonda F.S.F./Afar 4", "MAJ"),
			t("Ramón y Cajal Féminas", "RYC"),
			t("Sporting Club Garrovilla", "GAR"),
			t("Almagro FSF", "ALM"),
			t("UDAF Afanion", "AFA"),
			t("IES Luis de Camoens", "CAM"),
			t("CDE Leganés FS", "LEG"),
			t("CFS Femenino San Fernando", "SFE"),
			t("Fundación UAPO Granada FS", "GRA"),
			t("CD Salesianos Puertollano", "SAL"),
			t("Dos Hermanas FS", "DSH"),
			t("Globalcaja Albacete FS", "ALB"),
			t("ARRIVA AD Alcorcón FSF", "ALC"),
			t("Atlético Navalcarnero", "NAV"),
			t("Martos FS Jaén Paraíso Interior", "MAR")
		]
	},
	{
		id: "fs-segunda-m",
		name: "Segunda División Masculina FS",
		shortName: "2ª FS",
		sport: "futsal",
		scoring: "football",
		teams: [
			t("Melistar FS", "MLS", "melistar"),
			t("CFS Pinatar", "PIN"),
			t("Aliança Mataró", "MAT"),
			t("Colo Colo Zaragoza", "CCZ"),
			t("CD Leganés FS", "LEG"),
			t("Sala 5 Martorell", "MAR"),
			t("Avanza Jaén", "JAE"),
			t("UD Ibiza FS", "IBI"),
			t("Ejido FS", "EJI"),
			t("Tafa FS", "TAF"),
			t("Ríos Renovables", "RIO"),
			t("Noia Portus Apostoli", "NOI"),
			t("Burela FS B", "BUR"),
			t("O Parrulo Ferrol", "PAR"),
			t("Xerez FS", "XER"),
			t("Córdoba Patrimonio", "COR")
		]
	},
	{
		id: "fs-segunda-b",
		name: "Segunda División B FS · Grupo 5",
		shortName: "2ª B FS Gr. 5",
		sport: "futsal",
		scoring: "football",
		teams: [
			t("Nueva Era Melilla", "NERA", "nueva-era"),
			t("ElPozo Murcia B", "EPO"),
			t("Blanca FS", "BLA"),
			t("CFS Jumilla", "JUM"),
			t("CD Bujalance", "BUJ"),
			t("Xerez Toyota", "XER"),
			t("Córdoba Patrimonio B", "COR"),
			t("CD Virgili Cádiz", "CAD"),
			t("Oleoinnova Mengíbar", "MEN"),
			t("Malacitano Futsal", "MAL"),
			t("SIMA Granada", "SIM"),
			t("Málaga Ciudad Redonda B", "MCR"),
			t("Alchoyano", "ALC"),
			t("Imperio Los Rosales", "IMP"),
			t("Zambú Pinatar B", "PIN"),
			t("Universidad Málaga B", "UMA")
		]
	},
	{
		id: "fs-dh-juv",
		name: "División de Honor Juvenil FS",
		shortName: "DH Juvenil FS",
		sport: "futsal",
		scoring: "football",
		teams: [
			t("Rusadir CF Juvenil", "RUS", "rusadir-fs-dh"),
			t("Peña Real Madrid", "PRM", "pena-rm-fs"),
			t("ElPozo Murcia Juvenil", "EPO"),
			t("Cartagena FS Juvenil", "CAR"),
			t("Inter Movistar Juvenil", "INT"),
			t("Barça FS Juvenil", "FCB"),
			t("Jaén FS Juvenil", "JAE"),
			t("Córdoba FS Juvenil", "COR"),
			t("Málaga FS Juvenil", "MLG"),
			t("Alhama FS Juvenil", "ALH"),
			t("Burela Juvenil", "BUR"),
			t("Valdepeñas Juvenil", "VAL")
		]
	},
	{
		id: "bsr-segunda",
		name: "Segunda División BSR · Grupo B",
		shortName: "2ª BSR Gr. B",
		sport: "bsr",
		scoring: "basket",
		teams: [
			t("Melilla Baloncesto BSR", "MBSR", "melilla-bsr"),
			t("Opticlass Raíces Móstoles", "MOS"),
			t("CDA Bahía de Cádiz", "CAD"),
			t("Covirán Churriana", "CHU"),
			t("BSR Fortuna Murcia", "FOR")
		]
	}
];
var leagueById = Object.fromEntries(leagues.map((l) => [l.id, l]));
var DURATION = {
	futbol: 95,
	baloncesto: 48,
	voleibol: 110,
	balonmano: 70,
	futsal: 48,
	bsr: 48
};
function sideOf(token) {
	const team = teamById[token];
	if (team) return {
		id: team.id,
		name: team.name,
		short: team.short
	};
	const [name, short] = token.includes("|") ? token.split("|") : [token, token.slice(0, 3).toUpperCase()];
	return {
		name,
		short
	};
}
function parseMatchScore(note) {
	if (!note) return null;
	const m = note.match(/^\*(\d+)-(\d+)$/);
	if (!m) return null;
	return {
		home: Number(m[1]),
		away: Number(m[2])
	};
}
function buildEvents(specs) {
	if (!specs?.length) return [];
	let home = 0;
	let away = 0;
	return specs.map(([minute, ha, kind, player, note]) => {
		const side = ha === "H" ? "home" : "away";
		const parsed = parseMatchScore(note);
		if (parsed) {
			home = parsed.home;
			away = parsed.away;
		} else if (kind === "gol" || kind === "gol_pp" || kind === "punto" || kind === "set") {
			if (side === "home") home += 1;
			else away += 1;
		}
		return {
			minute,
			side,
			kind,
			player,
			homeScore: home,
			awayScore: away,
			note
		};
	});
}
function m(spec) {
	const home = sideOf(spec.home);
	const away = sideOf(spec.away);
	return {
		id: spec.id,
		leagueId: spec.league,
		sport: spec.sport,
		venue: spec.venue,
		jornada: spec.jornada,
		homeId: home.id,
		homeName: home.name,
		homeShort: home.short,
		homeBadge: badgeFor(home.id, home.name),
		awayId: away.id,
		awayName: away.name,
		awayShort: away.short,
		awayBadge: badgeFor(away.id, away.name),
		kickoff: spec.at,
		liveElapsed: spec.live,
		events: buildEvents(spec.events),
		duration: spec.duration ?? DURATION[spec.sport]
	};
}
var matches = [
	m({
		id: "udm-j1",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-09-05T18:30:00+02:00",
		venue: "Estadio Matías Prats",
		jornada: 1,
		home: "Ciudad de Torredonjimeno|TDJ",
		away: "ud-melilla",
		events: [
			[
				18,
				"A",
				"gol",
				"El Ouazni"
			],
			[
				33,
				"A",
				"amarilla",
				"Mohand"
			],
			[
				41,
				"H",
				"gol",
				"Sánchez"
			],
			[
				67,
				"A",
				"amarilla",
				"Rivas"
			],
			[
				78,
				"A",
				"gol",
				"Mohand"
			],
			[
				84,
				"H",
				"amarilla",
				"Cano"
			]
		]
	}),
	m({
		id: "udm-copa",
		league: "copa-federacion",
		sport: "futbol",
		at: "2026-09-09T17:30:00+02:00",
		venue: "Estadio Álvarez Claro",
		jornada: 0,
		home: "ud-melilla",
		away: "Conil CF|CON"
	}),
	m({
		id: "udm-j2",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-09-12T16:00:00+02:00",
		venue: "Estadio Álvarez Claro",
		jornada: 2,
		home: "ud-melilla",
		away: "CD Huétor Vega|HUV"
	}),
	m({
		id: "udm-j3",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-09-19T12:00:00+02:00",
		venue: "Estadio Juan Manuel Azuaga",
		jornada: 3,
		home: "UD Torre del Mar|TDM",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j4",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-09-26T12:00:00+02:00",
		venue: "Estadio Álvarez Claro",
		jornada: 4,
		home: "ud-melilla",
		away: "Málaga Juniors|MJF"
	}),
	m({
		id: "udm-j5",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-10-03T12:00:00+02:00",
		venue: "Estadio Miguel Fijones",
		jornada: 5,
		home: "CD Alhaurino|ALH",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j6",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-10-10T12:00:00+02:00",
		venue: "Estadio Álvarez Claro",
		jornada: 6,
		home: "ud-melilla",
		away: "UD San Pedro|SPE"
	}),
	m({
		id: "udm-j7",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-10-17T12:00:00+02:00",
		venue: "Estadio San Benito",
		jornada: 7,
		home: "Atlético Porcuna|POR",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j8",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-10-24T12:00:00+02:00",
		venue: "Estadio Álvarez Claro",
		jornada: 8,
		home: "ud-melilla",
		away: "Cantoria 2017|CAN"
	}),
	m({
		id: "udm-j9",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-10-31T12:00:00+02:00",
		venue: "Ciudad Deportiva Málaga",
		jornada: 9,
		home: "Atlético Malagueño|MLG",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j10",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-11-07T12:00:00+01:00",
		venue: "Estadio Álvarez Claro",
		jornada: 10,
		home: "ud-melilla",
		away: "Recreativo Granada|RGR"
	}),
	m({
		id: "udm-j11",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-11-14T12:00:00+01:00",
		venue: "Anexo Juegos Mediterráneos",
		jornada: 11,
		home: "UD Almería B|ALM",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j12",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-11-21T12:00:00+01:00",
		venue: "Estadio Álvarez Claro",
		jornada: 12,
		home: "ud-melilla",
		away: "Churriana de la Vega|CHV"
	}),
	m({
		id: "udm-j13",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-11-28T12:00:00+01:00",
		venue: "Estadio Escribano Castilla",
		jornada: 13,
		home: "CF Motril|MOT",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j14",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-12-05T12:00:00+01:00",
		venue: "Estadio Álvarez Claro",
		jornada: 14,
		home: "ud-melilla",
		away: "Atlético de Marbella|AMB"
	}),
	m({
		id: "udm-j15",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-12-07T19:00:00+01:00",
		venue: "Estadio Álvarez Claro",
		jornada: 15,
		home: "ud-melilla",
		away: "FC Marbellí|MRB"
	}),
	m({
		id: "udm-j16",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-12-12T12:00:00+01:00",
		venue: "Estadio Municipal de Armilla",
		jornada: 16,
		home: "Arenas de Armilla|ARM",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j17",
		league: "tercera-g9",
		sport: "futbol",
		at: "2026-12-19T12:00:00+01:00",
		venue: "La Juventud",
		jornada: 17,
		home: "Atlético Mancha Real|AMR",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j18",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-01-02T12:00:00+01:00",
		venue: "Estadio Álvarez Claro",
		jornada: 18,
		home: "ud-melilla",
		away: "Ciudad de Torredonjimeno|TDJ"
	}),
	m({
		id: "udm-j19",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-01-09T12:00:00+01:00",
		venue: "Polideportivo Las Viñas",
		jornada: 19,
		home: "CD Huétor Vega|HUV",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j20",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-01-16T12:00:00+01:00",
		venue: "Estadio Álvarez Claro",
		jornada: 20,
		home: "ud-melilla",
		away: "UD Torre del Mar|TDM"
	}),
	m({
		id: "udm-j21",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-01-23T12:00:00+01:00",
		venue: "Ciudad Deportiva Málaga",
		jornada: 21,
		home: "Málaga Juniors|MJF",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j22",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-01-30T12:00:00+01:00",
		venue: "Estadio Álvarez Claro",
		jornada: 22,
		home: "ud-melilla",
		away: "CD Alhaurino|ALH"
	}),
	m({
		id: "udm-j23",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-02-06T12:00:00+01:00",
		venue: "Estadio Municipal San Pedro",
		jornada: 23,
		home: "UD San Pedro|SPE",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j24",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-02-13T12:00:00+01:00",
		venue: "Estadio Álvarez Claro",
		jornada: 24,
		home: "ud-melilla",
		away: "Atlético Porcuna|POR"
	}),
	m({
		id: "udm-j25",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-02-20T12:00:00+01:00",
		venue: "Estadio Municipal Cantoria",
		jornada: 25,
		home: "Cantoria 2017|CAN",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j26",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-02-27T12:00:00+01:00",
		venue: "Estadio Álvarez Claro",
		jornada: 26,
		home: "ud-melilla",
		away: "Atlético Malagueño|MLG"
	}),
	m({
		id: "udm-j27",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-03-06T12:00:00+01:00",
		venue: "Ciudad Deportiva Granada CF",
		jornada: 27,
		home: "Recreativo Granada|RGR",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j28",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-03-13T12:00:00+01:00",
		venue: "Estadio Álvarez Claro",
		jornada: 28,
		home: "ud-melilla",
		away: "UD Almería B|ALM"
	}),
	m({
		id: "udm-j29",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-03-20T12:00:00+01:00",
		venue: "Estadio Municipal Churriana",
		jornada: 29,
		home: "Churriana de la Vega|CHV",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j30",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-04-03T12:00:00+02:00",
		venue: "Estadio Álvarez Claro",
		jornada: 30,
		home: "ud-melilla",
		away: "CF Motril|MOT"
	}),
	m({
		id: "udm-j31",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-04-10T12:00:00+02:00",
		venue: "Estadio Municipal Marbella",
		jornada: 31,
		home: "Atlético de Marbella|AMB",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j32",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-04-17T12:00:00+02:00",
		venue: "Estadio Municipal Marbella",
		jornada: 32,
		home: "FC Marbellí|MRB",
		away: "ud-melilla"
	}),
	m({
		id: "udm-j33",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-04-24T12:00:00+02:00",
		venue: "Estadio Álvarez Claro",
		jornada: 33,
		home: "ud-melilla",
		away: "Arenas de Armilla|ARM"
	}),
	m({
		id: "udm-j34",
		league: "tercera-g9",
		sport: "futbol",
		at: "2027-05-01T12:00:00+02:00",
		venue: "Estadio Álvarez Claro",
		jornada: 34,
		home: "ud-melilla",
		away: "Atlético Mancha Real|AMR"
	}),
	m({
		id: "atmdh-j1",
		league: "dh-juvenil-g4",
		sport: "futbol",
		at: "2026-09-06T11:00:00+02:00",
		venue: "La Espiguera",
		jornada: 1,
		home: "atletico-melilla-dh",
		away: "Sporting Atlético Ceuta|CEU",
		events: [
			[
				9,
				"H",
				"gol",
				"Amine"
			],
			[
				38,
				"A",
				"gol",
				"Hamido"
			],
			[
				61,
				"H",
				"gol",
				"Younes"
			],
			[
				88,
				"H",
				"gol",
				"Amine"
			]
		]
	}),
	m({
		id: "atmdh-j2",
		league: "dh-juvenil-g4",
		sport: "futbol",
		at: "2026-09-13T12:00:00+02:00",
		venue: "La Espiguera",
		jornada: 2,
		home: "atletico-melilla-dh",
		away: "Tomares UD|TOM"
	}),
	m({
		id: "atmdh-j3",
		league: "dh-juvenil-g4",
		sport: "futbol",
		at: "2026-09-20T12:00:00+02:00",
		venue: "Ciudad Deportiva Sevilla FC",
		jornada: 3,
		home: "Sevilla FC|SEV",
		away: "atletico-melilla-dh"
	}),
	m({
		id: "atmdh-j4",
		league: "dh-juvenil-g4",
		sport: "futbol",
		at: "2026-09-27T12:00:00+02:00",
		venue: "La Espiguera",
		jornada: 4,
		home: "atletico-melilla-dh",
		away: "Real Betis|BET"
	}),
	m({
		id: "atmdh-j5",
		league: "dh-juvenil-g4",
		sport: "futbol",
		at: "2026-10-04T12:00:00+02:00",
		venue: "El Viso",
		jornada: 5,
		home: "Málaga CF|MLG",
		away: "atletico-melilla-dh"
	}),
	m({
		id: "atmdh-j6",
		league: "dh-juvenil-g4",
		sport: "futbol",
		at: "2026-10-11T12:00:00+02:00",
		venue: "La Espiguera",
		jornada: 6,
		home: "atletico-melilla-dh",
		away: "Granada CF|GRA"
	}),
	m({
		id: "atmdh-j7",
		league: "dh-juvenil-g4",
		sport: "futbol",
		at: "2026-10-18T12:00:00+02:00",
		venue: "Ciudad Deportiva Cádiz CF",
		jornada: 7,
		home: "Cádiz CF|CAD",
		away: "atletico-melilla-dh"
	}),
	m({
		id: "city-j1",
		league: "lnj-g13",
		sport: "futbol",
		at: "2026-09-07T11:30:00+02:00",
		venue: "La Espiguera",
		jornada: 1,
		home: "melilla-city",
		away: "CD Rincón|RIN",
		events: [
			[
				22,
				"H",
				"gol",
				"Bilal"
			],
			[
				55,
				"A",
				"gol",
				"Ortiz"
			],
			[
				71,
				"H",
				"gol",
				"Nassim"
			]
		]
	}),
	m({
		id: "city-j2",
		league: "lnj-g13",
		sport: "futbol",
		at: "2026-09-14T12:00:00+02:00",
		venue: "Ciudad Deportiva Almería",
		jornada: 2,
		home: "Almería B Juvenil|ALM",
		away: "melilla-city"
	}),
	m({
		id: "city-j3",
		league: "lnj-g13",
		sport: "futbol",
		at: "2026-09-21T12:00:00+02:00",
		venue: "La Espiguera",
		jornada: 3,
		home: "melilla-city",
		away: "Granada C|GRA"
	}),
	m({
		id: "city-j4",
		league: "lnj-g13",
		sport: "futbol",
		at: "2026-09-28T12:00:00+02:00",
		venue: "El Cónsul",
		jornada: 4,
		home: "Málaga C|MLG",
		away: "melilla-city"
	}),
	m({
		id: "atm-j1",
		league: "tercera-fem",
		sport: "futbol",
		at: "2026-09-13T12:00:00+02:00",
		venue: "Complejo Deportivo El Cónsul",
		jornada: 1,
		home: "Málaga Femenino B|MLG",
		away: "atm-melilla"
	}),
	m({
		id: "atm-j2",
		league: "tercera-fem",
		sport: "futbol",
		at: "2026-09-20T12:00:00+02:00",
		venue: "La Espiguera",
		jornada: 2,
		home: "atm-melilla",
		away: "Real Jaén Femenino|JAE"
	}),
	m({
		id: "atm-j3",
		league: "tercera-fem",
		sport: "futbol",
		at: "2026-09-27T12:00:00+02:00",
		venue: "La Espiguera",
		jornada: 3,
		home: "atm-melilla",
		away: "Úbeda Viva|UBV"
	}),
	m({
		id: "atm-j4",
		league: "tercera-fem",
		sport: "futbol",
		at: "2026-10-04T12:00:00+02:00",
		venue: "Campo Sebastián Barajas",
		jornada: 4,
		home: "Atlético Jiennense|AJN",
		away: "atm-melilla"
	}),
	m({
		id: "atm-pre",
		league: "tercera-fem",
		sport: "futbol",
		at: "2026-09-06T10:30:00+02:00",
		venue: "La Espiguera",
		jornada: 0,
		home: "atm-melilla",
		away: "Gimnástico Melilla|GIM",
		events: [
			[
				14,
				"H",
				"gol",
				"Sara Ruiz"
			],
			[
				29,
				"H",
				"gol",
				"Nadia"
			],
			[
				63,
				"A",
				"gol",
				"Fátima"
			],
			[
				81,
				"H",
				"gol",
				"Sara Ruiz"
			]
		]
	}),
	m({
		id: "melb-pre",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2026-08-30T19:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 0,
		home: "melilla-baloncesto",
		away: "Unicaja|UNI",
		duration: 40,
		events: [
			[
				6,
				"A",
				"punto",
				"Lukosius",
				"*12-21"
			],
			[
				10,
				"H",
				"periodo",
				"Q1",
				"*18-27"
			],
			[
				20,
				"H",
				"periodo",
				"Q2",
				"*34-54"
			],
			[
				30,
				"H",
				"periodo",
				"Q3",
				"*51-79"
			],
			[
				40,
				"A",
				"punto",
				"Final",
				"*67-105"
			]
		]
	}),
	m({
		id: "melb-j1",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2026-10-03T18:00:00+02:00",
		venue: "Pabellón Pisuerga",
		jornada: 1,
		home: "UEMC Baloncesto Valladolid|VLL",
		away: "melilla-baloncesto"
	}),
	m({
		id: "melb-j2",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2026-10-10T18:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 2,
		home: "melilla-baloncesto",
		away: "Clínica Ponferrada SDP|PON"
	}),
	m({
		id: "melb-j3",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2026-10-17T18:00:00+02:00",
		venue: "Palacio de los Deportes de León",
		jornada: 3,
		home: "Cultural y Deportiva Leonesa|CUL",
		away: "melilla-baloncesto"
	}),
	m({
		id: "melb-j4",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2026-10-24T18:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 4,
		home: "melilla-baloncesto",
		away: "CB Tres Cantos|TCS"
	}),
	m({
		id: "melb-j5",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2026-10-31T18:00:00+01:00",
		venue: "Pabellón Magariños",
		jornada: 5,
		home: "Movistar Estudiantes|EST",
		away: "melilla-baloncesto"
	}),
	m({
		id: "melb-j6",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2026-11-07T18:00:00+01:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 6,
		home: "melilla-baloncesto",
		away: "CB Starlabs Morón|MOR"
	}),
	m({
		id: "melb-j7",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2026-11-14T18:00:00+01:00",
		venue: "Polideportivo Ideo",
		jornada: 7,
		home: "Spanish Basketball Academy|SBA",
		away: "melilla-baloncesto"
	}),
	m({
		id: "melb-j8",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2026-11-21T18:00:00+01:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 8,
		home: "melilla-baloncesto",
		away: "Club Baloncesto Toledo Basket|TOL"
	}),
	m({
		id: "melb-j9",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2026-11-28T18:00:00+01:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 9,
		home: "melilla-baloncesto",
		away: "CB Getafe|GET"
	}),
	m({
		id: "melb-j10",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2026-12-05T18:00:00+01:00",
		venue: "Pabellón La Granadilla",
		jornada: 10,
		home: "BC Badajoz|BDJ",
		away: "melilla-baloncesto"
	}),
	m({
		id: "melb-j11",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2026-12-12T18:00:00+01:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 11,
		home: "melilla-baloncesto",
		away: "Cáceres Patrimonio de la Humanidad|CAC"
	}),
	m({
		id: "melb-j12",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2026-12-19T18:00:00+01:00",
		venue: "Pabellón Dr. Juan Carlos Mateo",
		jornada: 12,
		home: "CB Algeciras|ALG",
		away: "melilla-baloncesto"
	}),
	m({
		id: "melb-j13",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2027-01-03T18:00:00+01:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 13,
		home: "melilla-baloncesto",
		away: "Jaén Paraíso Interior FS|JAE"
	}),
	m({
		id: "melb-j14",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2027-01-09T18:00:00+01:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 14,
		home: "melilla-baloncesto",
		away: "UEMC Baloncesto Valladolid|VLL"
	}),
	m({
		id: "melb-j15",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2027-01-16T18:00:00+01:00",
		venue: "Pabellón Lydia Valentín",
		jornada: 15,
		home: "Clínica Ponferrada SDP|PON",
		away: "melilla-baloncesto"
	}),
	m({
		id: "melb-j16",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2027-01-30T18:00:00+01:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 16,
		home: "melilla-baloncesto",
		away: "Cultural y Deportiva Leonesa|CUL"
	}),
	m({
		id: "melb-j17",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2027-02-06T18:00:00+01:00",
		venue: "Pabellón Municipal Tres Cantos",
		jornada: 17,
		home: "CB Tres Cantos|TCS",
		away: "melilla-baloncesto"
	}),
	m({
		id: "melb-j18",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2027-02-13T18:00:00+01:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 18,
		home: "melilla-baloncesto",
		away: "Movistar Estudiantes|EST"
	}),
	m({
		id: "melb-j19",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2027-02-20T18:00:00+01:00",
		venue: "Pabellón Alameda",
		jornada: 19,
		home: "CB Starlabs Morón|MOR",
		away: "melilla-baloncesto"
	}),
	m({
		id: "melb-j20",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2027-02-27T18:00:00+01:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 20,
		home: "melilla-baloncesto",
		away: "Spanish Basketball Academy|SBA"
	}),
	m({
		id: "melb-j21",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2027-03-06T18:00:00+01:00",
		venue: "Pabellón Javier Martín",
		jornada: 21,
		home: "Club Baloncesto Toledo Basket|TOL",
		away: "melilla-baloncesto"
	}),
	m({
		id: "melb-j22",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2027-03-13T18:00:00+01:00",
		venue: "Pabellón Jorge Garbajosa",
		jornada: 22,
		home: "CB Getafe|GET",
		away: "melilla-baloncesto"
	}),
	m({
		id: "melb-j23",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2027-03-20T18:00:00+01:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 23,
		home: "melilla-baloncesto",
		away: "BC Badajoz|BDJ"
	}),
	m({
		id: "melb-j24",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2027-03-27T18:00:00+01:00",
		venue: "Multiusos Ciudad de Cáceres",
		jornada: 24,
		home: "Cáceres Patrimonio de la Humanidad|CAC",
		away: "melilla-baloncesto"
	}),
	m({
		id: "melb-j25",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2027-04-03T18:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 25,
		home: "melilla-baloncesto",
		away: "CB Algeciras|ALG"
	}),
	m({
		id: "melb-j26",
		league: "segunda-feb",
		sport: "baloncesto",
		at: "2027-04-10T18:00:00+02:00",
		venue: "Olivo Arena",
		jornada: 26,
		home: "Jaén Paraíso Interior FS|JAE",
		away: "melilla-baloncesto"
	}),
	m({
		id: "sallef-pre",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2026-09-05T18:00:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 0,
		home: "la-salle-fem",
		away: "Unicaja Mijas|MIJ",
		duration: 40,
		events: [
			[
				10,
				"H",
				"periodo",
				"Q1",
				"*19-16"
			],
			[
				20,
				"H",
				"periodo",
				"Q2",
				"*38-34"
			],
			[
				30,
				"H",
				"periodo",
				"Q3",
				"*54-55"
			],
			[
				40,
				"A",
				"punto",
				"Final",
				"*68-71"
			]
		]
	}),
	m({
		id: "sallef-j1",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2026-10-03T18:30:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 1,
		home: "la-salle-fem",
		away: "Bosonit Unibasket|UNI"
	}),
	m({
		id: "sallef-j2",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2026-10-10T18:00:00+02:00",
		venue: "Pabellón Nou Poliesportiu",
		jornada: 2,
		home: "MCR Lima-Horta Barcelona|LHB",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j3",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2026-10-17T18:30:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 3,
		home: "la-salle-fem",
		away: "Recoletas Zamora|ZAM"
	}),
	m({
		id: "sallef-j4",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2026-10-24T18:00:00+02:00",
		venue: "Palacio de Deportes San Pablo",
		jornada: 4,
		home: "Cajasol Baloncesto Sevilla|SEV",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j5",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2026-10-31T18:30:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 5,
		home: "la-salle-fem",
		away: "Valencia Basket|VBC"
	}),
	m({
		id: "sallef-j6",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2026-11-06T18:00:00+01:00",
		venue: "Pabellón Maristas",
		jornada: 6,
		home: "Sparking Truth Maristas|MAR",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j7",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2026-11-21T18:30:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 7,
		home: "la-salle-fem",
		away: "Osés Construcción|OSE"
	}),
	m({
		id: "sallef-j8",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2026-11-28T18:00:00+01:00",
		venue: "Pabellón Ciutat de Castelló",
		jornada: 8,
		home: "Fustecma NBF Castelló|CAS",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j9",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2026-12-05T18:30:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 9,
		home: "la-salle-fem",
		away: "Alter Enersun Al-Qázeres Extremadura|AQZ"
	}),
	m({
		id: "sallef-j10",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2026-12-08T18:00:00+01:00",
		venue: "Polideportivo Municipal Azpeitia",
		jornada: 10,
		home: "Domusa Teknik ISB|ISB",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j11",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2026-12-12T18:30:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 11,
		home: "la-salle-fem",
		away: "SPAR Gran Canaria|GCA"
	}),
	m({
		id: "sallef-j12",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2026-12-19T18:30:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 12,
		home: "la-salle-fem",
		away: "La Laguna Toyota Adareva|ADA"
	}),
	m({
		id: "sallef-j13",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2026-12-29T18:00:00+01:00",
		venue: "Pabellón de Deportes Los Guindos",
		jornada: 13,
		home: "Unicaja Mijas|MIJ",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j14",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-01-02T18:00:00+01:00",
		venue: "Palacio de los Deportes de León",
		jornada: 14,
		home: "MipelletyMas B.F. León|LEO",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j15",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-01-09T18:30:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 15,
		home: "la-salle-fem",
		away: "Club Joventut Badalona|JOV"
	}),
	m({
		id: "sallef-j16",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-01-16T18:00:00+01:00",
		venue: "Pabellón Fuente de San Luis",
		jornada: 16,
		home: "Valencia Basket|VBC",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j17",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-01-23T18:30:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 17,
		home: "la-salle-fem",
		away: "Domusa Teknik ISB|ISB"
	}),
	m({
		id: "sallef-j18",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-01-30T18:00:00+01:00",
		venue: "Pabellón Unibasket",
		jornada: 18,
		home: "Bosonit Unibasket|UNI",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j19",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-02-05T18:30:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 19,
		home: "la-salle-fem",
		away: "Fustecma NBF Castelló|CAS"
	}),
	m({
		id: "sallef-j20",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-02-20T18:00:00+01:00",
		venue: "Pabellón Multiusos Cáceres",
		jornada: 20,
		home: "Alter Enersun Al-Qázeres Extremadura|AQZ",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j21",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-02-27T18:30:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 21,
		home: "la-salle-fem",
		away: "Sparking Truth Maristas|MAR"
	}),
	m({
		id: "sallef-j22",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-03-06T18:00:00+01:00",
		venue: "Pabellón Juan Ríos Tejera",
		jornada: 22,
		home: "La Laguna Toyota Adareva|ADA",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j23",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-03-13T18:30:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 23,
		home: "la-salle-fem",
		away: "MCR Lima-Horta Barcelona|LHB"
	}),
	m({
		id: "sallef-j24",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-03-20T18:00:00+01:00",
		venue: "Gran Canaria Arena",
		jornada: 24,
		home: "SPAR Gran Canaria|GCA",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j25",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-03-27T18:00:00+01:00",
		venue: "Polideportivo Municipal Osés",
		jornada: 25,
		home: "Osés Construcción|OSE",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j26",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-03-31T18:30:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 26,
		home: "la-salle-fem",
		away: "Unicaja Mijas|MIJ"
	}),
	m({
		id: "sallef-j27",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-04-03T18:00:00+02:00",
		venue: "Pabellón Ángel Nieto",
		jornada: 27,
		home: "Recoletas Zamora|ZAM",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j28",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-04-10T18:30:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 28,
		home: "la-salle-fem",
		away: "MipelletyMas B.F. León|LEO"
	}),
	m({
		id: "sallef-j29",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-04-17T18:00:00+02:00",
		venue: "Pavelló Olímpic de Badalona",
		jornada: 29,
		home: "Club Joventut Badalona|JOV",
		away: "la-salle-fem"
	}),
	m({
		id: "sallef-j30",
		league: "lf-challenge",
		sport: "baloncesto",
		at: "2027-04-24T18:30:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 30,
		home: "la-salle-fem",
		away: "Cajasol Baloncesto Sevilla|SEV"
	}),
	m({
		id: "salleb-j1",
		league: "n1-fem-b",
		sport: "baloncesto",
		at: "2026-09-27T12:30:00+02:00",
		venue: "Colegio Agustinos",
		jornada: 1,
		home: "Hispania Agustinos|AGU",
		away: "la-salle-b"
	}),
	m({
		id: "salleb-j2",
		league: "n1-fem-b",
		sport: "baloncesto",
		at: "2026-10-04T12:00:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 2,
		home: "la-salle-b",
		away: "CB Salliver Fuengirola|SAL"
	}),
	m({
		id: "salleb-j3",
		league: "n1-fem-b",
		sport: "baloncesto",
		at: "2026-10-11T12:00:00+02:00",
		venue: "Pabellón EBG Málaga",
		jornada: 3,
		home: "EBG Málaga|EBG",
		away: "la-salle-b"
	}),
	m({
		id: "salleb-j4",
		league: "n1-fem-b",
		sport: "baloncesto",
		at: "2026-10-18T12:00:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 4,
		home: "la-salle-b",
		away: "Jaén CB|JAE"
	}),
	m({
		id: "salleb-j5",
		league: "n1-fem-b",
		sport: "baloncesto",
		at: "2026-10-24T12:00:00+02:00",
		venue: "Pabellón Veleta",
		jornada: 5,
		home: "Fundación CB Granada|GRA",
		away: "la-salle-b"
	}),
	m({
		id: "salleb-j6",
		league: "n1-fem-b",
		sport: "baloncesto",
		at: "2026-11-01T12:00:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 6,
		home: "la-salle-b",
		away: "CAB Estepona|EST"
	}),
	m({
		id: "salleb-j7",
		league: "n1-fem-b",
		sport: "baloncesto",
		at: "2026-11-08T12:00:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 7,
		home: "la-salle-b",
		away: "CD Presentación|PRE"
	}),
	m({
		id: "salleb-j8",
		league: "n1-fem-b",
		sport: "baloncesto",
		at: "2026-11-14T12:00:00+01:00",
		venue: "Polideportivo La Mosca",
		jornada: 8,
		home: "CB El Palo|PAL",
		away: "la-salle-b"
	}),
	m({
		id: "mar-j1",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2026-10-04T12:00:00+02:00",
		venue: "Pabellón Municipal de Adra",
		jornada: 1,
		home: "CD Adra 2012|ADR",
		away: "maritimo"
	}),
	m({
		id: "mar-j2",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2026-10-11T12:00:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 2,
		home: "maritimo",
		away: "Pinkbear Baza|BAZ"
	}),
	m({
		id: "mar-j3",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2026-10-18T12:00:00+02:00",
		venue: "Pabellón GMASB",
		jornada: 3,
		home: "PC Box GMASB|GMA",
		away: "maritimo"
	}),
	m({
		id: "mar-j4",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2026-10-25T12:00:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 4,
		home: "maritimo",
		away: "CD Roquetas BC|ROQ"
	}),
	m({
		id: "mar-j5",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2026-11-08T12:00:00+01:00",
		venue: "Pabellón Moisés Ruiz",
		jornada: 5,
		home: "CB Almería|ALM",
		away: "maritimo"
	}),
	m({
		id: "mar-j6",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2026-11-15T12:00:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 6,
		home: "maritimo",
		away: "Destino Vera Ciudad de Vera|VER"
	}),
	m({
		id: "mar-j7",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2026-11-22T12:00:00+01:00",
		venue: "Pabellón Municipal Atarfe",
		jornada: 7,
		home: "CAB Atarfe|ATA",
		away: "maritimo"
	}),
	m({
		id: "mar-j8",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2026-11-29T12:00:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 8,
		home: "maritimo",
		away: "CD Granada por el Baloncesto|GRA"
	}),
	m({
		id: "mar-j9",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2026-12-13T12:00:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 9,
		home: "maritimo",
		away: "Eigra Grupo CB Santa Fe|SFE"
	}),
	m({
		id: "mar-j10",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2026-12-20T12:00:00+01:00",
		venue: "Pabellón Municipal La Mojonera",
		jornada: 10,
		home: "CB La Mojonera|MOJ",
		away: "maritimo"
	}),
	m({
		id: "mar-j11",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2027-01-10T12:00:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 11,
		home: "maritimo",
		away: "Estudiantes Huércal de Almería|HUE"
	}),
	m({
		id: "mar-j12",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2027-01-17T12:00:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 12,
		home: "maritimo",
		away: "CD Adra 2012|ADR"
	}),
	m({
		id: "mar-j13",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2027-01-24T12:00:00+01:00",
		venue: "Pabellón Municipal Baza",
		jornada: 13,
		home: "Pinkbear Baza|BAZ",
		away: "maritimo"
	}),
	m({
		id: "mar-j14",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2027-01-31T12:00:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 14,
		home: "maritimo",
		away: "PC Box GMASB|GMA"
	}),
	m({
		id: "mar-j15",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2027-02-07T12:00:00+01:00",
		venue: "Pabellón Municipal Roquetas",
		jornada: 15,
		home: "CD Roquetas BC|ROQ",
		away: "maritimo"
	}),
	m({
		id: "mar-j16",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2027-02-14T12:00:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 16,
		home: "maritimo",
		away: "CB Almería|ALM"
	}),
	m({
		id: "mar-j17",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2027-02-21T12:00:00+01:00",
		venue: "Pabellón Municipal Vera",
		jornada: 17,
		home: "Destino Vera Ciudad de Vera|VER",
		away: "maritimo"
	}),
	m({
		id: "mar-j18",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2027-02-28T12:00:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 18,
		home: "maritimo",
		away: "CAB Atarfe|ATA"
	}),
	m({
		id: "mar-j19",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2027-03-07T12:00:00+01:00",
		venue: "Pabellón CD Granada",
		jornada: 19,
		home: "CD Granada por el Baloncesto|GRA",
		away: "maritimo"
	}),
	m({
		id: "mar-j20",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2027-03-14T12:00:00+01:00",
		venue: "Pabellón Municipal Santa Fe",
		jornada: 20,
		home: "Eigra Grupo CB Santa Fe|SFE",
		away: "maritimo"
	}),
	m({
		id: "mar-j21",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2027-03-21T12:00:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 21,
		home: "maritimo",
		away: "CB La Mojonera|MOJ"
	}),
	m({
		id: "mar-j22",
		league: "n1-masc-d",
		sport: "baloncesto",
		at: "2027-04-11T12:00:00+02:00",
		venue: "Pabellón Municipal Huércal",
		jornada: 22,
		home: "Estudiantes Huércal de Almería|HUE",
		away: "maritimo"
	}),
	m({
		id: "soler-pre",
		league: "tercera-feb",
		sport: "baloncesto",
		at: "2026-09-06T18:00:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 0,
		home: "enrique-soler",
		away: "CB Huelva La Luz|HUE",
		duration: 40,
		events: [
			[
				10,
				"H",
				"periodo",
				"Q1",
				"*20-18"
			],
			[
				20,
				"H",
				"periodo",
				"Q2",
				"*41-39"
			],
			[
				30,
				"H",
				"periodo",
				"Q3",
				"*62-58"
			],
			[
				40,
				"H",
				"punto",
				"Final",
				"*79-74"
			]
		]
	}),
	m({
		id: "soler-j1",
		league: "tercera-feb",
		sport: "baloncesto",
		at: "2026-10-03T18:00:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 1,
		home: "enrique-soler",
		away: "CB Ciudad de Ponferrada|PON"
	}),
	m({
		id: "soler-j2",
		league: "tercera-feb",
		sport: "baloncesto",
		at: "2026-10-10T18:00:00+02:00",
		venue: "Pabellón Municipal Cáceres",
		jornada: 2,
		home: "Cáceres Patrimonio B|CAC",
		away: "enrique-soler"
	}),
	m({
		id: "soler-j3",
		league: "tercera-feb",
		sport: "baloncesto",
		at: "2026-10-17T18:00:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 3,
		home: "enrique-soler",
		away: "UB Lebrija|LEB"
	}),
	m({
		id: "cvm-pre",
		league: "superliga-m",
		sport: "voleibol",
		at: "2026-09-06T18:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 0,
		home: "cv-melilla-m",
		away: "Playas de Benidorm|BEN",
		duration: 95,
		events: [
			[
				22,
				"H",
				"set",
				"Set 1",
				"25-22"
			],
			[
				45,
				"A",
				"set",
				"Set 2",
				"21-25"
			],
			[
				68,
				"H",
				"set",
				"Set 3",
				"25-19"
			],
			[
				90,
				"H",
				"set",
				"Set 4",
				"25-20"
			]
		]
	}),
	m({
		id: "cvm-j1",
		league: "superliga-m",
		sport: "voleibol",
		at: "2026-10-17T18:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 1,
		home: "cv-melilla-m",
		away: "Conqueridor Valencia|CON"
	}),
	m({
		id: "cvm-j2",
		league: "superliga-m",
		sport: "voleibol",
		at: "2026-10-24T18:00:00+02:00",
		venue: "Pabellón Los Planos",
		jornada: 2,
		home: "CV Teruel|TER",
		away: "cv-melilla-m"
	}),
	m({
		id: "cvm-j3",
		league: "superliga-m",
		sport: "voleibol",
		at: "2026-10-31T18:00:00+01:00",
		venue: "Pabellón San Sadurniño",
		jornada: 3,
		home: "San Sadurniño|SAD",
		away: "cv-melilla-m"
	}),
	m({
		id: "cvmf-pre",
		league: "superliga-f",
		sport: "voleibol",
		at: "2026-09-07T17:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 0,
		home: "cv-melilla-f",
		away: "Emevé Lugo|EME",
		duration: 120,
		events: [
			[
				25,
				"A",
				"set",
				"Set 1",
				"22-25"
			],
			[
				48,
				"H",
				"set",
				"Set 2",
				"25-20"
			],
			[
				74,
				"H",
				"set",
				"Set 3",
				"25-23"
			],
			[
				98,
				"A",
				"set",
				"Set 4",
				"19-25"
			],
			[
				115,
				"H",
				"set",
				"Set 5",
				"15-12"
			]
		]
	}),
	m({
		id: "cvmf-j1",
		league: "superliga-f",
		at: "2026-10-10T16:00:00+02:00",
		sport: "voleibol",
		venue: "Pabellón Municipal Lugo",
		jornada: 1,
		home: "Emevé Lugo|EME",
		away: "cv-melilla-f"
	}),
	m({
		id: "cvmf-j2",
		league: "superliga-f",
		sport: "voleibol",
		at: "2026-10-17T16:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 2,
		home: "cv-melilla-f",
		away: "Heidelberg Volkswagen|HEI"
	}),
	m({
		id: "cvmf-j3",
		league: "superliga-f",
		sport: "voleibol",
		at: "2026-10-24T17:00:00+02:00",
		venue: "Pabellón Municipal Haro",
		jornada: 3,
		home: "Haro Rioja Voley|HAR",
		away: "cv-melilla-f"
	}),
	m({
		id: "vdv-j1",
		league: "bm-primera-f",
		sport: "balonmano",
		at: "2026-09-06T18:00:00+02:00",
		venue: "Pabellón Lázaro Fernández",
		jornada: 1,
		home: "virgen-victoria",
		away: "BM Roquetas|ROQ",
		events: [
			[
				8,
				"H",
				"gol",
				"Simao"
			],
			[
				14,
				"A",
				"gol",
				"López"
			],
			[
				19,
				"H",
				"gol",
				"Yusef"
			],
			[
				27,
				"H",
				"gol",
				"Chicano"
			],
			[
				33,
				"A",
				"gol",
				"Martín"
			],
			[
				41,
				"H",
				"gol",
				"Bedoya"
			],
			[
				48,
				"H",
				"gol",
				"Simao"
			],
			[
				55,
				"A",
				"gol",
				"Ruiz"
			],
			[
				61,
				"H",
				"gol",
				"Quijano"
			]
		]
	}),
	m({
		id: "vdv-j2",
		league: "bm-primera-f",
		sport: "balonmano",
		at: "2026-09-12T18:30:00+02:00",
		venue: "Pabellón Lázaro Fernández",
		jornada: 2,
		home: "virgen-victoria",
		away: "Cantera Sur Almería|CSA"
	}),
	m({
		id: "vdv-j3",
		league: "bm-primera-f",
		sport: "balonmano",
		at: "2026-09-20T18:00:00+02:00",
		venue: "Pabellón Municipal Bolaños",
		jornada: 3,
		home: "BM Bolaños|BOL",
		away: "virgen-victoria"
	}),
	m({
		id: "vdv-j4",
		league: "bm-primera-f",
		sport: "balonmano",
		at: "2026-09-27T18:30:00+02:00",
		venue: "Pabellón Lázaro Fernández",
		jornada: 4,
		home: "virgen-victoria",
		away: "Helvetia Montequinto|MON"
	}),
	m({
		id: "vdv-j5",
		league: "bm-primera-f",
		sport: "balonmano",
		at: "2026-10-04T18:00:00+02:00",
		venue: "Pabellón Ciudad de Granada",
		jornada: 5,
		home: "BM Ciudad de Granada|GRA",
		away: "virgen-victoria"
	}),
	m({
		id: "tma-j1",
		league: "bm-dh-plata",
		sport: "balonmano",
		at: "2026-09-06T18:30:00+02:00",
		venue: "Pabellón Lázaro Fernández",
		jornada: 1,
		home: "t-maravillas",
		away: "BM Roquetas|ROQ",
		events: [
			[
				6,
				"H",
				"gol",
				"Thalia"
			],
			[
				11,
				"H",
				"gol",
				"Giovanna"
			],
			[
				17,
				"A",
				"gol",
				"Sánchez"
			],
			[
				24,
				"H",
				"gol",
				"Thalia"
			],
			[
				32,
				"H",
				"gol",
				"Virginia"
			],
			[
				40,
				"A",
				"gol",
				"Moreno"
			],
			[
				49,
				"H",
				"gol",
				"Siham"
			],
			[
				58,
				"H",
				"gol",
				"Thalia"
			]
		]
	}),
	m({
		id: "tma-j2",
		league: "bm-dh-plata",
		sport: "balonmano",
		at: "2026-09-13T18:30:00+02:00",
		venue: "Pabellón Lázaro Fernández",
		jornada: 2,
		home: "t-maravillas",
		away: "Estudiantes Ceuta|CEU"
	}),
	m({
		id: "tma-j3",
		league: "bm-dh-plata",
		sport: "balonmano",
		at: "2026-09-20T18:00:00+02:00",
		venue: "Pabellón Carranque",
		jornada: 3,
		home: "BM Málaga Costa del Sol B|MLG",
		away: "t-maravillas"
	}),
	m({
		id: "tma-j4",
		league: "bm-dh-plata",
		sport: "balonmano",
		at: "2026-09-27T18:30:00+02:00",
		venue: "Pabellón Lázaro Fernández",
		jornada: 4,
		home: "t-maravillas",
		away: "BM Almería|ALM"
	}),
	m({
		id: "tbn-j1",
		league: "fs-primera-f",
		sport: "futsal",
		at: "2026-09-05T18:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 1,
		home: "torreblanca",
		away: "Atlético Torcal|TOR",
		events: [
			[
				4,
				"H",
				"gol",
				"Amandinha"
			],
			[
				9,
				"A",
				"gol",
				"Lucía"
			],
			[
				14,
				"H",
				"gol",
				"Ana Luiza"
			],
			[
				19,
				"H",
				"gol",
				"Amandinha"
			],
			[
				27,
				"H",
				"gol",
				"Lydia"
			],
			[
				33,
				"A",
				"gol",
				"Carmen"
			],
			[
				38,
				"H",
				"gol",
				"Silvina"
			],
			[
				44,
				"A",
				"gol",
				"Lucía"
			]
		]
	}),
	m({
		id: "tbn-j2",
		league: "fs-primera-f",
		sport: "futsal",
		at: "2026-09-12T18:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 2,
		home: "torreblanca",
		away: "Burela FS|BUR"
	}),
	m({
		id: "tbn-j3",
		league: "fs-primera-f",
		sport: "futsal",
		at: "2026-09-19T18:00:00+02:00",
		venue: "Pabellón Municipal Ourense",
		jornada: 3,
		home: "Ourense Envialia|OUR",
		away: "torreblanca"
	}),
	m({
		id: "tbn-j4",
		league: "fs-primera-f",
		sport: "futsal",
		at: "2026-09-26T18:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 4,
		home: "torreblanca",
		away: "Futsi Atlético|FUT"
	}),
	m({
		id: "tbn-j5",
		league: "fs-primera-f",
		sport: "futsal",
		at: "2026-10-03T18:00:00+02:00",
		venue: "Pabellón Municipal Esplugues",
		jornada: 5,
		home: "AE Penya Esplugues|ESP",
		away: "torreblanca"
	}),
	m({
		id: "tbnb-j1",
		league: "fs-segunda-f",
		sport: "futsal",
		at: "2026-09-19T17:00:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 1,
		home: "torreblanca-b",
		away: "Majadahonda F.S.F./Afar 4|MAJ"
	}),
	m({
		id: "tbnb-j2",
		league: "fs-segunda-f",
		sport: "futsal",
		at: "2026-09-26T17:00:00+02:00",
		venue: "Pabellón Ramón y Cajal",
		jornada: 2,
		home: "Ramón y Cajal Féminas|RYC",
		away: "torreblanca-b"
	}),
	m({
		id: "tbnb-j3",
		league: "fs-segunda-f",
		sport: "futsal",
		at: "2026-10-03T17:00:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 3,
		home: "torreblanca-b",
		away: "Sporting Club Garrovilla|GAR"
	}),
	m({
		id: "tbnb-j4",
		league: "fs-segunda-f",
		sport: "futsal",
		at: "2026-10-10T17:00:00+02:00",
		venue: "Pabellón Municipal Almagro",
		jornada: 4,
		home: "Almagro FSF|ALM",
		away: "torreblanca-b"
	}),
	m({
		id: "tbnb-j5",
		league: "fs-segunda-f",
		sport: "futsal",
		at: "2026-10-17T17:00:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 5,
		home: "torreblanca-b",
		away: "UDAF Afanion|AFA"
	}),
	m({
		id: "tbnb-j6",
		league: "fs-segunda-f",
		sport: "futsal",
		at: "2026-10-24T17:00:00+02:00",
		venue: "Pabellón IES Luis de Camoens",
		jornada: 6,
		home: "IES Luis de Camoens|CAM",
		away: "torreblanca-b"
	}),
	m({
		id: "tbnb-j7",
		league: "fs-segunda-f",
		sport: "futsal",
		at: "2026-11-07T17:00:00+01:00",
		venue: "Pabellón Europa",
		jornada: 7,
		home: "CDE Leganés FS|LEG",
		away: "torreblanca-b"
	}),
	m({
		id: "tbnb-j10",
		league: "fs-segunda-f",
		sport: "futsal",
		at: "2026-11-21T17:00:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 10,
		home: "torreblanca-b",
		away: "CD Salesianos Puertollano|SAL"
	}),
	m({
		id: "tbnb-j11",
		league: "fs-segunda-f",
		sport: "futsal",
		at: "2026-11-28T17:00:00+01:00",
		venue: "Pabellón Municipal Dos Hermanas",
		jornada: 11,
		home: "Dos Hermanas FS|DSH",
		away: "torreblanca-b"
	}),
	m({
		id: "tbnb-j12",
		league: "fs-segunda-f",
		sport: "futsal",
		at: "2026-12-05T17:00:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 12,
		home: "torreblanca-b",
		away: "Globalcaja Albacete FS|ALB"
	}),
	m({
		id: "tbnb-j13",
		league: "fs-segunda-f",
		sport: "futsal",
		at: "2026-12-12T17:00:00+01:00",
		venue: "Pabellón Municipal Alcorcón",
		jornada: 13,
		home: "ARRIVA AD Alcorcón FSF|ALC",
		away: "torreblanca-b"
	}),
	m({
		id: "tbnb-j14",
		league: "fs-segunda-f",
		sport: "futsal",
		at: "2026-12-19T17:00:00+01:00",
		venue: "Guillermo García Pezzi",
		jornada: 14,
		home: "torreblanca-b",
		away: "Atlético Navalcarnero|NAV"
	}),
	m({
		id: "tbnb-j15",
		league: "fs-segunda-f",
		sport: "futsal",
		at: "2027-01-09T17:00:00+01:00",
		venue: "Pabellón Municipal Martos",
		jornada: 15,
		home: "Martos FS Jaén Paraíso Interior|MAR",
		away: "torreblanca-b"
	}),
	m({
		id: "tbnb-j30",
		league: "fs-segunda-f",
		sport: "futsal",
		at: "2027-05-22T17:00:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 30,
		home: "torreblanca-b",
		away: "Martos FS Jaén Paraíso Interior|MAR"
	}),
	m({
		id: "mls-pre",
		league: "fs-segunda-m",
		sport: "futsal",
		at: "2026-09-04T20:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 0,
		home: "melistar",
		away: "nueva-era",
		events: [
			[
				6,
				"H",
				"gol",
				"Cezar"
			],
			[
				15,
				"A",
				"gol",
				"Nadir"
			],
			[
				24,
				"H",
				"gol",
				"Hamadi"
			],
			[
				37,
				"H",
				"gol",
				"Cezar"
			]
		]
	}),
	m({
		id: "mls-j1",
		league: "fs-segunda-m",
		sport: "futsal",
		at: "2026-09-19T19:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 1,
		home: "melistar",
		away: "CFS Pinatar|PIN"
	}),
	m({
		id: "mls-j2",
		league: "fs-segunda-m",
		sport: "futsal",
		at: "2026-09-26T19:00:00+02:00",
		venue: "Pabellón Mataró",
		jornada: 2,
		home: "Aliança Mataró|MAT",
		away: "melistar"
	}),
	m({
		id: "mls-j3",
		league: "fs-segunda-m",
		sport: "futsal",
		at: "2026-10-03T19:00:00+02:00",
		venue: "Pabellón Príncipe Felipe",
		jornada: 3,
		home: "Colo Colo Zaragoza|CCZ",
		away: "melistar"
	}),
	m({
		id: "mls-j4",
		league: "fs-segunda-m",
		sport: "futsal",
		at: "2026-10-10T19:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 4,
		home: "melistar",
		away: "CD Leganés FS|LEG"
	}),
	m({
		id: "nera-j1",
		league: "fs-segunda-b",
		sport: "futsal",
		at: "2026-09-13T19:30:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 1,
		home: "nueva-era",
		away: "Blanca FS|BLA"
	}),
	m({
		id: "nera-j2",
		league: "fs-segunda-b",
		sport: "futsal",
		at: "2026-09-20T19:00:00+02:00",
		venue: "Palacio de los Deportes Murcia",
		jornada: 2,
		home: "ElPozo Murcia B|EPO",
		away: "nueva-era"
	}),
	m({
		id: "nera-j3",
		league: "fs-segunda-b",
		sport: "futsal",
		at: "2026-09-27T19:30:00+02:00",
		venue: "Guillermo García Pezzi",
		jornada: 3,
		home: "nueva-era",
		away: "CFS Jumilla|JUM"
	}),
	m({
		id: "nera-j4",
		league: "fs-segunda-b",
		sport: "futsal",
		at: "2026-10-04T19:00:00+02:00",
		venue: "Pabellón Municipal Bujalance",
		jornada: 4,
		home: "CD Bujalance|BUJ",
		away: "nueva-era"
	}),
	m({
		id: "dhfs-derby",
		league: "fs-dh-juv",
		sport: "futsal",
		at: "2026-09-07T19:00:00+02:00",
		venue: "Pabellón Lázaro Fernández",
		jornada: 1,
		home: "pena-rm-fs",
		away: "rusadir-fs-dh",
		events: [
			[
				8,
				"H",
				"gol",
				"Adrián"
			],
			[
				19,
				"H",
				"gol",
				"Youssef"
			],
			[
				31,
				"A",
				"gol",
				"Ayman"
			],
			[
				38,
				"H",
				"gol",
				"Adrián"
			],
			[
				46,
				"A",
				"gol",
				"Bilal"
			]
		]
	}),
	m({
		id: "rusfs-j2",
		league: "fs-dh-juv",
		sport: "futsal",
		at: "2026-09-14T18:00:00+02:00",
		venue: "Pabellón Lázaro Fernández",
		jornada: 2,
		home: "rusadir-fs-dh",
		away: "ElPozo Murcia Juvenil|EPO"
	}),
	m({
		id: "prm-j2",
		league: "fs-dh-juv",
		sport: "futsal",
		at: "2026-09-14T20:00:00+02:00",
		venue: "Pabellón Lázaro Fernández",
		jornada: 2,
		home: "pena-rm-fs",
		away: "Jaén FS Juvenil|JAE"
	}),
	m({
		id: "rusfs-j3",
		league: "fs-dh-juv",
		sport: "futsal",
		at: "2026-09-21T12:00:00+02:00",
		venue: "Palacio de los Deportes Murcia",
		jornada: 3,
		home: "Cartagena FS Juvenil|CAR",
		away: "rusadir-fs-dh"
	}),
	m({
		id: "prm-j3",
		league: "fs-dh-juv",
		sport: "futsal",
		at: "2026-09-21T18:00:00+02:00",
		venue: "Ciudad del Fútbol",
		jornada: 3,
		home: "Inter Movistar Juvenil|INT",
		away: "pena-rm-fs"
	}),
	m({
		id: "rusfs-j4",
		league: "fs-dh-juv",
		sport: "futsal",
		at: "2026-09-28T18:00:00+02:00",
		venue: "Pabellón Lázaro Fernández",
		jornada: 4,
		home: "rusadir-fs-dh",
		away: "pena-rm-fs"
	}),
	m({
		id: "bsr-pre",
		league: "bsr-segunda",
		sport: "bsr",
		at: "2026-09-07T11:00:00+02:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 0,
		home: "melilla-bsr",
		away: "Covirán Churriana|CHU",
		duration: 40,
		events: [
			[
				10,
				"H",
				"periodo",
				"Q1",
				"*14-16"
			],
			[
				20,
				"H",
				"periodo",
				"Q2",
				"*29-33"
			],
			[
				30,
				"H",
				"periodo",
				"Q3",
				"*44-49"
			],
			[
				40,
				"A",
				"punto",
				"Final",
				"*58-61"
			]
		]
	}),
	m({
		id: "bsr-j1",
		league: "bsr-segunda",
		sport: "bsr",
		at: "2026-11-29T11:00:00+01:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 1,
		home: "melilla-bsr",
		away: "Opticlass Raíces Móstoles|MOS"
	}),
	m({
		id: "bsr-j2",
		league: "bsr-segunda",
		sport: "bsr",
		at: "2026-12-14T12:00:00+01:00",
		venue: "Pabellón Bahía de Cádiz",
		jornada: 2,
		home: "CDA Bahía de Cádiz|CAD",
		away: "melilla-bsr"
	}),
	m({
		id: "bsr-j3",
		league: "bsr-segunda",
		sport: "bsr",
		at: "2027-01-18T12:00:00+01:00",
		venue: "Pabellón Churriana",
		jornada: 3,
		home: "Covirán Churriana|CHU",
		away: "melilla-bsr"
	}),
	m({
		id: "bsr-j4",
		league: "bsr-segunda",
		sport: "bsr",
		at: "2027-01-25T12:00:00+01:00",
		venue: "Javier Imbroda Ortiz",
		jornada: 4,
		home: "melilla-bsr",
		away: "BSR Fortuna Murcia|FOR"
	})
];
var matchById = Object.fromEntries(matches.map((m) => [m.id, m]));
var TICK = 1e3;
/** Stable SSR/hydration clock — early season 2026-27, Wednesday 9 Sep. */
var FALLBACK = Date.parse("2026-09-09T12:00:00+02:00");
var current = FALLBACK;
var listeners = /* @__PURE__ */ new Set();
function emit(next) {
	current = next;
	listeners.forEach((l) => l());
}
if (typeof window !== "undefined") window.setTimeout(() => {
	const tick = () => emit(Math.floor(Date.now() / TICK) * TICK);
	tick();
	window.setInterval(tick, TICK);
}, 0);
function useNow() {
	return (0, import_react.useSyncExternalStore)((cb) => {
		listeners.add(cb);
		return () => listeners.delete(cb);
	}, () => current, () => FALLBACK);
}
function kickoffMs(match, now) {
	if (match.liveElapsed != null) return now - match.liveElapsed * 6e4;
	return new Date(match.kickoff).getTime();
}
function lastScore(events, minute) {
	let home = 0;
	let away = 0;
	for (const ev of events) if (ev.minute <= minute) {
		home = ev.homeScore;
		away = ev.awayScore;
	}
	return {
		home,
		away
	};
}
function periodFor(sport, minute, duration) {
	if (sport === "futbol") {
		if (minute < 45) return "1ª parte";
		if (minute < 48) return "Descanso";
		if (minute < 93) return "2ª parte";
		return "Añadido";
	}
	if (sport === "futsal") {
		if (minute < 20) return "1ª parte";
		if (minute < 22) return "Descanso";
		return "2ª parte";
	}
	if (sport === "balonmano") {
		if (minute < 30) return "1ª parte";
		if (minute < 32) return "Descanso";
		return "2ª parte";
	}
	if (sport === "baloncesto" || sport === "bsr") return `Q${Math.min(4, Math.floor(minute / (duration / 4)) + 1)}`;
	if (sport === "voleibol") return `Set ${Math.min(5, Math.floor(minute / 22) + 1)}`;
	return `${minute}'`;
}
function clockLabel(sport, minute, duration) {
	if (sport === "futbol") {
		if (minute < 45) return `${minute}'`;
		if (minute < 48) return "DT";
		if (minute <= 90) return `${minute}'`;
		return `90+${minute - 90}'`;
	}
	if (sport === "futsal") {
		if (minute < 20) return `${minute}'`;
		if (minute < 22) return "DT";
		return `${minute}'`;
	}
	if (sport === "baloncesto" || sport === "bsr") return periodFor(sport, minute, duration);
	if (sport === "voleibol") return periodFor(sport, minute, duration);
	return `${minute}'`;
}
function resolveMatch(match, now) {
	const elapsedMin = (now - kickoffMs(match, now)) / 6e4;
	const duration = match.duration;
	if (elapsedMin < 0) return {
		...match,
		status: "scheduled",
		minute: 0,
		homeScore: 0,
		awayScore: 0,
		displayClock: "",
		happened: [],
		period: "Previsto"
	};
	const minute = Math.max(0, Math.floor(Math.min(elapsedMin, duration)));
	const happened = match.events.filter((e) => e.minute <= minute);
	const { home, away } = lastScore(match.events, minute);
	const finished = elapsedMin >= duration;
	return {
		...match,
		status: finished ? "finished" : "live",
		minute,
		homeScore: home,
		awayScore: away,
		displayClock: finished ? "Fin" : clockLabel(match.sport, minute, duration),
		happened,
		period: finished ? "Finalizado" : periodFor(match.sport, minute, duration)
	};
}
function resolveAll(now) {
	return matches.map((m) => resolveMatch(m, now));
}
function standingsFor(leagueId, now, resolved) {
	const league = leagueById[leagueId];
	if (!league) return [];
	const table = /* @__PURE__ */ new Map();
	for (const t of league.teams) table.set(t.name, {
		teamId: t.id,
		name: t.name,
		short: t.short,
		pj: 0,
		g: 0,
		e: 0,
		p: 0,
		gf: 0,
		gc: 0,
		pts: 0,
		form: []
	});
	const finished = (resolved ?? resolveAll(now)).filter((m) => m.leagueId === leagueId && m.status === "finished" && m.jornada > 0).sort((a, b) => kickoffMs(a, now) - kickoffMs(b, now));
	const apply = (name, gf, gc, scoring) => {
		const row = table.get(name);
		if (!row) return;
		row.pj += 1;
		row.gf += gf;
		row.gc += gc;
		if (gf > gc) {
			row.g += 1;
			row.pts += scoring === "volley" ? gf === 3 && gc <= 1 ? 3 : 2 : scoring === "basket" ? 1 : 3;
			row.form.push("W");
		} else if (gf < gc) {
			row.p += 1;
			if (scoring === "volley") row.pts += gf === 2 ? 1 : 0;
			row.form.push("L");
		} else {
			row.e += 1;
			if (scoring === "football") row.pts += 1;
			row.form.push("D");
		}
		if (row.form.length > 5) row.form.shift();
	};
	for (const match of finished) {
		apply(match.homeName, match.homeScore, match.awayScore, league.scoring);
		apply(match.awayName, match.awayScore, match.homeScore, league.scoring);
	}
	return [...table.values()].sort((a, b) => {
		if (b.pts !== a.pts) return b.pts - a.pts;
		const dgA = a.gf - a.gc;
		const dgB = b.gf - b.gc;
		if (dgB !== dgA) return dgB - dgA;
		if (b.gf !== a.gf) return b.gf - a.gf;
		return a.name.localeCompare(b.name, "es");
	}).map((r, i) => ({
		...r,
		pos: i + 1
	}));
}
function teamResult(match, teamId) {
	if (match.status !== "finished") return null;
	const isHome = match.homeId === teamId;
	const gf = isHome ? match.homeScore : match.awayScore;
	const gc = isHome ? match.awayScore : match.homeScore;
	if (gf > gc) return "W";
	if (gf < gc) return "L";
	return "D";
}
var MATCH_WINDOW_MS = 1296e5;
function involvesTracked(match) {
	return Boolean(match.homeId && API_TRACKED_SLUGS.has(match.homeId) || match.awayId && API_TRACKED_SLUGS.has(match.awayId));
}
function stripFakeLive(match) {
	if (!involvesTracked(match) || match.liveElapsed == null) return match;
	const { liveElapsed: _drop, ...rest } = match;
	return rest;
}
function shouldDropCatalog(match) {
	return involvesTracked(match) && match.liveElapsed != null;
}
function findOverlay(match, events) {
	if (!involvesTracked(match)) return void 0;
	const start = Date.parse(match.kickoff);
	return events.find((ev) => {
		if (ev.sport !== match.sport) return false;
		if (!(match.homeId && (ev.homeId === match.homeId || ev.awayId === match.homeId) || match.awayId && (ev.homeId === match.awayId || ev.awayId === match.awayId))) return false;
		const delta = Math.abs(Date.parse(ev.kickoff) - start);
		return Number.isFinite(delta) && delta < MATCH_WINDOW_MS;
	});
}
function applyOverlay(match, ev) {
	const happened = ev.events;
	return {
		...match,
		leagueId: ev.leagueId || match.leagueId,
		venue: ev.venue || match.venue,
		jornada: ev.isCup ? 0 : ev.jornada || match.jornada,
		homeId: ev.homeId ?? match.homeId,
		homeName: ev.homeName,
		homeShort: ev.homeShort,
		homeBadge: ev.homeBadge,
		awayId: ev.awayId ?? match.awayId,
		awayName: ev.awayName,
		awayShort: ev.awayShort,
		awayBadge: ev.awayBadge,
		kickoff: ev.kickoff,
		liveElapsed: void 0,
		events: happened,
		duration: ev.duration,
		source: "api",
		externalId: ev.externalId,
		isCup: ev.isCup,
		competition: ev.leagueName,
		status: ev.status,
		minute: ev.minute,
		homeScore: ev.status === "scheduled" ? 0 : ev.homeScore,
		awayScore: ev.status === "scheduled" ? 0 : ev.awayScore,
		displayClock: ev.displayClock,
		happened,
		period: ev.period
	};
}
function apiToResolved(ev) {
	return {
		id: `api-${ev.externalId}`,
		leagueId: ev.leagueId,
		sport: ev.sport,
		venue: ev.venue,
		jornada: ev.isCup ? 0 : ev.jornada,
		homeId: ev.homeId,
		homeName: ev.homeName,
		homeShort: ev.homeShort,
		homeBadge: ev.homeBadge,
		awayId: ev.awayId,
		awayName: ev.awayName,
		awayShort: ev.awayShort,
		awayBadge: ev.awayBadge,
		kickoff: ev.kickoff,
		events: ev.events,
		duration: ev.duration,
		source: "api",
		externalId: ev.externalId,
		isCup: ev.isCup,
		competition: ev.leagueName,
		status: ev.status,
		minute: ev.minute,
		homeScore: ev.status === "scheduled" ? 0 : ev.homeScore,
		awayScore: ev.status === "scheduled" ? 0 : ev.awayScore,
		displayClock: ev.displayClock,
		happened: ev.events,
		period: ev.period
	};
}
function buildResolvedFeed(now, snapshot) {
	const api = snapshot?.events ?? [];
	const used = /* @__PURE__ */ new Set();
	const out = [];
	for (const raw of matches) {
		if (shouldDropCatalog(raw)) continue;
		const overlay = findOverlay(raw, api);
		if (overlay) {
			used.add(overlay.externalId);
			out.push(applyOverlay(raw, overlay));
		} else out.push(resolveMatch(stripFakeLive(raw), now));
	}
	for (const ev of api) {
		if (used.has(ev.externalId)) continue;
		out.push(apiToResolved(ev));
	}
	return out;
}
function liveOf(list) {
	return list.filter((m) => m.status === "live").sort((a, b) => b.minute - a.minute);
}
function upcomingOf(list, limit = 12) {
	return list.filter((m) => m.status === "scheduled").sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff)).slice(0, limit);
}
function recentOf(list, limit = 12) {
	return list.filter((m) => m.status === "finished").sort((a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff)).slice(0, limit);
}
function todayOf(list, now) {
	const day = madridDay(now);
	return list.filter((m) => madridDay(m.kickoff) === day).sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff));
}
function madridDay(ts) {
	return new Date(ts).toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" });
}
function forTeam(list, teamId) {
	return list.filter((m) => m.homeId === teamId || m.awayId === teamId).sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff));
}
function mergeOfficialTable(leagueId, official) {
	const league = leagueById[leagueId];
	if (!league) return official;
	const byNorm = new Map(official.map((r) => [normName(r.name), r]));
	const seen = /* @__PURE__ */ new Set();
	const merged = league.teams.map((t) => {
		const hit = byNorm.get(normName(t.name));
		if (hit) {
			seen.add(normName(t.name));
			return {
				...hit,
				teamId: t.id,
				name: t.name,
				short: t.short
			};
		}
		return {
			pos: 0,
			teamId: t.id,
			name: t.name,
			short: t.short,
			pj: 0,
			g: 0,
			e: 0,
			p: 0,
			gf: 0,
			gc: 0,
			pts: 0,
			form: []
		};
	});
	for (const row of official) if (!seen.has(normName(row.name))) merged.push(row);
	merged.sort((a, b) => {
		if (b.pts !== a.pts) return b.pts - a.pts;
		const dgA = a.gf - a.gc;
		const dgB = b.gf - b.gc;
		if (dgB !== dgA) return dgB - dgA;
		if (b.gf !== a.gf) return b.gf - a.gf;
		if (b.pj !== a.pj) return b.pj - a.pj;
		return a.name.localeCompare(b.name, "es");
	});
	return merged.map((r, i) => ({
		...r,
		pos: i + 1
	}));
}
function standingsOf(leagueId, list, now, official) {
	if (official?.length) return mergeOfficialTable(leagueId, official);
	return standingsFor(leagueId, now, list);
}
function formOf(list, teamId) {
	return forTeam(list, teamId).filter((m) => m.status === "finished").slice(-5).map((m) => {
		const isHome = m.homeId === teamId;
		const gf = isHome ? m.homeScore : m.awayScore;
		const gc = isHome ? m.awayScore : m.homeScore;
		if (gf > gc) return "W";
		if (gf < gc) return "L";
		return "D";
	});
}
function nextOf(list, teamId) {
	return forTeam(list, teamId).find((m) => m.status === "scheduled");
}
/** Official scoreboard cadence — one pull per minute. */
var POLL_MS = 6e4;
var FeedContext = (0, import_react.createContext)(null);
var EMPTY = {
	fetchedAt: 0,
	ok: false,
	events: [],
	tables: {}
};
function nextPollInMs(now, updatedAt) {
	if (!updatedAt) return POLL_MS;
	return Math.max(0, POLL_MS - (now - updatedAt));
}
function makeFeed(now, snapshot, extra) {
	const all = buildResolvedFeed(now, snapshot);
	const byId = Object.fromEntries(all.map((m) => [m.id, m]));
	return {
		now,
		all,
		live: liveOf(all),
		upcoming: upcomingOf(all, 8),
		recent: recentOf(all, 8),
		today: todayOf(all, now),
		byId,
		forTeam: (id) => forTeam(all, id),
		standings: (leagueId) => standingsOf(leagueId, all, now, snapshot.tables[leagueId]),
		form: (id) => formOf(all, id),
		next: (id) => nextOf(all, id),
		ok: snapshot.ok,
		isFetching: extra.isFetching,
		fetchedAt: snapshot.fetchedAt,
		officialCount: snapshot.events.length,
		officialLive: snapshot.events.filter((e) => e.status === "live").length,
		nextPollIn: nextPollInMs(now, extra.updatedAt || snapshot.fetchedAt)
	};
}
function LiveFeedProvider({ children, initial }) {
	const now = useNow();
	const query = useQuery({
		queryKey: ["live-snapshot"],
		queryFn: () => getLiveSnapshot(),
		initialData: initial ?? void 0,
		initialDataUpdatedAt: initial?.fetchedAt,
		staleTime: 55e3,
		refetchInterval: POLL_MS,
		refetchIntervalInBackground: true,
		refetchOnWindowFocus: true,
		retry: 1
	});
	const snapshot = query.data ?? EMPTY;
	const value = (0, import_react.useMemo)(() => makeFeed(now, snapshot, {
		isFetching: query.isFetching,
		updatedAt: query.dataUpdatedAt
	}), [
		now,
		snapshot,
		query.isFetching,
		query.dataUpdatedAt
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedContext.Provider, {
		value,
		children
	});
}
function useFeed() {
	const ctx = (0, import_react.useContext)(FeedContext);
	const now = useNow();
	const fallback = (0, import_react.useMemo)(() => makeFeed(now, EMPTY, {
		isFetching: false,
		updatedAt: 0
	}), [now]);
	return ctx ?? fallback;
}
function Item({ match }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/partido/$id",
		params: { id: match.id },
		className: "mx-6 inline-flex items-center gap-3 whitespace-nowrap text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pulse-live size-1.5 rounded-full bg-live" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted",
				children: match.homeShort
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-display text-lg leading-none tabular-nums text-live",
				children: [
					match.homeScore,
					"–",
					match.awayScore
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted",
				children: match.awayShort
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs uppercase tracking-wider text-subtle",
				children: match.displayClock
			}),
			match.source === "api" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] uppercase tracking-wider text-accent",
				children: "oficial"
			})
		]
	});
}
function LiveTicker() {
	const { live } = useFeed();
	if (!live.length) return null;
	const loop = [
		...live,
		...live,
		...live,
		...live
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative w-full max-w-full overflow-x-clip border-y border-border bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex ticker py-2.5 will-change-transform",
			children: loop.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, { match: m }, `${m.id}-${i}`))
		})
	});
}
var SPORTS = [
	{
		id: "futbol",
		label: "Fútbol",
		short: "Fútbol"
	},
	{
		id: "baloncesto",
		label: "Baloncesto",
		short: "Basket"
	},
	{
		id: "voleibol",
		label: "Voleibol",
		short: "Voley"
	},
	{
		id: "balonmano",
		label: "Balonmano",
		short: "Handball"
	},
	{
		id: "futsal",
		label: "Fútbol sala",
		short: "Futsal"
	},
	{
		id: "bsr",
		label: "Silla de ruedas",
		short: "BSR"
	}
];
var sportLabel = Object.fromEntries(SPORTS.map((s) => [s.id, s.label]));
var GENDER_LABEL = {
	m: "Masculino",
	f: "Femenino",
	mixto: "Mixto"
};
function SiteShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col overflow-x-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveTicker, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Melilla Directo · Temporada 2026-27" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Marcadores oficiales de",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://www.thesportsdb.com",
							className: "text-accent hover:underline",
							target: "_blank",
							rel: "noreferrer",
							children: "TheSportsDB"
						}),
						", cada minuto. Calendario local del resto de equipos."
					] })]
				})
			})
		]
	});
}
function formatEta(ms) {
	const total = Math.ceil(ms / 1e3);
	return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
}
function FeedBar() {
	const { ok, isFetching, fetchedAt, officialCount, officialLive, nextPollIn } = useFeed();
	const stamp = fetchedAt ? new Date(fetchedAt).toLocaleTimeString("es-ES", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		timeZone: "Europe/Madrid"
	}) : "—";
	const progress = 1 - nextPollIn / POLL_MS;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-b border-border bg-surface-2/60",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5 text-[11px] uppercase tracking-wider text-muted sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex min-w-0 items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 shrink-0 rounded-full", ok ? "bg-win" : "bg-subtle", isFetching && "pulse-live") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: isFetching ? "Consultando marcadores…" : ok ? officialLive > 0 ? `Monitor 1 min · ${officialLive} en juego` : `Monitor 1 min · ${officialCount} partido${officialCount === 1 ? "" : "s"}` : "Monitor 1 min · reintentando API"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "shrink-0 tabular-nums",
				children: isFetching ? "Act. ahora" : `Act. ${stamp} · ${formatEta(nextPollIn)}`
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-px bg-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-px origin-left bg-accent transition-transform duration-1000 ease-linear",
				style: { transform: `scaleX(${Math.min(1, Math.max(0, progress))})` }
			})
		})]
	});
}
function Header() {
	const [q, setQ] = (0, import_react.useState)("");
	const navigate = useNavigate();
	const results = (0, import_react.useMemo)(() => {
		const term = q.trim().toLowerCase();
		if (term.length < 2) return [];
		return teams.filter((t) => t.name.toLowerCase().includes(term) || t.short.toLowerCase().includes(term) || t.nickname.toLowerCase().includes(term)).slice(0, 6);
	}, [q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 border-b border-border bg-bg/92 backdrop-blur-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl leading-none tracking-wide text-fg",
						children: "Melilla Directo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] uppercase tracking-[0.18em] text-muted",
						children: "Deporte en vivo"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "ml-2 hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex",
					children: SPORTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/deporte/$sport",
						params: { sport: s.id },
						className: "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SportMark, { sport: s.id }), s.label]
					}, s.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative ml-auto w-[9.5rem] sm:w-full sm:max-w-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Buscar equipo",
							"aria-label": "Buscar equipo",
							className: "h-11 w-full rounded-md border-0 bg-surface pr-3 pl-9 text-sm text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus:ring-2 focus:ring-accent/50"
						}),
						results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "absolute top-[calc(100%+6px)] right-0 left-0 z-40 overflow-hidden rounded-xl bg-surface-2 shadow-[var(--shadow-border)]",
							children: results.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-surface",
								onClick: () => {
									setQ("");
									navigate({
										to: "/equipo/$slug",
										params: { slug: t.id }
									});
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
									team: t,
									size: 28
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 truncate",
									children: t.name
								})]
							}) }, t.id))
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "flex gap-1 overflow-x-auto px-4 pb-3 lg:hidden",
			children: SPORTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/deporte/$sport",
				params: { sport: s.id },
				className: cn("inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-surface px-3 text-xs text-muted shadow-[var(--shadow-border)]"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SportMark, { sport: s.id }), s.short]
			}, s.id))
		})]
	});
}
var styles_default = "/assets/styles-SxKDDrXE.css";
var APP_NAME = "Melilla Directo";
var Route$4 = createRootRoute({
	loader: async () => {
		try {
			return await getLiveSnapshot();
		} catch {
			return null;
		}
	},
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#0c0e12"
			},
			{
				name: "description",
				content: "Resultados en directo, calendario y clasificación de los equipos de Melilla: fútbol, baloncesto, voleibol, balonmano, fútbol sala y silla de ruedas."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap"
			}
		]
	}),
	component: Root
});
function Root() {
	const initial = Route$4.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "es",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppQuery, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveFeedProvider, {
				initial,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) })
			}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
function AppQuery({ children }) {
	const [client] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		retry: 1,
		refetchOnWindowFocus: true
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client,
		children
	});
}
var $$splitComponentImporter$3 = () => import("./routes-CX0_fiiB.mjs");
var Route$3 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./deporte._sport-bZnIKa-D.mjs");
var Route$2 = createFileRoute("/deporte/$sport")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./equipo._slug-n6xpXdYW.mjs");
var Route$1 = createFileRoute("/equipo/$slug")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./partido._id-CfxQGl1P.mjs");
var Route = createFileRoute("/partido/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	DeporteSportRoute: Route$2.update({
		id: "/deporte/$sport",
		path: "/deporte/$sport",
		getParentRoute: () => Route$4
	}),
	EquipoSlugRoute: Route$1.update({
		id: "/equipo/$slug",
		path: "/equipo/$slug",
		getParentRoute: () => Route$4
	}),
	PartidoIdRoute: Route.update({
		id: "/partido/$id",
		path: "/partido/$id",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "py-20 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-5xl leading-none",
				children: "No encontrado"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Esa página no está en Melilla Directo."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-6 inline-block text-sm text-accent hover:underline",
				children: "Volver al inicio"
			})
		]
	});
}
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent,
		defaultNotFoundComponent: NotFoundComponent
	});
}
//#endregion
export { OpponentMark as _, GENDER_LABEL as a, useFeed as c, resolveMatch as d, teamResult as f, Crest as g, leagueById as h, Route$2 as i, recentOf as l, matchById as m, Route as n, SPORTS as o, useNow as p, Route$1 as r, sportLabel as s, router_exports as t, upcomingOf as u, SportMark as v, cn as y };
